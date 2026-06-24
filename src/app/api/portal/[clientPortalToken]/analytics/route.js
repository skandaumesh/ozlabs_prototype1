import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import ClientIntegration from '@/models/ClientIntegration';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    // Check for integrations and fetch data server-side
    const igIntegration = await ClientIntegration.findOne({ clientId: client._id, platform: 'instagram' });
    const gaIntegration = await ClientIntegration.findOne({ clientId: client._id, platform: 'google_analytics' });

    let instagram = null;
    if (igIntegration) {
      try {
        const baseUrl = 'https://graph.facebook.com/v19.0';
        const res = await fetch(`${baseUrl}/${igIntegration.pageId}?fields=followers_count,media_count&access_token=${igIntegration.accessToken}`);
        instagram = await res.json();
      } catch (e) {
        console.error('Instagram fetch error:', e);
      }
    }

    return NextResponse.json({
      instagram: instagram ? { followers: instagram.followers_count, posts: instagram.media_count } : null,
      googleAnalytics: gaIntegration ? { connected: true } : null,
    });
  } catch (error) {
    console.error('Error fetching portal analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
