import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Version from '@/models/Version';
import Project from '@/models/Project';
import { logActivityAndNotify } from '@/lib/activity';

export async function PATCH(request, { params }) {
  try {
    const { clientPortalToken, reviewToken } = await params;
    const { status } = await request.json();

    if (!['approved', 'changes_requested'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const version = await Version.findOne({ reviewToken }).populate('projectId');
    if (!version || version.projectId.clientId.toString() !== client._id.toString()) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    version.status = status;
    await version.save();

    // Auto-complete project on approval
    if (status === 'approved') {
      await Project.findByIdAndUpdate(version.projectId._id, { status: 'completed' });
    }

    const actionText = status === 'approved' ? 'Design approved' : 'Revision requested';
    await logActivityAndNotify({
      projectId: version.projectId._id,
      versionId: version._id,
      action: `${actionText} by ${client.name}`,
      performedBy: client.name,
      performedByType: 'client',
      notificationTitle: `${actionText}: ${version.projectId.name} V${version.versionNumber}`,
      notificationType: 'approval',
      notificationLink: `/dashboard/projects/${version.projectId._id}`,
    });

    return NextResponse.json(version);
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
