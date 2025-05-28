import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { diaperLog, feedingLog, nursingLog } from '$lib/server/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

// Get diaper statistics for a baby
export const GET: RequestHandler = async ({ url, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const babyId = url.searchParams.get('babyId');
  const type = url.searchParams.get('type');
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');

  if (!babyId || !type) {
    return json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    let stats;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    switch (type) {
      case 'diaper':
        stats = await db.query.diaperLog.findMany({
          where: and(
            eq(diaperLog.babyId, parseInt(babyId)),
            gte(diaperLog.timestamp, start),
            lte(diaperLog.timestamp, end)
          ),
          orderBy: (diaperLog, { asc }) => [asc(diaperLog.timestamp)]
        });
        break;

      case 'feeding':
        stats = await db.query.feedingLog.findMany({
          where: and(
            eq(feedingLog.babyId, parseInt(babyId)),
            gte(feedingLog.timestamp, start),
            lte(feedingLog.timestamp, end)
          ),
          orderBy: (feedingLog, { asc }) => [asc(feedingLog.timestamp)]
        });
        break;

      case 'nursing':
        stats = await db.query.nursingLog.findMany({
          where: and(
            eq(nursingLog.babyId, parseInt(babyId)),
            gte(nursingLog.timestamp, start),
            lte(nursingLog.timestamp, end)
          ),
          orderBy: (nursingLog, { asc }) => [asc(nursingLog.timestamp)]
        });
        break;

      default:
        return json({ error: 'Invalid statistics type' }, { status: 400 });
    }

    // Group stats by date
    const groupedStats = stats.reduce((acc: any, curr: any) => {
      const date = new Date(curr.timestamp).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          count: 0,
          totalDuration: 0
        };
      }
      acc[date].count++;
      if (curr.duration) {
        acc[date].totalDuration += curr.duration;
      }
      return acc;
    }, {});

    // Convert to array format
    const formattedStats = Object.entries(groupedStats).map(([date, data]: [string, any]) => ({
      date,
      count: data.count,
      totalDuration: data.totalDuration
    }));

    return json(formattedStats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 