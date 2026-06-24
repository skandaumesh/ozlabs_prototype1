import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Project from '@/models/Project';
import Version from '@/models/Version';
import Invoice from '@/models/Invoice';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/Motion';

export default async function DashboardOverview() {
  await dbConnect();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Fetch Stats Data
  const clientsCount = await Client.countDocuments();
  
  const pendingReviewsCount = await Version.countDocuments({ status: { $in: ['pending_review', 'changes_requested'] } });
  
  const revenueResult = await Invoice.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: startOfMonth } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
  ]);
  const revenueThisMonth = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

  const overdueInvoicesCount = await Invoice.countDocuments({
    status: { $in: ['sent', 'overdue'] },
    dueDate: { $lt: now }
  });

  // Fetch pending reviews list
  const pendingReviews = await Version.find({ status: { $in: ['pending_review', 'changes_requested'] } })
    .populate({
      path: 'projectId',
      populate: { path: 'clientId', select: 'company name clientPortalToken' }
    })
    .sort({ uploadedAt: -1 })
    .limit(5)
    .lean();

  const serialize = (obj) => JSON.parse(JSON.stringify(obj));
  const serializedPendingReviews = serialize(pendingReviews);

  return (
    <div className="space-y-8 animate-fade pb-20">
      
      {/* 1. Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white tracking-[-0.5px]">Overview</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link 
            href="/dashboard/clients/new"
            className="btn-secondary"
          >
            New Client
          </Link>
          <Link 
            href="/dashboard/projects/new"
            className="btn-primary"
          >
            New Project
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <AnimatedCard delay={0.1} className="glass p-6 card-hover flex flex-col justify-between">
          <h3 className="label-section mb-2">Revenue This Month</h3>
          <p className="stat-large"><span className="stat-unit">₹</span>{revenueThisMonth.toLocaleString('en-IN')}</p>
        </AnimatedCard>
        <AnimatedCard delay={0.2} className="glass p-6 card-hover flex flex-col justify-between">
          <h3 className="label-section mb-2">Pending Reviews</h3>
          <p className="stat-large">{pendingReviewsCount}</p>
        </AnimatedCard>
        <AnimatedCard delay={0.3} className="glass p-6 card-hover flex flex-col justify-between">
          <h3 className="label-section mb-2">Overdue Invoices</h3>
          <p className="stat-large">{overdueInvoicesCount}</p>
        </AnimatedCard>
        <AnimatedCard delay={0.4} className="glass p-6 card-hover flex flex-col justify-between">
          <h3 className="label-section mb-2">Active Clients</h3>
          <p className="stat-large">{clientsCount}</p>
        </AnimatedCard>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Pending Reviews Panel */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-white tracking-[-0.5px]">Pending Reviews</h2>
            {serializedPendingReviews.length > 0 && (
              <span className="badge badge-red">{serializedPendingReviews.length} Urgent</span>
            )}
          </div>
          
          <div className="glass overflow-hidden">
            {serializedPendingReviews.length === 0 ? (
              <div className="p-8 flex items-center justify-center text-[rgba(255,255,255,0.55)] text-sm font-semibold">
                No pending reviews. Good job.
              </div>
            ) : (
              <ul className="flex flex-col">
                {serializedPendingReviews.map((version, index) => (
                  <li key={version._id} className={`${index !== 0 ? 'divider-inset' : ''} p-5 hover:bg-[rgba(255,255,255,0.02)] transition-colors`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="font-semibold text-white text-[15px]">
                          {version.projectId?.name || 'Unknown Project'} <span className="text-[rgba(255,255,255,0.55)] text-xs ml-2">V{version.versionNumber}</span>
                        </p>
                        <p className="text-[13px] text-[rgba(255,255,255,0.55)] font-medium mt-1">
                          {version.projectId?.clientId?.company || 'Unknown Client'}
                        </p>
                      </div>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Link 
                          href={`/dashboard/projects/${version.projectId?._id}`}
                          className="btn-secondary py-2 px-3 text-xs"
                        >
                          View Project
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
