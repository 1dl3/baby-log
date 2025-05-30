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

	// Handle different content types based on log type
	if (type === 'photo' || type === 'photos') {
		// Handle multipart form data for photo uploads
		const formData = await request.formData();
		babyId = formData.get('babyId') as string;
		notes = formData.get('notes') as string;
		const itemId = formData.get('itemId') as string;
		const itemType = formData.get('itemType') as string;

		// Handle the photo file(s)
		if (type === 'photo') {
			// Single photo upload (legacy support)
			const photoFile = formData.get('photo') as File;
			if (!photoFile) {
				return json({ error: 'No photo provided' }, { status: 400 });
			}

			// In a real implementation, you would upload the file to a storage service
			// and get back a URL. For this example, we'll just use a placeholder URL.
			photoUrl = `/uploads/${Date.now()}_${photoFile.name}`;

			// TODO: Implement actual file upload to a storage service
			console.log(`Photo would be saved to: ${photoUrl}`);
		} else if (type === 'photos' && itemId && itemType) {
			// Multiple photos for an existing item
			const photoFiles = formData.getAll('photos') as File[];
			if (!photoFiles || photoFiles.length === 0) {
				return json({ error: 'No photos provided' }, { status: 400 });
			}

			// Process multiple photos
			const photoUrls = [];
			for (const photoFile of photoFiles) {
				// In a real implementation, you would upload each file to a storage service
				const url = `/uploads/${Date.now()}_${photoFile.name}`;
				photoUrls.push(url);

				// TODO: Implement actual file upload to a storage service
				console.log(`Photo would be saved to: ${url}`);
			}

			// Store the URLs for later use
			photoUrl = photoUrls[0]; // For backward compatibility
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

				// Process and save each photo
				const savedPhotos = [];
				for (const photoFile of photoFiles) {
					// In a real implementation, you would upload the file to a storage service
					const url = `/uploads/${Date.now()}_${photoFile.name}`;

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

		return json(log);
	} catch (error) {
		console.error('Error creating log entry:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
