import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { and, eq } from 'drizzle-orm';
import { qrCode } from '$lib/server/db/schema';

// Get all QR codes for a specific baby
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id } = params;

	try {
		const code = await db.query.qrCode.findFirst({
			where: and(eq(qrCode.code, id), eq(qrCode.userId, locals.user.id))
		});

		if (!code) {
			return json({ error: 'Code not found' }, { status: 404 });
		}

		return json(code);
	} catch (error) {
		console.error('Error fetching QR codes for baby:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
