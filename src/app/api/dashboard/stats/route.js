import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Client from '@/models/Client';
import Version from '@/models/Version';
import Invoice from '@/models/Invoice';
import Project from '@/models/Project';
import { auth } from '@/auth';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [revenueResult, pendingReviewsCount, overdueCount, activeClientsCount, upcomingDueDates] = await Promise.all([
      Invoice.aggregate([
        { $match: { status: 'paid', paidAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Version.countDocuments({ status: { $in: ['pending_review', 'changes_requested'] } }),
      Invoice.countDocuments({ status: { $in: ['sent', 'overdue'] }, dueDate: { $lt: now } }),
      Client.countDocuments({}),
      Project.find({ dueDate: { $gte: now }, status: 'active' })
        .populate('clientId', 'name company')
        .sort({ dueDate: 1 })
        .limit(5)
        .lean(),
    ]);

    return NextResponse.json({
      revenueThisMonth: revenueResult[0]?.total || 0,
      pendingReviews: pendingReviewsCount,
      overdueInvoices: overdueCount,
      activeClients: activeClientsCount,
      upcomingDueDates,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
