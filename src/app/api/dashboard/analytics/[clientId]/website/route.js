import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';
import WebsiteContent from '@/models/WebsiteContent';
import { auth } from '@/auth';

/**
 * GET /api/dashboard/analytics/[clientId]/website
 * 
 * Returns aggregated website analytics for the given client.
 * Query params:
 *   - period: '7d' | '30d' | '90d' (default: '30d')
 */
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { clientId } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    await dbConnect();

    // Check if tracking is set up
    const content = await WebsiteContent.findOne({ clientId }).select('apiKey').lean();

    // Calculate date range
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const previousSince = new Date(since.getTime() - days * 24 * 60 * 60 * 1000);

    const matchCurrent = { clientId: content?.clientId || clientId, timestamp: { $gte: since } };
    const matchPrevious = { clientId: content?.clientId || clientId, timestamp: { $gte: previousSince, $lt: since } };

    // Run all aggregations in parallel
    const [
      totalViews,
      previousViews,
      uniqueVisitors,
      previousUniqueVisitors,
      avgDuration,
      previousAvgDuration,
      bounceData,
      previousBounceData,
      dailyViews,
      topPages,
      referrerSources,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
    ] = await Promise.all([
      // Total page views (current period)
      PageView.countDocuments(matchCurrent),

      // Total page views (previous period for comparison)
      PageView.countDocuments(matchPrevious),

      // Unique visitors (current)
      PageView.distinct('sessionId', matchCurrent).then(ids => ids.length),

      // Unique visitors (previous)
      PageView.distinct('sessionId', matchPrevious).then(ids => ids.length),

      // Average session duration (current)
      PageView.aggregate([
        { $match: { ...matchCurrent, duration: { $gt: 0 } } },
        { $group: { _id: '$sessionId', totalDuration: { $sum: '$duration' } } },
        { $group: { _id: null, avg: { $avg: '$totalDuration' } } },
      ]),

      // Average session duration (previous)
      PageView.aggregate([
        { $match: { ...matchPrevious, duration: { $gt: 0 } } },
        { $group: { _id: '$sessionId', totalDuration: { $sum: '$duration' } } },
        { $group: { _id: null, avg: { $avg: '$totalDuration' } } },
      ]),

      // Bounce rate data (current) — sessions with only 1 page view
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$sessionId', pageCount: { $sum: 1 } } },
        { $group: { 
          _id: null, 
          total: { $sum: 1 }, 
          bounced: { $sum: { $cond: [{ $eq: ['$pageCount', 1] }, 1, 0] } } 
        }},
      ]),

      // Bounce rate data (previous)
      PageView.aggregate([
        { $match: matchPrevious },
        { $group: { _id: '$sessionId', pageCount: { $sum: 1 } } },
        { $group: { 
          _id: null, 
          total: { $sum: 1 }, 
          bounced: { $sum: { $cond: [{ $eq: ['$pageCount', 1] }, 1, 0] } } 
        }},
      ]),

      // Daily page views time series
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          views: { $sum: 1 },
          visitors: { $addToSet: '$sessionId' },
        }},
        { $project: {
          _id: 0,
          date: '$_id',
          views: 1,
          visitors: { $size: '$visitors' },
        }},
        { $sort: { date: 1 } },
      ]),

      // Top pages
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$pathname', views: { $sum: 1 }, visitors: { $addToSet: '$sessionId' } } },
        { $project: { _id: 0, page: '$_id', views: 1, visitors: { $size: '$visitors' } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      // Referrer sources
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$referrer', views: { $sum: 1 } } },
        { $project: { _id: 0, source: '$_id', views: 1 } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),

      // Device breakdown
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$device', count: { $sum: 1 } } },
        { $project: { _id: 0, device: '$_id', count: 1 } },
        { $sort: { count: -1 } },
      ]),

      // Browser breakdown
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $project: { _id: 0, browser: '$_id', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),

      // Country breakdown
      PageView.aggregate([
        { $match: matchCurrent },
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $project: { _id: 0, country: '$_id', count: 1 } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    // Calculate percentage changes
    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const currentAvgDur = avgDuration[0]?.avg || 0;
    const previousAvgDur = previousAvgDuration[0]?.avg || 0;

    const currentBounce = bounceData[0] ? Math.round((bounceData[0].bounced / bounceData[0].total) * 100) : 0;
    const previousBounce = previousBounceData[0] ? Math.round((previousBounceData[0].bounced / previousBounceData[0].total) * 100) : 0;

    return NextResponse.json({
      hasTracking: !!content?.apiKey,
      period,
      overview: {
        pageViews: totalViews,
        pageViewsChange: calcChange(totalViews, previousViews),
        uniqueVisitors,
        uniqueVisitorsChange: calcChange(uniqueVisitors, previousUniqueVisitors),
        avgDuration: Math.round(currentAvgDur),
        avgDurationChange: calcChange(currentAvgDur, previousAvgDur),
        bounceRate: currentBounce,
        bounceRateChange: calcChange(currentBounce, previousBounce),
      },
      dailyViews,
      topPages,
      referrerSources,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
    });
  } catch (error) {
    console.error('Error fetching website analytics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
