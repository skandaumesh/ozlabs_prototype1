import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const invoices = await Invoice.find({}).populate('clientId', 'name company email').sort({ createdAt: -1 }).lean();
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { clientId, lineItems, month, year } = body;

    await dbConnect();

    const client = await Client.findById(clientId);
    if (!client) return NextResponse.json({ error: 'Client not found' }, { status: 404 });

    // Generate invoice number: OZL-YYYY-MM-NNN
    const monthStr = String(month).padStart(2, '0');
    const existingCount = await Invoice.countDocuments({ month, year });
    const invoiceNumber = `OZL-${year}-${monthStr}-${String(existingCount + 1).padStart(3, '0')}`;

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const total = Math.round((subtotal + gst) * 100) / 100;

    const invoice = await Invoice.create({
      clientId,
      invoiceNumber,
      month,
      year,
      lineItems,
      subtotal,
      gst,
      total,
      status: 'draft',
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
