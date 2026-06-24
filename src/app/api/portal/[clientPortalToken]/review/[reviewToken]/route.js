import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Version from '@/models/Version';
import Comment from '@/models/Comment';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken, reviewToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const version = await Version.findOne({ reviewToken }).populate({
      path: 'projectId',
      match: { clientId: client._id },
    });

    if (!version || !version.projectId) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const comments = await Comment.find({ versionId: version._id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({ version, comments, project: version.projectId });
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
