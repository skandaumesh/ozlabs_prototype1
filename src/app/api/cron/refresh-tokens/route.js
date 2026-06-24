import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientIntegration from '@/models/ClientIntegration';

export async function POST(request) {
  try {
    const cronSecret = request.headers.get('x-cron-secret');
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const now = new Date();
    const soonExpiring = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    const integrations = await ClientIntegration.find({
      platform: 'instagram',
      tokenExpiresAt: { $lte: soonExpiring, $gt: now },
    });

    const results = [];

    for (const integration of integrations) {
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${process.env.META_APP_ID}&client_secret=${process.env.META_APP_SECRET}&fb_exchange_token=${integration.accessToken}`
        );
        const data = await res.json();

        if (data.access_token) {
          integration.accessToken = data.access_token;
          integration.tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
          await integration.save();
          results.push({ clientId: integration.clientId, status: 'refreshed' });
        }
      } catch (err) {
        console.error(`Failed to refresh token for client ${integration.clientId}:`, err);
        results.push({ clientId: integration.clientId, status: 'failed' });
      }
    }

    return NextResponse.json({ refreshed: results.length, results });
  } catch (error) {
    console.error('Token refresh cron error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
