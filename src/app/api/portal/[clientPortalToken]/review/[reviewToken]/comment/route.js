import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Version from '@/models/Version';
import Comment from '@/models/Comment';
import { logActivityAndNotify } from '@/lib/activity';

export async function POST(request, { params }) {
  try {
    const { clientPortalToken, reviewToken } = await params;
    const { x, y, text, authorName } = await request.json();

    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const version = await Version.findOne({ reviewToken }).populate('projectId');
    if (!version || version.projectId.clientId.toString() !== client._id.toString()) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const comment = await Comment.create({
      versionId: version._id,
      x,
      y,
      text,
      authorName: authorName || client.name,
      authorType: 'client',
    });

    await logActivityAndNotify({
      projectId: version.projectId._id,
      versionId: version._id,
      action: `Comment added by ${authorName || client.name}`,
      performedBy: authorName || client.name,
      performedByType: 'client',
      notificationTitle: `New comment on ${version.projectId.name} V${version.versionNumber}`,
      notificationType: 'comment',
      notificationLink: `/dashboard/projects/${version.projectId._id}`,
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
