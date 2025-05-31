import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
	diaperChange,
	feeding,
	medication,
	milestone,
	nursing,
	sleep
} from '$lib/server/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';

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
		let key = 'timestamp';
		switch (type) {
			case 'diaper':
				stats = await db.query.diaperChange.findMany({
					where: and(
						eq(diaperChange.babyId, babyId),
						gte(diaperChange.timestamp, start),
						lte(diaperChange.timestamp, end)
					),
					orderBy: (diaperChange, { asc }) => [asc(diaperChange.timestamp)]
				});
				break;

			case 'feeding':
				stats = await db.query.feeding.findMany({
					where: and(
						eq(feeding.babyId, babyId),
						gte(feeding.timestamp, start),
						lte(feeding.timestamp, end)
					),
					orderBy: (feeding, { asc }) => [asc(feeding.timestamp)]
				});
				break;

			case 'nursing':
				stats = await db.query.nursing.findMany({
					where: and(
						eq(nursing.babyId, babyId),
						gte(nursing.timestamp, start),
						lte(nursing.timestamp, end)
					),
					orderBy: (nursing, { asc }) => [asc(nursing.timestamp)]
				});
				break;

			case 'milestone':
				key = 'achievedAt';
				stats = await db.query.milestone.findMany({
					where: and(
						eq(milestone.babyId, babyId),
						gte(milestone.achievedAt, start),
						lte(milestone.achievedAt, end)
					),
					orderBy: (milestone, { asc }) => [asc(milestone.achievedAt)]
				});
				break;

			case 'sleep':
				key = 'startTime';

				stats = await db.query.sleep.findMany({
					where: and(
						eq(sleep.babyId, babyId),
						gte(sleep.startTime, start),
						lte(sleep.startTime, end)
					),
					orderBy: (sleep, { asc }) => [asc(sleep.startTime)]
				});
				break;
			case 'medication':
				key = 'administeredAt';
				stats = await db.query.medication.findMany({
					where: and(
						eq(medication.babyId, babyId),
						gte(medication.administeredAt, start),
						lte(medication.administeredAt, end)
					),
					orderBy: (medication, { asc }) => [asc(medication.administeredAt)]
				});
				break;
			default:
				return json({ error: 'Invalid statistics type' }, { status: 400 });
		}

		// Group stats by date
		const groupedStats = stats.reduce((acc: any, curr: any) => {
			const date = new Date(curr[key]).toISOString().split('T')[0];
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
