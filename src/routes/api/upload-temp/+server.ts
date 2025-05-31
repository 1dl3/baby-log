import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		// Check if the request is multipart form data
		const contentType = request.headers.get('content-type') || '';
		if (!contentType.includes('multipart/form-data')) {
			return json({ error: 'Invalid content type' }, { status: 400 });
		}

		const formData = await request.formData();
		const photoFiles = formData.getAll('photos') as File[];

		if (!photoFiles || photoFiles.length === 0) {
			return json({ error: 'No photos provided' }, { status: 400 });
		}

		// Create temp directory if it doesn't exist
		const tempDir = path.join(process.cwd(), 'static', 'uploads', 'temp');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// Process and save each photo to temp directory
		const tempPaths = [];
		for (const photoFile of photoFiles) {
			// Generate a unique filename
			const fileExtension = photoFile.name.split('.').pop();
			const fileName = `${Date.now()}_${uuidv4()}.${fileExtension}`;
			const filePath = path.join(tempDir, fileName);

			// Save the file
			const arrayBuffer = await photoFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			fs.writeFileSync(filePath, buffer);

			// Add the path to the list
			tempPaths.push(`/uploads/temp/${fileName}`);
		}

		return json({ success: true, tempPaths });
	} catch (error) {
		console.error('Error uploading temporary photos:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};