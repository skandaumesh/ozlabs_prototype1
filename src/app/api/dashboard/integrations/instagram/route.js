import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientIntegration from '@/models/ClientIntegration';
import { auth } from '@/auth';

// Placeholder — full OAuth flow requires redirect URI setup with Meta
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId, accessToken, pageId, accountId } = await request.json();
    await dbConnect();

    const integration = await ClientIntegration.findOneAndUpdate(
      { clientId, platform: 'instagram' },
      {
        accessToken,
        pageId,
        accountId,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
        connectedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error connecting Instagram:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
