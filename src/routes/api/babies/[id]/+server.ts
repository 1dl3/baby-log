import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby, sharedBaby } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get a single baby by ID
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const babyData = await db.query.baby.findFirst({
			where: eq(baby.id, params.id)
		});

		if (!babyData) {
			return json({ error: 'Baby not found' }, { status: 404 });
		}

		// Check if the user is authorized to access this baby
		if (babyData.userId !== locals.user.id) {
			// Check if the baby is shared with the user
			const sharedAccess = await db.query.sharedBaby.findFirst({
				where: and(
					eq(sharedBaby.babyId, params.id),
					eq(sharedBaby.userId, locals.user.id)
				)
			});

			if (!sharedAccess) {
				return json({ error: 'Unauthorized' }, { status: 403 });
			}
		}

		return json(babyData);
	} catch (error) {
		console.error('Error fetching baby:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Update a baby
export const PUT: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check if the baby exists and belongs to the user
		const existingBaby = await db.query.baby.findFirst({
			where: eq(baby.id, params.id)
		});

		if (!existingBaby) {
			return json({ error: 'Baby not found' }, { status: 404 });
		}

		let hasEditPermission = existingBaby.userId === locals.user.id;

		if (!hasEditPermission) {
			// Check if the user has edit permission for this shared baby
			const sharedAccess = await db.query.sharedBaby.findFirst({
				where: and(
					eq(sharedBaby.babyId, params.id),
					eq(sharedBaby.userId, locals.user.id),
					eq(sharedBaby.canEdit, true)
				)
			});

			hasEditPermission = !!sharedAccess;
		}

		if (!hasEditPermission) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Parse the form data
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const birthDate = formData.get('birthDate') as string;
		const gender = formData.get('gender') as string;
		const photoFile = formData.get('photo') as File | null;

		let photoUrl = existingBaby.photoUrl;

		// Handle photo upload if a new photo was provided
		if (photoFile && photoFile.size > 0) {
			// Create directory if it doesn't exist
			const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'babies');
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}

			// Generate a unique filename
			const fileExtension = photoFile.name.split('.').pop();
			const fileName = `${uuidv4()}.${fileExtension}`;
			const filePath = path.join(uploadDir, fileName);

			// Save the file
			const arrayBuffer = await photoFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			// Update the photo URL
			photoUrl = `/uploads/babies/${fileName}`;
		}

		// Update the baby in the database
		const [updatedBaby] = await db
			.update(baby)
			.set({
				name,
				birthDate: new Date(birthDate),
				gender,
				photoUrl
			})
			.where(eq(baby.id, params.id))
			.returning();

		return json(updatedBaby);
	} catch (error) {
		console.error('Error updating baby:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// Delete a baby
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check if the baby exists and belongs to the user
		const existingBaby = await db.query.baby.findFirst({
			where: eq(baby.id, params.id)
		});

		if (!existingBaby) {
			return json({ error: 'Baby not found' }, { status: 404 });
		}

		// Only the owner can delete a baby (not shared users)
		if (existingBaby.userId !== locals.user.id) {
			return json({ error: 'Unauthorized - only the owner can delete a baby' }, { status: 403 });
		}

		// Delete the baby's photo if it exists
		if (existingBaby.photoUrl) {
			const photoPath = path.join(process.cwd(), 'static', existingBaby.photoUrl);
			if (fs.existsSync(photoPath)) {
				fs.unlinkSync(photoPath);
			}
		}

		// Delete the baby from the database
		await db.delete(baby).where(eq(baby.id, params.id));

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting baby:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
