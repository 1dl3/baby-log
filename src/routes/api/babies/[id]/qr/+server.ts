import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import QRCode from 'qrcode';

export const GET: RequestHandler = async ({ params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Nicht autorisiert');
  }

  try {
    // Get baby information
    const foundBaby = await db.query.baby.findFirst({
      where: eq(baby.id, id)
    });

    if (!foundBaby) {
      throw error(404, 'Baby nicht gefunden');
    }

    // Create QR code data
    const qrData = {
      type: 'baby',
      id: foundBaby.id,
      name: foundBaby.name,
      birthDate: foundBaby.birthDate,
      gender: foundBaby.gender
    };

    // Generate QR code
    const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 400
    });

    return json({ qrCode });
  } catch (err) {
    console.error('QR code generation error:', err);
    throw error(500, 'Interner Serverfehler');
  }
}; 