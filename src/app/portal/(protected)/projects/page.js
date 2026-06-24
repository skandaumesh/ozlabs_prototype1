import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Version from '@/models/Version';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/Motion';
import { FolderKanban, CheckCircle } from 'lucide-react';

export default async function ClientProjectsPage({ params }) {
  const session = await auth();
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

  const projects = await Project.find({ clientId: client._id }).sort({ createdAt: -1 }).lean();
  const projectIds = projects.map(p => p._id);

  const pendingReviews = await Version.find({
    projectId: { $in: projectIds },
    status: { $in: ['pending_review', 'changes_requested'] },
  }).sort({ uploadedAt: -1 }).lean();

  const getPendingReviewForProject = (projectId) => {
    return pendingReviews.find(r => r.projectId.toString() === projectId.toString());
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Your Projects</h1>
        <p className="text-[rgba(255,255,255,0.55)] mt-1">Track the status of all your ongoing and past work.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center glass rounded-[24px]">
            <FolderKanban size={48} className="mx-auto text-[rgba(255,255,255,0.2)] mb-4" />
            <h3 className="text-xl font-serif text-white">No projects yet</h3>
            <p className="text-[rgba(255,255,255,0.55)] mt-2">Projects created by your agency will appear here.</p>
          </div>
        ) : (
          projects.map((project, index) => {
            const pendingReview = getPendingReviewForProject(project._id);
            
            return (
              <AnimatedCard key={project._id} delay={0.1 * (index + 1)} className="glass p-6 md:p-8 rounded-[24px] flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                    <FolderKanban size={24} className="text-white" />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full ${
                    project.status === 'active' ? 'bg-[rgba(10,132,255,0.15)] text-[#0a84ff] border border-[rgba(10,132,255,0.3)]' : 
                    'bg-[rgba(48,209,88,0.15)] text-[#30d158] border border-[rgba(48,209,88,0.3)]'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-white mb-2">{project.name}</h2>
                <p className="text-sm text-[rgba(255,255,255,0.55)] mb-6 flex-1">
                  {project.type.replace('_', ' ')}
                </p>

                <div className="mt-auto space-y-4 pt-6 border-t border-[rgba(255,255,255,0.06)]">
                  {pendingReview ? (
                    <div className="p-4 rounded-xl bg-[rgba(255,159,10,0.15)] border border-[rgba(255,159,10,0.3)]">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-[#ff9f0a] uppercase tracking-wider mb-1">Action Required</p>
                          <p className="text-sm text-white font-semibold">Review Version {pendingReview.versionNumber}</p>
                        </div>
                        <Link 
                          href={`/portal/review/${pendingReview.reviewToken}`}
                          className="px-4 py-2 bg-[#ff9f0a] hover:bg-[#e08b09] text-black font-semibold rounded-lg text-xs transition-colors"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-[rgba(255,255,255,0.55)]">
                      <CheckCircle size={16} className="text-[#30d158] mr-2" />
                      Up to date
                    </div>
                  )}
                </div>
              </AnimatedCard>
            );
          })
        )}
      </div>
    </div>
  );
}
