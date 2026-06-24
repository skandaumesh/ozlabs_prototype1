import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientIntegration from '@/models/ClientIntegration';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId } = await params;
    await dbConnect();

    const integration = await ClientIntegration.findOne({ clientId, platform: 'instagram' });
    if (!integration) return NextResponse.json({ error: 'Instagram not connected' }, { status: 404 });

    // Fetch from Meta Graph API server-side
    const baseUrl = 'https://graph.facebook.com/v19.0';
    const token = integration.accessToken;
    const igId = integration.pageId;

    const [profileRes, insightsRes, mediaRes] = await Promise.all([
      fetch(`${baseUrl}/${igId}?fields=followers_count,media_count&access_token=${token}`),
      fetch(`${baseUrl}/${igId}/insights?metric=reach,impressions,profile_views&period=day&since=${Math.floor(Date.now() / 1000) - 30 * 86400}&until=${Math.floor(Date.now() / 1000)}&access_token=${token}`),
      fetch(`${baseUrl}/${igId}/media?fields=id,caption,like_count,comments_count,reach,timestamp,media_url,media_type&limit=5&access_token=${token}`),
    ]);

    const profile = await profileRes.json();
    const insights = await insightsRes.json();
    const media = await mediaRes.json();

    return NextResponse.json({
      followers: profile.followers_count || 0,
      mediaCount: profile.media_count || 0,
      insights: insights.data || [],
      topPosts: media.data || [],
    });
  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
