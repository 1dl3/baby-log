import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import {
	diaperChange,
	feeding,
	itemPhoto,
	measurement,
	medication,
	milestone,
	nursing,
	photo,
	sleep
} from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { type } = params;
	let data;

	try {
		data = await request.json();
	} catch {
		return json({ error: 'Invalid JSON data' }, { status: 400 });
	}

	const { id } = data;
	if (!id) {
		return json({ error: 'Missing required parameter: id' }, { status: 400 });
	}

	try {
		let updatedItem;

		switch (type) {
			case 'diaper':
				[updatedItem] = await db
					.update(diaperChange)
					.set({
						type: data.type,
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(diaperChange.id, id))
					.returning();
				break;

			case 'feeding':
				[updatedItem] = await db
					.update(feeding)
					.set({
						type: data.feedingType || data.type,
						amount: data.amount,
						foodType: data.foodType,
						foodDetails: data.foodDetails,
						consistency: data.consistency,
						reaction: data.reaction,
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(feeding.id, id))
					.returning();
				break;

			case 'nursing':
				[updatedItem] = await db
					.update(nursing)
					.set({
						duration: data.duration,
						side: data.side,
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(nursing.id, id))
					.returning();
				break;

			case 'photo':
				[updatedItem] = await db
					.update(photo)
					.set({
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(photo.id, id))
					.returning();
				break;

			case 'measurement':
				[updatedItem] = await db
					.update(measurement)
					.set({
						height: data.height,
						weight: data.weight,
						headCircumference: data.headCircumference,
						temperature: data.temperature,
						teethCount: data.teethCount,
						measurementType: data.measurementType,
						measurementLocation: data.measurementLocation,
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(measurement.id, id))
					.returning();
				break;

			case 'sleep':
				[updatedItem] = await db
					.update(sleep)
					.set({
						startTime: data.startTime ? new Date(data.startTime) : undefined,
						endTime: data.endTime ? new Date(data.endTime) : undefined,
						duration: data.duration,
						quality: data.quality,
						location: data.location,
						notes: data.notes
					})
					.where(eq(sleep.id, id))
					.returning();
				break;

			case 'medication':
				[updatedItem] = await db
					.update(medication)
					.set({
						name: data.medicationName || data.name,
						dosage: data.dosage,
						unit: data.unit,
						reason: data.reason,
						administeredAt: data.administeredAt ? new Date(data.administeredAt) : undefined,
						notes: data.notes
					})
					.where(eq(medication.id, id))
					.returning();
				break;

			case 'milestone':
				[updatedItem] = await db
					.update(milestone)
					.set({
						category: data.category,
						title: data.title,
						description: data.description,
						achievedAt: data.achievedAt ? new Date(data.achievedAt) : undefined,
						notes: data.notes,
						photoUrl: data.photoUrl
					})
					.where(eq(milestone.id, id))
					.returning();
				break;

			default:
				return json({ error: 'Invalid log type' }, { status: 400 });
		}

		if (!updatedItem) {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json({ success: true, updatedItem });
	} catch (error) {
		console.error('Error updating log entry:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { type } = params;
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'Missing required parameter: id' }, { status: 400 });
	}

	try {
		let deletedItem;

		switch (type) {
			case 'diaper':
				// Delete associated photos first
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				// Then delete the item
				[deletedItem] = await db.delete(diaperChange).where(eq(diaperChange.id, id)).returning();
				break;

			case 'feeding':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(feeding).where(eq(feeding.id, id)).returning();
				break;

			case 'nursing':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(nursing).where(eq(nursing.id, id)).returning();
				break;

			case 'photo':
				[deletedItem] = await db.delete(photo).where(eq(photo.id, id)).returning();
				break;

			case 'measurement':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(measurement).where(eq(measurement.id, id)).returning();
				break;

			case 'sleep':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(sleep).where(eq(sleep.id, id)).returning();
				break;

			case 'medication':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(medication).where(eq(medication.id, id)).returning();
				break;

			case 'milestone':
				await db.delete(itemPhoto).where(eq(itemPhoto.itemId, id));

				[deletedItem] = await db.delete(milestone).where(eq(milestone.id, id)).returning();
				break;

			default:
				return json({ error: 'Invalid log type' }, { status: 400 });
		}

		if (!deletedItem) {
			return json({ error: 'Item not found' }, { status: 404 });
		}

		return json({ success: true, deletedItem });
	} catch (error) {
		console.error('Error deleting log entry:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};


// Helper function to move photos from temp to permanent location and return URLs
async function movePhotosFromTemp(tempPaths: string[]) {
	if (!tempPaths || tempPaths.length === 0) {
		return [];
	}

	// Create directory if it doesn't exist
	const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'logs');
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	// Process multiple photos
	const photoUrls = [];
	for (const tempPath of tempPaths) {
		// Get the filename from the temp path
		const fileName = tempPath.split('/').pop();
		if (!fileName) continue;

		// Create source and destination paths
		const sourcePath = path.join(process.cwd(), 'static', tempPath);
		const destPath = path.join(uploadDir, fileName);

		// Check if the source file exists
		if (!fs.existsSync(sourcePath)) {
			console.error(`Temp file not found: ${sourcePath}`);
			continue;
		}

		// Move the file
		fs.renameSync(sourcePath, destPath);

		// Add the URL to the list
		const url = `/uploads/logs/${fileName}`;
		photoUrls.push(url);
	}

	return photoUrls;
}

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { type } = params;
	// Variable to store moved photo URLs
	let photoUrls: string[] = [];
	let photoUrl: string | undefined;

	// Handle JSON data for all log types
	const data = await request.json();
	const {
		babyId,
		notes,
		duration,
		amount,
		side,
		photoUrl: requestPhotoUrl,
		height,
		weight: weightValue,
		diaperType,
		feedingType,
		timestamp,
		// Enhanced feeding fields
		foodType,
		foodDetails,
		consistency,
		reaction,
		// Enhanced measurement fields
		headCircumference,
		temperature,
		teethCount,
		measurementType,
		measurementLocation,
		// Sleep tracking fields
		startTime,
		endTime,
		quality,
		location,
		// Medication tracking fields
		medicationName,
		dosage,
		unit,
		reason,
		administeredAt,
		// Milestone tracking fields
		category,
		title,
		description,
		achievedAt,
		// Temporary photo paths
		tempPhotoPaths
	} = data;

	// Assign photoUrl from request if it exists
	if (requestPhotoUrl) {
		photoUrl = requestPhotoUrl;
	}
	// Move photos from temp to permanent location if tempPhotoPaths is provided
	if (tempPhotoPaths && tempPhotoPaths.length > 0) {
		photoUrls = await movePhotosFromTemp(tempPhotoPaths);
		if (photoUrls.length > 0) {
			photoUrl = photoUrls[0]; // For backward compatibility
		}
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
						type: diaperType || 'both',
						notes,
						...(timestamp ? { timestamp: new Date(timestamp) } : {})
					})
					.returning();
				break;

			case 'feeding':
				[log] = await db
					.insert(feeding)
					.values({
						userId: locals.user.id,
						babyId,
						type: feedingType || 'bottle',
						duration,
						amount,
						// Enhanced feeding fields for solid foods
						...(foodType ? { foodType } : {}),
						...(foodDetails ? { foodDetails } : {}),
						...(consistency ? { consistency } : {}),
						...(reaction ? { reaction } : {}),
						notes,
						...(timestamp ? { timestamp: new Date(timestamp) } : {})
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
						notes,
						...(timestamp ? { timestamp: new Date(timestamp) } : {})
					})
					.returning();
				break;

			case 'photo':
				// Legacy single photo handling
				[log] = await db
					.insert(photo)
					.values({
						babyId,
						userId: locals.user.id,
						photoUrl,
						notes,
						...(timestamp ? { timestamp: new Date(timestamp) } : {})
					})
					.returning();
				break;

			case 'photos': {
				// Handle multiple photos for an item
				const { itemId, itemType, tempPhotoPaths: photoPaths } = data;

				if (!itemId || !itemType) {
					return json({ error: 'Item ID and type are required' }, { status: 400 });
				}

				if (!photoPaths || photoPaths.length === 0) {
					return json({ error: 'No photos provided' }, { status: 400 });
				}

				// Move photos from temp to permanent location
				const movedPhotoUrls = await movePhotosFromTemp(photoPaths);

				// Save each photo URL in the itemPhoto table
				const savedPhotos = [];
				for (const url of movedPhotoUrls) {
					const [savedPhoto] = await db
						.insert(itemPhoto)
						.values({
							itemId,
							itemType,
							photoUrl: url
						})
						.returning();

					savedPhotos.push(savedPhoto);
				}

				log = { photos: savedPhotos };
				break;
			}

			case 'measurement':
				[log] = await db
					.insert(measurement)
					.values({
						babyId,
						userId: locals.user.id,
						height,
						weight: weightValue,
						// Enhanced measurement fields
						...(headCircumference ? { headCircumference } : {}),
						...(temperature ? { temperature } : {}),
						...(teethCount ? { teethCount } : {}),
						measurementType: measurementType || 'routine',
						measurementLocation: measurementLocation || 'home',
						notes,
						...(timestamp ? { timestamp: new Date(timestamp) } : {})
					})
					.returning();
				break;

			case 'sleep':
				[log] = await db
					.insert(sleep)
					.values({
						babyId,
						userId: locals.user.id,
						startTime: new Date(startTime),
						...(endTime ? { endTime: new Date(endTime) } : {}),
						...(endTime && startTime
							? {
									duration: Math.round(
										(new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000
									)
								}
							: {}),
						quality,
						location,
						notes,
						createdAt: new Date()
					})
					.returning();
				break;

			case 'medication':
				[log] = await db
					.insert(medication)
					.values({
						babyId,
						userId: locals.user.id,
						name: medicationName,
						dosage,
						unit,
						reason,
						administeredAt: new Date(administeredAt),
						notes,
						createdAt: new Date()
					})
					.returning();
				break;

			case 'milestone':
				[log] = await db
					.insert(milestone)
					.values({
						babyId,
						userId: locals.user.id,
						category,
						title,
						description,
						achievedAt: new Date(achievedAt),
						notes,
						...(photoUrl ? { photoUrl } : {}),
						createdAt: new Date()
					})
					.returning();
				break;

			default:
				return json({ error: 'Invalid log type' }, { status: 400 });
		}

 	// Link photos to the newly created log entry if we have photos and a valid log entry
 	// Only do this if we're not in the 'photos' type case, which handles its own photo linking
 	if (photoUrls.length > 0 && log?.id && type !== 'photos') {
 		// Use photoUrls (from moved temp photos)
 		const urls = photoUrls;

			// Save each photo URL in the itemPhoto table
			for (const url of urls) {
				await db.insert(itemPhoto).values({
					itemId: log.id,
					itemType: type,
					photoUrl: url
				});
			}

			// Add the photos to the response
			log.photos = urls;
		}

		return json(log);
	} catch (error) {
		console.error('Error creating log entry:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
