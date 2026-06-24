import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';
import Client from '@/models/Client';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params; // Client ID
    await dbConnect();

    let contentDoc = await WebsiteContent.findOne({ clientId: id });
    
    // If it doesn't exist, return empty fields but don't error
    if (!contentDoc) {
      return NextResponse.json({ fields: [], apiKey: null });
    }

    return NextResponse.json(contentDoc);
  } catch (error) {
    console.error('Failed to fetch client CMS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params; // Client ID
    const { fields, vercelWebhookUrl } = await request.json();

    await dbConnect();

    // Ensure client exists
    const client = await Client.findById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    let contentDoc = await WebsiteContent.findOne({ clientId: id });

    if (!contentDoc) {
      // Initialize new document
      contentDoc = await WebsiteContent.create({
        clientId: id,
        vercelWebhookUrl: vercelWebhookUrl || '',
        fields: fields || []
      });
    } else {
      // Update existing document fields
      contentDoc.fields = fields;
      contentDoc.vercelWebhookUrl = vercelWebhookUrl !== undefined ? vercelWebhookUrl : contentDoc.vercelWebhookUrl;
      await contentDoc.save();
    }

    return NextResponse.json(contentDoc);
  } catch (error) {
    console.error('Failed to update client CMS schema:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
