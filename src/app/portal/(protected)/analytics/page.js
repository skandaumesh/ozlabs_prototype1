import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import { notFound } from 'next/navigation';
import AnalyticsClient from './AnalyticsClient';

export default async function ClientAnalyticsPage({ params }) {
  const session = await auth();
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Analytics & Performance</h1>
        <p className="text-[rgba(255,255,255,0.55)] mt-1">Track the growth of your connected platforms.</p>
      </div>

      <AnalyticsClient socialProfile={client.socialProfile} />
    </div>
  );
}
