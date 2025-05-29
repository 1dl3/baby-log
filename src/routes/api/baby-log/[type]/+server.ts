import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { diaperChange, feeding, nursing, photo, size, weight } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { type } = params;
	let babyId, notes, duration, amount, side, photoUrl, height, weightValue;

	// Handle different content types based on log type
	if (type === 'photo') {
		// Handle multipart form data for photo uploads
		const formData = await request.formData();
		babyId = formData.get('babyId') as string;
		notes = formData.get('notes') as string;

		// Handle the photo file
		const photoFile = formData.get('photo') as File;
		if (!photoFile) {
			return json({ error: 'No photo provided' }, { status: 400 });
		}

		// In a real implementation, you would upload the file to a storage service
		// and get back a URL. For this example, we'll just use a placeholder URL.
		photoUrl = `/uploads/${Date.now()}_${photoFile.name}`;

		// TODO: Implement actual file upload to a storage service
		console.log(`Photo would be saved to: ${photoUrl}`);
	} else {
		// Handle JSON data for other log types
		const data = await request.json();
		({ babyId, notes, duration, amount, side, photoUrl, height, weight: weightValue } = data);
	}

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

			case 'photo':
				[log] = await db
					.insert(photo)
					.values({
						babyId,
						userId: locals.user.id,
						photoUrl,
						notes
					})
					.returning();
				break;

			case 'size':
				[log] = await db
					.insert(size)
					.values({
						babyId,
						userId: locals.user.id,
						height,
						notes
					})
					.returning();
				break;

			case 'weight':
				[log] = await db
					.insert(weight)
					.values({
						babyId,
						userId: locals.user.id,
						weight: weightValue,
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
