import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby, diaperChange, feeding, nursing } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Get all babies for a user
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const babies = await db.query.baby.findMany({
			where: eq(baby.userId, locals.user.id)
		});
		return json(babies);
	} catch (error) {
		console.error('Error fetching babies:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Create a new baby
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { name, birthDate, gender } = await request.json();

	try {
		const [newBaby] = await db.insert(baby).values({
			userId: locals.user.id,
			name,
			birthDate: new Date(birthDate),
			gender
		}).returning();

		return json(newBaby, { status: 201 });
	} catch (error) {
		console.error('Error creating baby:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Get logs for a baby
export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { babyId, type } = await request.json();

	try {
		let logs;
		switch (type) {
			case 'diaper':
				logs = await db.query.diaperChange.findMany({
					where: eq(diaperChange.babyId, babyId)
				});
				break;
			case 'feeding':
				logs = await db.query.feeding.findMany({
					where: eq(feeding.babyId, babyId)
				});
				break;
			case 'nursing':
				logs = await db.query.nursing.findMany({
					where: eq(nursing.babyId, babyId)
				});
				break;
			default:
				return json({ error: 'Invalid log type' }, { status: 400 });
		}

		return json(logs);
	} catch (error) {
		console.error('Error fetching logs:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
