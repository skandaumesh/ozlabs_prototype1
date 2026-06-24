import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { auth } from '@/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const notification = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!notification) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
