import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const contentDoc = await WebsiteContent.findOne({ clientId: session.user.id });
    
    // If Admin hasn't created a schema yet, return empty
    if (!contentDoc) {
      return NextResponse.json({ fields: [] });
    }

    return NextResponse.json(contentDoc);
  } catch (error) {
    console.error('Failed to fetch portal CMS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { updates } = await request.json(); // updates is an object: { 'hero_title': 'New Title', 'about_text': 'Hello' }

    await dbConnect();

    const contentDoc = await WebsiteContent.findOne({ clientId: session.user.id });

    if (!contentDoc) {
      return NextResponse.json({ error: 'CMS schema not found' }, { status: 404 });
    }

    // Update the values
    for (const [key, val] of Object.entries(updates)) {
      const field = contentDoc.fields.find(f => f.key === key);
      if (field) {
        field.value = val;
      }
    }

    await contentDoc.save();

    // Trigger Vercel Webhook if configured
    if (contentDoc.vercelWebhookUrl) {
      try {
        console.log(`[CMS] Triggering Vercel Webhook for Client ${contentDoc.clientId}`);
        // Fire and forget - don't await so we don't block the UI response
        fetch(contentDoc.vercelWebhookUrl, { method: 'POST' }).catch(e => console.error('Webhook fetch error:', e));
      } catch (err) {
        console.error('Failed to trigger webhook:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update portal CMS:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
