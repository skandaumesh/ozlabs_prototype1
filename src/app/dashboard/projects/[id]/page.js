import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Version from '@/models/Version';
import Activity from '@/models/Activity';
import Comment from '@/models/Comment';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Activity as ActivityIcon, Upload, Image as ImageIcon } from 'lucide-react';

export default async function ProjectDetailPage({ params }) {
  const { id } = await params;
  
  await dbConnect();

  const project = await Project.findById(id).populate('clientId').lean();
  if (!project) notFound();

  const [versions, activities] = await Promise.all([
    Version.find({ projectId: id }).sort({ versionNumber: -1 }).lean(),
    Activity.find({ projectId: id }).sort({ createdAt: -1 }).limit(20).lean(),
  ]);

  const versionIds = versions.map(v => v._id);
  const comments = await Comment.find({ versionId: { $in: versionIds } }).lean();
  
  const commentsByVersion = {};
  comments.forEach(c => {
    const vid = c.versionId.toString();
    if (!commentsByVersion[vid]) commentsByVersion[vid] = [];
    commentsByVersion[vid].push(c);
  });

  return (
    <div className="space-y-10 animate-fade max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/projects" className="text-[rgba(255,255,255,0.55)] hover:text-white transition-colors text-sm font-semibold">
            ← Back
          </Link>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">{project.name}</h1>
        </div>
        <div className="flex space-x-3">
          <Link 
            href={`/dashboard/projects/${id}/upload`}
            className="btn-primary"
          >
            <Upload size={16} className="mr-2" />
            Upload Version
          </Link>
        </div>
      </div>

      <div className="glass p-8 md:p-10 flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-1">
          <p className="label-section">Client</p>
          <Link href={`/dashboard/clients/${project.clientId._id}`} className="text-lg font-semibold text-[#0a84ff] hover:underline">
            {project.clientId.company || project.clientId.name}
          </Link>
          <p className="text-sm text-[rgba(255,255,255,0.55)]">{project.clientId.email}</p>
        </div>

        <div className="space-y-1">
          <p className="label-section">Type & Status</p>
          <p className="text-sm text-white font-semibold">{project.type.replace('_', ' ')}</p>
          <div className="mt-2">
            <span className={`badge ${project.status === 'active' ? 'badge-blue' : 'badge-green'}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="space-y-1 text-right md:text-left">
          <p className="label-section">Due Date</p>
          <p className="text-sm text-white font-semibold">{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Versions</h2>
          {versions.length === 0 ? (
            <div className="glass p-8 text-center text-[rgba(255,255,255,0.55)] text-sm font-semibold">
              No versions uploaded yet.
            </div>
          ) : (
            <div className="space-y-6">
              {versions.map((version) => {
                const vComments = commentsByVersion[version._id.toString()] || [];
                const imageUrl = version.fileUrl || (version.fileUrls && version.fileUrls.length > 0 ? version.fileUrls[0] : null);
                
                return (
                  <div key={version._id} className="glass p-6 md:p-8 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="w-full sm:w-48 h-32 bg-[rgba(255,255,255,0.03)] rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center border border-[rgba(255,255,255,0.06)] relative group">
                      {version.fileType === 'image' && imageUrl ? (
                        <img src={imageUrl} alt={`V${version.versionNumber}`} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <ImageIcon className="text-[rgba(255,255,255,0.2)]" size={32} />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-white">Version {version.versionNumber}</h3>
                        <span className={`badge ${
                          version.status === 'approved' ? 'badge-green' :
                          version.status === 'changes_requested' ? 'badge-red' : 'badge-yellow'
                        }`}>
                          {version.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex space-x-4 text-sm text-[rgba(255,255,255,0.55)]">
                        <span>Uploaded {new Date(version.uploadedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{vComments.length} comments</span>
                      </div>
                      
                      <div className="pt-4 flex gap-3">
                        <Link 
                          href={`/portal/${project.clientId.clientPortalToken || project.clientId.workspaceToken}/review/${version.reviewToken}`}
                          target="_blank"
                          className="btn-secondary py-2 px-4 text-xs"
                        >
                          View Review Page
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Activity Timeline</h2>
          <div className="glass p-6">
            {activities.length === 0 ? (
              <p className="text-[rgba(255,255,255,0.55)] text-sm text-center py-4">No activity yet.</p>
            ) : (
              <ul className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[rgba(255,255,255,0.1)] before:to-transparent">
                {activities.map((activity) => (
                  <li key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full border border-[rgba(255,255,255,0.1)] bg-[rgba(28,28,32,1)] text-[rgba(255,255,255,0.55)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 shadow-[0_0_0_4px_rgba(10,10,15,1)]">
                      <ActivityIcon size={14} />
                    </div>
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
                      <div className="flex items-center justify-between space-x-2 mb-1">
                        <div className="font-semibold text-white text-[13px]">{activity.performedBy}</div>
                        <time className="text-[11px] text-[rgba(255,255,255,0.4)]">{new Date(activity.createdAt).toLocaleDateString()}</time>
                      </div>
                      <div className="text-[rgba(255,255,255,0.6)] text-[13px] leading-tight">
                        {activity.action}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
