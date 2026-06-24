import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Comment from '@/models/Comment';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const comment = await Comment.findByIdAndUpdate(id, { status: 'resolved' }, { new: true });
    if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Error resolving comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
