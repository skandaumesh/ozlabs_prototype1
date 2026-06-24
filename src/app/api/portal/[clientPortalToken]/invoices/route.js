import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Invoice from '@/models/Invoice';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const invoices = await Invoice.find({ clientId: client._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching portal invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
