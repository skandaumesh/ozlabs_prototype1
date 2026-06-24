import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import { auth } from '@/auth';
import { sendEmail } from '@/lib/resend';
import { portalWelcomeTemplate } from '@/emails/portal-welcome';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const clients = await Client.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    await dbConnect();

    const client = await Client.create(body);

    // Send portal welcome email
    try {
      const portalUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/setup/${client.clientPortalToken}`;
      await sendEmail({
        to: client.email,
        subject: `Welcome to OZL Studio — ${client.company}`,
        html: portalWelcomeTemplate({ clientName: client.name, company: client.company, portalUrl }),
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
