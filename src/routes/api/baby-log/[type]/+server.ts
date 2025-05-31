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
import { v4 as uuidv4 } from 'uuid';

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
				[updatedItem] = await db.update(diaperChange)
					.set({
						type: data.type,
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(diaperChange.id, id))
					.returning();
				break;

			case 'feeding':
				[updatedItem] = await db.update(feeding)
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
				[updatedItem] = await db.update(nursing)
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
				[updatedItem] = await db.update(photo)
					.set({
						notes: data.notes,
						...(data.timestamp ? { timestamp: new Date(data.timestamp) } : {})
					})
					.where(eq(photo.id, id))
					.returning();
				break;

			case 'measurement':
				[updatedItem] = await db.update(measurement)
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
				[updatedItem] = await db.update(sleep)
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
				[updatedItem] = await db.update(medication)
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
				[updatedItem] = await db.update(milestone)
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
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				// Then delete the item
				[deletedItem] = await db.delete(diaperChange)
					.where(eq(diaperChange.id, id))
					.returning();
				break;

			case 'feeding':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(feeding)
					.where(eq(feeding.id, id))
					.returning();
				break;

			case 'nursing':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(nursing)
					.where(eq(nursing.id, id))
					.returning();
				break;

			case 'photo':
				[deletedItem] = await db.delete(photo)
					.where(eq(photo.id, id))
					.returning();
				break;

			case 'measurement':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(measurement)
					.where(eq(measurement.id, id))
					.returning();
				break;

			case 'sleep':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(sleep)
					.where(eq(sleep.id, id))
					.returning();
				break;

			case 'medication':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(medication)
					.where(eq(medication.id, id))
					.returning();
				break;

			case 'milestone':
				await db.delete(itemPhoto).where(
					eq(itemPhoto.itemId, id)
				);

				[deletedItem] = await db.delete(milestone)
					.where(eq(milestone.id, id))
					.returning();
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

// Helper function to upload photos and return URLs
async function uploadPhotos(photoFiles: File[]) {
	if (!photoFiles || photoFiles.length === 0) {
		return [];
	}

	// Create directory if it doesn't exist
	const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'logs');
	if (!fs.existsSync(uploadDir)) {
		fs.mkdirSync(uploadDir, { recursive: true });
	}

	// Process multiple photos
	const photoUrls = [];
	for (const photoFile of photoFiles) {
		// Generate a unique filename
		const fileExtension = photoFile.name.split('.').pop();
		const fileName = `${Date.now()}_${uuidv4()}.${fileExtension}`;
		const filePath = path.join(uploadDir, fileName);

		// Save the file
		const arrayBuffer = await photoFile.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		fs.writeFileSync(filePath, buffer);

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
	let babyId,
		notes,
		duration,
		amount,
		side,
		photoUrl,
		height,
		weightValue,
		diaperType,
		feedingType,
		timestamp;

	// Enhanced feeding fields
	let foodType, foodDetails, consistency, reaction;

	// Enhanced measurement fields
	let headCircumference, temperature, teethCount, measurementType, measurementLocation;

	// Sleep tracking fields
	let startTime, endTime, quality, location;

	// Medication tracking fields
	let medicationName, dosage, unit, reason, administeredAt;

	// Milestone tracking fields
	let category, title, description, achievedAt;

	// For photo uploads
	let photoFiles: File[] = [];

	// Check if the request is multipart form data
	const contentType = request.headers.get('content-type') || '';
	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		babyId = formData.get('babyId') as string;
		notes = formData.get('notes') as string;
		timestamp = formData.get('timestamp') as string;

		// Get photos if they exist
		if (formData.has('photos')) {
			photoFiles = formData.getAll('photos') as File[];
		} else if (formData.has('photo')) {
			// Legacy single photo support
			const photoFile = formData.get('photo') as File;
			if (photoFile) {
				photoFiles = [photoFile];
			}
		}

		// For existing item photos
		const formItemId = formData.get('itemId') as string;
		const formItemType = formData.get('itemType') as string;

		// Get other form fields based on type
		if (type === 'feeding') {
			feedingType = formData.get('feedingType') as string;
			amount = parseFloat(formData.get('amount') as string);
			duration = parseInt(formData.get('duration') as string);
			foodType = formData.get('foodType') as string;
			foodDetails = formData.get('foodDetails') as string;
			consistency = formData.get('consistency') as string;
			reaction = formData.get('reaction') as string;
		} else if (type === 'nursing') {
			duration = parseInt(formData.get('duration') as string);
			side = formData.get('side') as string;
		} else if (type === 'diaper') {
			diaperType = formData.get('diaperType') as string;
		} else if (type === 'measurement') {
			height = parseFloat(formData.get('height') as string);
			weightValue = parseFloat(formData.get('weight') as string);
			headCircumference = parseFloat(formData.get('headCircumference') as string);
			temperature = parseFloat(formData.get('temperature') as string);
			teethCount = parseInt(formData.get('teethCount') as string);
			measurementType = formData.get('measurementType') as string;
			measurementLocation = formData.get('measurementLocation') as string;
		} else if (type === 'sleep') {
			startTime = formData.get('startTime') as string;
			endTime = formData.get('endTime') as string;
			quality = formData.get('quality') as string;
			location = formData.get('location') as string;
		} else if (type === 'medication') {
			medicationName = formData.get('medicationName') as string;
			dosage = parseFloat(formData.get('dosage') as string);
			unit = formData.get('unit') as string;
			reason = formData.get('reason') as string;
			administeredAt = formData.get('administeredAt') as string;
		} else if (type === 'milestone') {
			category = formData.get('category') as string;
			title = formData.get('title') as string;
			description = formData.get('description') as string;
			achievedAt = formData.get('achievedAt') as string;
		}

		// Handle photo uploads for all form types
		if (photoFiles.length > 0) {
			const urls = await uploadPhotos(photoFiles);

			// If we have an existing item ID and type, link photos to it
			if (formItemId && formItemType) {
				for (const url of urls) {
					await db.insert(itemPhoto)
						.values({
							itemId: formItemId,
							itemType: formItemType,
							photoUrl: url
						});
				}
			}

			if (urls.length > 0) {
				photoUrl = urls[0]; // For backward compatibility
			}
		}
	} else if (type === 'photos' && request.headers.get('content-type')?.includes('multipart/form-data')) {
		// Special case for the 'photos' type
		const formData = await request.formData();
		babyId = formData.get('babyId') as string;
		notes = formData.get('notes') as string;
		const formItemId = formData.get('itemId') as string;
		const formItemType = formData.get('itemType') as string;

		// Get photos
		photoFiles = formData.getAll('photos') as File[];

		// Handle photo uploads
		if (photoFiles.length > 0 && formItemId && formItemType) {
			const urls = await uploadPhotos(photoFiles);

			// Save photos to the itemPhoto table
			for (const url of urls) {
				await db.insert(itemPhoto)
					.values({
						itemId: formItemId,
						itemType: formItemType,
						photoUrl: url
					});
			}

			if (urls.length > 0) {
				photoUrl = urls[0]; // For backward compatibility
			}
		}
	} else {
		// Handle JSON data for other log types
		const data = await request.json();
		({
			babyId,
			notes,
			duration,
			amount,
			side,
			photoUrl,
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
			achievedAt
		} = data);
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
				const formData = await request.formData();
				const itemId = formData.get('itemId') as string;
				const itemType = formData.get('itemType') as string;

				if (!itemId || !itemType) {
					return json({ error: 'Item ID and type are required' }, { status: 400 });
				}

				const photoFiles = formData.getAll('photos') as File[];
				if (!photoFiles || photoFiles.length === 0) {
					return json({ error: 'No photos provided' }, { status: 400 });
				}

				// Create directory if it doesn't exist
				const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'logs');
				if (!fs.existsSync(uploadDir)) {
					fs.mkdirSync(uploadDir, { recursive: true });
				}

				// Process and save each photo
				const savedPhotos = [];
				for (const photoFile of photoFiles) {
					// Generate a unique filename
					const fileExtension = photoFile.name.split('.').pop();
					const fileName = `${Date.now()}_${uuidv4()}.${fileExtension}`;
					const filePath = path.join(uploadDir, fileName);

					// Save the file
					const arrayBuffer = await photoFile.arrayBuffer();
					const buffer = Buffer.from(arrayBuffer);
					fs.writeFileSync(filePath, buffer);

					// Create the URL
					const url = `/uploads/logs/${fileName}`;

					// Save the photo in the itemPhoto table
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

		// Link photos to the newly created log entry if we have photos but no existing item
		if (photoFiles.length > 0 && photoUrl && !formItemId && !formItemType && log?.id) {
			const urls = await uploadPhotos(photoFiles);

			// Save each photo URL in the itemPhoto table
			for (const url of urls) {
				await db.insert(itemPhoto)
					.values({
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
