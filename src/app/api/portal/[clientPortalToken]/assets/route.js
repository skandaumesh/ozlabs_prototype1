import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import BrandAsset from '@/models/BrandAsset';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const asset = await BrandAsset.findOne({ clientId: client._id }).lean();
    return NextResponse.json(asset || { logoUrl: '', brandColors: [], fonts: [], files: [] });
  } catch (error) {
    console.error('Error fetching portal assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
