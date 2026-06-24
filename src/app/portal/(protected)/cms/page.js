import dbConnect from '@/lib/mongodb';
import WebsiteContent from '@/models/WebsiteContent';
import { auth } from '@/auth';
import CmsClientEditor from './CmsClientEditor';

export default async function PortalCmsPage() {
  const session = await auth();
  await dbConnect();

  const contentDoc = await WebsiteContent.findOne({ clientId: session.user.id }).lean();
  
  const fields = contentDoc ? contentDoc.fields.map(f => ({
    key: f.key,
    label: f.label,
    type: f.type,
    value: f.value
  })) : [];

  return (
    <div className="space-y-10 animate-fade max-w-4xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Website Content</h1>
          <p className="text-sm text-[rgba(255,255,255,0.55)] mt-1">
            Update the text and images on your external website directly from here. Changes are applied instantly.
          </p>
        </div>
      </div>

      <div className="glass p-8 md:p-10">
        {fields.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[rgba(255,255,255,0.55)]">No editable content blocks have been configured for your website yet.</p>
          </div>
        ) : (
          <CmsClientEditor initialFields={fields} />
        )}
      </div>
    </div>
  );
}
