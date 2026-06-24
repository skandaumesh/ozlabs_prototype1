import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ClientIntegration from '@/models/ClientIntegration';
import { auth } from '@/auth';

// Placeholder — full OAuth flow requires redirect URI setup with Google
export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId, accessToken, refreshToken, accountId } = await request.json();
    await dbConnect();

    const integration = await ClientIntegration.findOneAndUpdate(
      { clientId, platform: 'google_analytics' },
      {
        accessToken,
        refreshToken,
        accountId,
        connectedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(integration);
  } catch (error) {
    console.error('Error connecting Google Analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
