import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';
import PageView from '@/models/PageView';
import { auth } from '@/auth';

/**
 * GET /api/dashboard/analytics/[clientId]/website/tracking-code
 * 
 * Returns the tracking script tag for the client's website.
 * Creates a WebsiteContent entry (with apiKey) if one doesn't exist.
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId } = await params;
    await dbConnect();

    // Find or create WebsiteContent for this client
    let content = await WebsiteContent.findOne({ clientId });
    
    if (!content) {
      // Auto-create one with a fresh API key
      content = await WebsiteContent.create({
        clientId,
        fields: [],
      });
    }

    // Get the app's base URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const scriptTag = `<script defer src="${baseUrl}/api/v1/track/script?key=${content.apiKey}"></script>`;

    // Check if we're receiving data
    const recentView = await PageView.findOne({ clientId }).sort({ timestamp: -1 }).lean();
    const isReceivingData = !!recentView;
    const lastDataAt = recentView?.timestamp || null;

    return NextResponse.json({
      apiKey: content.apiKey,
      scriptTag,
      isReceivingData,
      lastDataAt,
    });
  } catch (error) {
    console.error('Error fetching tracking code:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
