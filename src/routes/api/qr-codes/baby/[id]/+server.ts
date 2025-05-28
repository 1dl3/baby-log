import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { qrCode, baby } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import QRCode from 'qrcode';

// Get all QR codes for a specific baby
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // First verify that the baby belongs to the current user
    const babyData = await db.query.baby.findFirst({
      where: and(
        eq(baby.id, id),
        eq(baby.userId, locals.user.id)
      )
    });

    if (!babyData) {
      return json({ error: 'Baby not found' }, { status: 404 });
    }

    // Get all QR codes for the baby
    const codes = await db.query.qrCode.findMany({
      where: eq(qrCode.babyId, id)
    });

    // Generate QR code images for each code
    const codesWithImages = await Promise.all(
      codes.map(async (code) => {
        const qrImage = await QRCode.toDataURL(`${process.env.APP_URL}/log/${code.type}/${code.code}`);
        return { ...code, qrImage };
      })
    );

    return json(codesWithImages);
  } catch (error) {
    console.error('Error fetching QR codes for baby:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};