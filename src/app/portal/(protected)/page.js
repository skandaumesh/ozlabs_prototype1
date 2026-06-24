import { auth } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Version from '@/models/Version';
import Invoice from '@/models/Invoice';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { FolderKanban, Receipt, CheckCircle, Clock } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/Motion';

export default async function PortalOverviewPage({ params }) {
  const session = await auth();
  
  await dbConnect();
  
  const client = await Client.findById(session.user.id).lean();
  if (!client) notFound();

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

  const totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Welcome back, {client.name.split(' ')[0]}</h1>
          <p className="text-[rgba(255,255,255,0.55)] mt-1">Here's what's happening with your projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatedCard delay={0.1} className="glass p-6 rounded-[24px]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(10,132,255,0.15)] text-[#0a84ff] flex items-center justify-center">
              <FolderKanban size={20} />
            </div>
            <h3 className="text-[rgba(255,255,255,0.55)] font-semibold text-sm">Active Projects</h3>
          </div>
          <p className="text-3xl font-serif text-white">{projects.filter(p => p.status === 'active').length}</p>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="glass p-6 rounded-[24px]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,159,10,0.15)] text-[#ff9f0a] flex items-center justify-center">
              <Clock size={20} />
            </div>
            <h3 className="text-[rgba(255,255,255,0.55)] font-semibold text-sm">Pending Reviews</h3>
          </div>
          <p className="text-3xl font-serif text-white">{pendingReviews.length}</p>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="glass p-6 rounded-[24px]">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[rgba(255,69,58,0.15)] text-[#ff453a] flex items-center justify-center">
              <Receipt size={20} />
            </div>
            <h3 className="text-[rgba(255,255,255,0.55)] font-semibold text-sm">Outstanding Balance</h3>
          </div>
          <p className="text-3xl font-serif text-white">₹{totalUnpaid.toLocaleString('en-IN')}</p>
        </AnimatedCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <AnimatedCard delay={0.4} className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Action Required</h2>
          </div>
          
          {pendingReviews.length === 0 && unpaidInvoices.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <CheckCircle size={48} className="text-[#30d158] mb-4 opacity-80" />
              <p className="text-white font-semibold">You're all caught up!</p>
              <p className="text-[rgba(255,255,255,0.55)] text-sm mt-1">No pending reviews or unpaid invoices.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map(review => (
                <div key={review._id} className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Design Review: {review.projectId?.name}</h4>
                    <p className="text-xs text-[rgba(255,255,255,0.55)] mt-1">Version {review.versionNumber}</p>
                  </div>
                  <Link href={`/portal/review/${review.reviewToken}`} className="btn-secondary py-1.5 px-3 text-xs">
                    Review
                  </Link>
                </div>
              ))}
              
              {unpaidInvoices.map(invoice => (
                <div key={invoice._id} className="p-4 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Invoice {invoice.invoiceNumber}</h4>
                    <p className="text-xs text-[#ff453a] mt-1">Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/portal/invoices/${invoice._id}/pay`} className="btn-primary py-1.5 px-3 text-xs">
                    Pay ₹{invoice.amount}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard delay={0.5} className="glass p-6 md:p-8 rounded-[24px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Recent Projects</h2>
            <Link href={`/portal/projects`} className="text-xs font-semibold text-[#0a84ff] hover:underline">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {projects.slice(0, 4).map(project => (
              <div key={project._id} className="flex justify-between items-center border-b border-[rgba(255,255,255,0.06)] pb-4 last:border-0 last:pb-0">
                <div>
                  <h4 className="text-sm font-semibold text-white">{project.name}</h4>
                  <p className="text-xs text-[rgba(255,255,255,0.55)] mt-1">{project.type.replace('_', ' ')}</p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
                  project.status === 'active' ? 'bg-[rgba(10,132,255,0.15)] text-[#0a84ff]' : 
                  'bg-[rgba(48,209,88,0.15)] text-[#30d158]'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-center text-[rgba(255,255,255,0.55)] text-sm py-4">No projects yet.</p>
            )}
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
