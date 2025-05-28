import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { diaperChange, feeding, nursing } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { type } = params;
	const data = await request.json();
	const { babyId, notes, duration, amount, side } = data;

	try {
		let log;

		switch (type) {
			case 'diaper':
				[log] = await db
					.insert(diaperChange)
					.values({
						babyId,
						userId: locals.user.id,
						type: 'both',
						notes
					})
					.returning();
				break;

			case 'feeding':
				[log] = await db
					.insert(feeding)
					.values({
						userId: locals.user.id,
						babyId,
						type: 'bottle',
						duration,
						amount,
						notes
					})
					.returning();
				break;

			case 'nursing':
				[log] = await db
					.insert(nursing)
					.values({
						babyId,
						userId: locals.user.id,
						duration,
						side,
						notes
					})
					.returning();
				break;

			default:
				return json({ error: 'Invalid log type' }, { status: 400 });
		}

		return json(log);
	} catch (error) {
		console.error('Error creating log entry:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
