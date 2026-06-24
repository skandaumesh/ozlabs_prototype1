import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import WebsiteContent from '@/models/WebsiteContent';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CmsSchemaEditor from './CmsSchemaEditor';

export default async function ClientCmsPage({ params }) {
  const { id } = await params;
  
  await dbConnect();

  const client = await Client.findById(id).lean();
  if (!client) {
    notFound();
  }

  const contentDoc = await WebsiteContent.findOne({ clientId: id }).lean();
  
  // Clean up objectIDs for client component
  const initialFields = contentDoc ? contentDoc.fields.map(f => ({
    key: f.key,
    label: f.label,
    type: f.type,
    value: f.value
  })) : [];
  
  const apiKey = contentDoc?.apiKey || 'Not generated yet (Save schema to generate)';
  const vercelWebhookUrl = contentDoc?.vercelWebhookUrl || '';

  return (
    <div className="space-y-10 animate-fade max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-6">
          <Link href={`/dashboard/clients/${id}`} className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Website CMS</h1>
        </div>
      </div>

      <div className="glass p-8 space-y-4">
        <h2 className="text-xl font-bold text-white">Public API Endpoint</h2>
        <p className="text-sm text-[rgba(255,255,255,0.55)]">
          Provide this URL to the client's external website developer to fetch the dynamic content.
        </p>
        <div className="bg-[#111] p-4 rounded-xl border border-[rgba(255,255,255,0.1)] flex justify-between items-center">
          <code className="text-[#0a84ff] text-sm break-all font-mono">
            {process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/content/{apiKey}
          </code>
        </div>
      </div>

      <div className="glass p-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-2">Content Schema & Deployment</h2>
          <p className="text-sm text-[rgba(255,255,255,0.55)]">
            Define the flexible content fields that the client can edit in their portal, and configure automatic rebuilds.
          </p>
        </div>

        <CmsSchemaEditor clientId={id} initialFields={initialFields} initialWebhookUrl={vercelWebhookUrl} />
      </div>
    </div>
  );
}
