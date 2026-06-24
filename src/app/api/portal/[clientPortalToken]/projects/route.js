import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Version from '@/models/Version';

export async function GET(request, { params }) {
  try {
    const { clientPortalToken } = await params;
    await dbConnect();

    const client = await Client.findOne({ clientPortalToken });
    if (!client) return NextResponse.json({ error: 'Invalid portal link' }, { status: 404 });

    const projects = await Project.find({ clientId: client._id }).sort({ createdAt: -1 }).lean();

    // Get latest version status per project
    const projectsWithVersions = await Promise.all(
      projects.map(async (project) => {
        const latestVersion = await Version.findOne({ projectId: project._id }).sort({ versionNumber: -1 }).lean();
        return { ...project, latestVersion };
      })
    );

    return NextResponse.json(projectsWithVersions);
  } catch (error) {
    console.error('Error fetching portal projects:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
