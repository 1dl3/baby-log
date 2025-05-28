import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { qrCode } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import QRCode from 'qrcode';

// Generate a new QR code
export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { babyId, type } = await request.json();

  try {
    // Generate unique code
    const code = `${type}-${babyId}-${Date.now()}`;
    
    // Generate QR code image
    const qrImage = await QRCode.toDataURL(`${process.env.APP_URL}/log/${type}/${code}`);

    // Save QR code to database
    const [newQrCode] = await db.insert(qrCode).values({
      userId: locals.user.id,
      babyId,
      type,
      code
    }).returning();

    return json({ ...newQrCode, qrImage });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Get all QR codes for a user
export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const codes = await db.query.qrCode.findMany({
      where: eq(qrCode.userId, locals.user.id)
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
    console.error('Error fetching QR codes:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}; 