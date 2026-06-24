import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BrandAsset from '@/models/BrandAsset';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId } = await params;
    await dbConnect();

    const asset = await BrandAsset.findOne({ clientId }).lean();
    return NextResponse.json(asset || {});
  } catch (error) {
    console.error('Error fetching brand assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
