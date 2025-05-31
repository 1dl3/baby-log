import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
	diaperChange,
	feeding,
	measurement,
	medication,
	milestone,
	nursing,
	photo,
	sleep
} from '$lib/server/db/schema';
import { and, eq, gte, lte, count } from 'drizzle-orm';

// Get log entries for a baby with pagination
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const babyId = url.searchParams.get('babyId');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '10');
	const startDate = url.searchParams.get('startDate');
	const endDate = url.searchParams.get('endDate');
	const type = url.searchParams.get('type');

	if (!babyId) {
		return json({ error: 'Missing required parameter: babyId' }, { status: 400 });
	}

	try {
		const start = startDate ? new Date(startDate) : undefined;
		const end = endDate ? new Date(endDate) : undefined;
		const offset = (page - 1) * limit;

		// Fetch log entries based on type
		let logEntries = [];
		let totalCount = 0;

		// Helper function to add type information to log entries
		const addTypeInfo = (entries: any, type: any) =>
			entries.map((entry:any) => ({ ...entry, logType: type }));

		// Fetch all types if no specific type is requested
		if (!type || type === 'all') {
			// Fetch diaper changes
			const diaperEntries = await db.query.diaperChange.findMany({
				where: and(
					eq(diaperChange.babyId, babyId),
					...(start ? [gte(diaperChange.timestamp, start)] : []),
					...(end ? [lte(diaperChange.timestamp, end)] : [])
				),
				orderBy: (diaperChange, { desc }) => [desc(diaperChange.timestamp)]
			});

			// Fetch feedings
			const feedingEntries = await db.query.feeding.findMany({
				where: and(
					eq(feeding.babyId, babyId),
					...(start ? [gte(feeding.timestamp, start)] : []),
					...(end ? [lte(feeding.timestamp, end)] : [])
				),
				orderBy: (feeding, { desc }) => [desc(feeding.timestamp)]
			});

			// Fetch nursing sessions
			const nursingEntries = await db.query.nursing.findMany({
				where: and(
					eq(nursing.babyId, babyId),
					...(start ? [gte(nursing.timestamp, start)] : []),
					...(end ? [lte(nursing.timestamp, end)] : [])
				),
				orderBy: (nursing, { desc }) => [desc(nursing.timestamp)]
			});

			// Fetch sleep sessions
			const sleepEntries = await db.query.sleep.findMany({
				where: and(
					eq(sleep.babyId, babyId),
					...(start ? [gte(sleep.startTime, start)] : []),
					...(end ? [lte(sleep.startTime, end)] : [])
				),
				orderBy: (sleepLog, { desc }) => [desc(sleepLog.startTime)]
			});

			// Fetch medications
			const medicationEntries = await db.query.medication.findMany({
				where: and(
					eq(medication.babyId, babyId),
					...(start ? [gte(medication.administeredAt, start)] : []),
					...(end ? [lte(medication.administeredAt, end)] : [])
				),
				orderBy: (medicationLog, { desc }) => [desc(medicationLog.administeredAt)]
			});

			// Fetch milestones
			const milestoneEntries = await db.query.milestone.findMany({
				where: and(
					eq(milestone.babyId, babyId),
					...(start ? [gte(milestone.achievedAt, start)] : []),
					...(end ? [lte(milestone.achievedAt, end)] : [])
				),
				orderBy: (milestoneLog, { desc }) => [desc(milestoneLog.achievedAt)]
			});

			// Fetch measurements
			const measurementEntries = await db.query.measurement.findMany({
				where: and(
					eq(measurement.babyId, babyId),
					...(start ? [gte(measurement.timestamp, start)] : []),
					...(end ? [lte(measurement.timestamp, end)] : [])
				),
				orderBy: (measurementLog, { desc }) => [desc(measurementLog.timestamp)]
			});

			// Fetch photos
			const photoEntries = await db.query.photo.findMany({
				where: and(
					eq(photo.babyId, babyId),
					...(start ? [gte(photo.timestamp, start)] : []),
					...(end ? [lte(photo.timestamp, end)] : [])
				),
				orderBy: (photoLog, { desc }) => [desc(photoLog.timestamp)]
			});

			// Combine all entries with type information
			const allEntries = [
				...addTypeInfo(diaperEntries, 'diaper'),
				...addTypeInfo(feedingEntries, 'feeding'),
				...addTypeInfo(nursingEntries, 'nursing'),
				...addTypeInfo(
					sleepEntries.map((entry) => ({
						...entry,
						timestamp: entry.startTime // Normalize timestamp field
					})),
					'sleep'
				),
				...addTypeInfo(
					medicationEntries.map((entry) => ({
						...entry,
						timestamp: entry.administeredAt // Normalize timestamp field
					})),
					'medication'
				),
				...addTypeInfo(
					milestoneEntries.map((entry) => ({
						...entry,
						timestamp: entry.achievedAt // Normalize timestamp field
					})),
					'milestone'
				),
				...addTypeInfo(measurementEntries, 'measurement'),
				...addTypeInfo(photoEntries, 'photo')
			];

			// Sort all entries by timestamp in descending order
			allEntries.sort((a, b) => {
				const dateA = new Date(a.timestamp);
				const dateB = new Date(b.timestamp);
				return dateB.getTime() - dateA.getTime();
			});

			totalCount = allEntries.length;
			logEntries = allEntries.slice(offset, offset + limit);
		} else {
			// Fetch entries for a specific type
			let countResult;

			if (type === 'diaper') {
				logEntries = await db.query.diaperChange.findMany({
					where: and(
						eq(diaperChange.babyId, babyId),
						...(start ? [gte(diaperChange.timestamp, start)] : []),
						...(end ? [lte(diaperChange.timestamp, end)] : [])
					),
					orderBy: (diaperChange, { desc }) => [desc(diaperChange.timestamp)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(diaperChange)
					.where(
						and(
							eq(diaperChange.babyId, babyId),
							...(start ? [gte(diaperChange.timestamp, start)] : []),
							...(end ? [lte(diaperChange.timestamp, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(logEntries, 'diaper');
			} else if (type === 'feeding') {
				logEntries = await db.query.feeding.findMany({
					where: and(
						eq(feeding.babyId, babyId),
						...(start ? [gte(feeding.timestamp, start)] : []),
						...(end ? [lte(feeding.timestamp, end)] : [])
					),
					orderBy: (feeding, { desc }) => [desc(feeding.timestamp)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(feeding)
					.where(
						and(
							eq(feeding.babyId, babyId),
							...(start ? [gte(feeding.timestamp, start)] : []),
							...(end ? [lte(feeding.timestamp, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(logEntries, 'feeding');
			} else if (type === 'nursing') {
				logEntries = await db.query.nursing.findMany({
					where: and(
						eq(nursing.babyId, babyId),
						...(start ? [gte(nursing.timestamp, start)] : []),
						...(end ? [lte(nursing.timestamp, end)] : [])
					),
					orderBy: (nursing, { desc }) => [desc(nursing.timestamp)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(nursing)
					.where(
						and(
							eq(nursing.babyId, babyId),
							...(start ? [gte(nursing.timestamp, start)] : []),
							...(end ? [lte(nursing.timestamp, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(logEntries, 'nursing');
			} else if (type === 'sleep') {
				logEntries = await db.query.sleep.findMany({
					where: and(
						eq(sleep.babyId, babyId),
						...(start ? [gte(sleep.startTime, start)] : []),
						...(end ? [lte(sleep.startTime, end)] : [])
					),
					orderBy: (sleepLog, { desc }) => [desc(sleepLog.startTime)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(sleep)
					.where(
						and(
							eq(sleep.babyId, babyId),
							...(start ? [gte(sleep.startTime, start)] : []),
							...(end ? [lte(sleep.startTime, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(
					logEntries.map((entry) => ({
						...entry,
						timestamp: entry.startTime // Normalize timestamp field
					})),
					'sleep'
				);
			} else if (type === 'medication') {
				logEntries = await db.query.medication.findMany({
					where: and(
						eq(medication.babyId, babyId),
						...(start ? [gte(medication.administeredAt, start)] : []),
						...(end ? [lte(medication.administeredAt, end)] : [])
					),
					orderBy: (medicationLog, { desc }) => [desc(medicationLog.administeredAt)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(medication)
					.where(
						and(
							eq(medication.babyId, babyId),
							...(start ? [gte(medication.administeredAt, start)] : []),
							...(end ? [lte(medication.administeredAt, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(
					logEntries.map((entry) => ({
						...entry,
						timestamp: entry.administeredAt // Normalize timestamp field
					})),
					'medication'
				);
			} else if (type === 'milestone') {
				logEntries = await db.query.milestone.findMany({
					where: and(
						eq(milestone.babyId, babyId),
						...(start ? [gte(milestone.achievedAt, start)] : []),
						...(end ? [lte(milestone.achievedAt, end)] : [])
					),
					orderBy: (milestoneLog, { desc }) => [desc(milestoneLog.achievedAt)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(milestone)
					.where(
						and(
							eq(milestone.babyId, babyId),
							...(start ? [gte(milestone.achievedAt, start)] : []),
							...(end ? [lte(milestone.achievedAt, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(
					logEntries.map((entry) => ({
						...entry,
						timestamp: entry.achievedAt // Normalize timestamp field
					})),
					'milestone'
				);
			} else if (type === 'measurement') {
				logEntries = await db.query.measurement.findMany({
					where: and(
						eq(measurement.babyId, babyId),
						...(start ? [gte(measurement.timestamp, start)] : []),
						...(end ? [lte(measurement.timestamp, end)] : [])
					),
					orderBy: (measurementLog, { desc }) => [desc(measurementLog.timestamp)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(measurement)
					.where(
						and(
							eq(measurement.babyId, babyId),
							...(start ? [gte(measurement.timestamp, start)] : []),
							...(end ? [lte(measurement.timestamp, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(logEntries, 'measurement');
			} else if (type === 'photo') {
				logEntries = await db.query.photo.findMany({
					where: and(
						eq(photo.babyId, babyId),
						...(start ? [gte(photo.timestamp, start)] : []),
						...(end ? [lte(photo.timestamp, end)] : [])
					),
					orderBy: (photoLog, { desc }) => [desc(photoLog.timestamp)],
					limit,
					offset
				});

				countResult = await db
					.select({ count: count() })
					.from(photo)
					.where(
						and(
							eq(photo.babyId, babyId),
							...(start ? [gte(photo.timestamp, start)] : []),
							...(end ? [lte(photo.timestamp, end)] : [])
						)
					);
				totalCount = countResult[0].count;
				logEntries = addTypeInfo(logEntries, 'photo');
			} else {
				return json({ error: 'Invalid log type' }, { status: 400 });
			}
		}

		return json({
			entries: logEntries,
			pagination: {
				page,
				limit,
				totalCount,
				totalPages: Math.ceil(totalCount / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching log entries:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
