import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Version from '@/models/Version';
import Activity from '@/models/Activity';
import Comment from '@/models/Comment';
import { auth } from '@/auth';

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const project = await Project.findById(id).populate('clientId').lean();
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const versions = await Version.find({ projectId: id }).sort({ versionNumber: -1 }).lean();

    // Get comment counts per version
    const versionIds = versions.map(v => v._id);
    const comments = await Comment.find({ versionId: { $in: versionIds } }).lean();
    const commentsByVersion = {};
    comments.forEach(c => {
      const vid = c.versionId.toString();
      if (!commentsByVersion[vid]) commentsByVersion[vid] = [];
      commentsByVersion[vid].push(c);
    });

    const versionsWithComments = versions.map(v => ({
      ...v,
      comments: commentsByVersion[v._id.toString()] || [],
    }));

    const activities = await Activity.find({ projectId: id }).sort({ createdAt: -1 }).limit(50).lean();

    return NextResponse.json({ project, versions: versionsWithComments, activities });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
