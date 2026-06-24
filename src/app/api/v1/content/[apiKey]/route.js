import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';

export async function GET(request, { params }) {
  try {
    const { apiKey } = await params;

    await dbConnect();

    const contentDoc = await WebsiteContent.findOne({ apiKey });

    if (!contentDoc) {
      return NextResponse.json({ error: 'Invalid API Key or Content Not Found' }, { status: 404 });
    }

    // Transform the array of fields into a flat JSON object for the external website
    const contentPayload = {};
    contentDoc.fields.forEach(field => {
      contentPayload[field.key] = field.value;
    });

    return NextResponse.json(contentPayload, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow any external site to fetch this
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300', // Cache for performance
      }
    });

  } catch (error) {
    console.error('Failed to fetch headless CMS content:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
