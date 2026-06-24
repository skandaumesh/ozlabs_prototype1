import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Version from '@/models/Version';
import Comment from '@/models/Comment';
import { notFound } from 'next/navigation';
import ClientReviewPage from './page-client';

export default async function ReviewPage({ params }) {
  const session = await auth();
  const { reviewToken } = await params;

  await dbConnect();

  const version = await Version.findOne({ reviewToken })
    .populate({
      path: 'projectId',
      populate: { path: 'clientId' }
    })
    .lean();

  if (!version || version.projectId.clientId._id.toString() !== session.user.id) {
    notFound();
  }

  const comments = await Comment.find({ versionId: version._id }).sort({ createdAt: 1 }).lean();

  // Convert ObjectIds to strings
  const serialize = (obj) => JSON.parse(JSON.stringify(obj));

  return (
    <ClientReviewPage 
      version={serialize(version)} 
      comments={serialize(comments)} 
      portalToken={""}
    />
  );
}
