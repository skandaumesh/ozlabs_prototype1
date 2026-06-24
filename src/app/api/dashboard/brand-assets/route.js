import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BrandAsset from '@/models/BrandAsset';
import { auth } from '@/auth';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { clientId, logoUrl, brandColors, fonts, files } = body;
    await dbConnect();

    const asset = await BrandAsset.findOneAndUpdate(
      { clientId },
      { logoUrl, brandColors, fonts, files },
      { new: true, upsert: true }
    );

    return NextResponse.json(asset);
  } catch (error) {
    console.error('Error saving brand assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
