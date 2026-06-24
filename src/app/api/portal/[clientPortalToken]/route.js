import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Version from '@/models/Version';
import Invoice from '@/models/Invoice';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken }).lean();
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const projects = await Project.find({ clientId: client._id }).sort({ createdAt: -1 }).lean();
    const projectIds = projects.map(p => p._id);

    const pendingReviews = await Version.find({
      projectId: { $in: projectIds },
      status: { $in: ['pending_review', 'changes_requested'] },
    }).populate('projectId', 'name').sort({ uploadedAt: -1 }).lean();

    const unpaidInvoices = await Invoice.find({
      clientId: client._id,
      status: { $in: ['sent', 'overdue'] },
    }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      client: { name: client.name, company: client.company },
      projects,
      pendingReviews,
      unpaidInvoices,
    });
  } catch (error) {
    console.error('Error fetching portal overview:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
