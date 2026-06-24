import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Version from '@/models/Version';
import Project from '@/models/Project';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';
import { logActivityAndNotify } from '@/lib/activity';
import { sendEmail } from '@/lib/resend';
import { reviewLinkTemplate } from '@/emails/review-link';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const files = formData.getAll('files');
    const projectId = formData.get('projectId');

    if (!files || files.length === 0 || !projectId) {
      return NextResponse.json({ error: 'Files and projectId are required' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 });
    }

    await dbConnect();

    const project = await Project.findById(projectId).populate('clientId');
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Upload all files to Cloudinary
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: `ozlabs/${projectId}`, resource_type: 'auto' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
    });

    const fileUrls = await Promise.all(uploadPromises);

    // Determine next version number
    const lastVersion = await Version.findOne({ projectId }).sort({ versionNumber: -1 });
    const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

    const fileType = files[0].type.startsWith('image/') ? 'image' : 'pdf';

    const version = await Version.create({
      projectId,
      versionNumber: nextVersionNumber,
      fileUrls,
      fileType,
    });

    // Log activity
    await logActivityAndNotify({
      projectId,
      versionId: version._id,
      action: `Version ${nextVersionNumber} uploaded`,
      performedBy: session.user.name || 'Admin',
      performedByType: 'admin',
      notificationTitle: `New version uploaded for ${project.name}`,
      notificationType: 'review',
      notificationLink: `/dashboard/projects/${projectId}`,
    });

    // Send review email to client
    const client = project.clientId;
    if (client?.email) {
      try {
        const portalReviewUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/portal/${client.clientPortalToken}/review/${version.reviewToken}`;
        await sendEmail({
          to: client.email,
          subject: `Review Required: ${project.name} (V${nextVersionNumber})`,
          html: reviewLinkTemplate({ clientName: client.name, projectName: project.name, reviewUrl: portalReviewUrl }),
        });
      } catch (emailErr) {
        console.error('Failed to send review email:', emailErr);
      }
    }

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error('Error uploading version:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
