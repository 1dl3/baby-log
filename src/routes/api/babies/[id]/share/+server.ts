import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby, sharedBaby } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateToken } from '$lib/server/token';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Nicht autorisiert');
  }

  try {
    // Check if user owns the baby
    const foundBaby = await db.query.baby.findFirst({
      where: and(
        eq(baby.id, id),
        eq(baby.userId, userId)
      )
    });

    if (!foundBaby) {
      throw error(404, 'Baby nicht gefunden');
    }

    // Generate share code
    const shareCode = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update baby with share code
    await db.update(baby)
      .set({
        shareCode,
        shareCodeExpires: expiresAt
      })
      .where(eq(baby.id, id));

    return json({ shareCode });
  } catch (err) {
    console.error('Share code generation error:', err);
    throw error(500, 'Interner Serverfehler');
  }
};

export const PUT: RequestHandler = async ({ request, locals }) => {
  const { shareCode } = await request.json();
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Nicht autorisiert');
  }

  try {
    // Find baby with share code
    const foundBaby = await db.query.baby.findFirst({
      where: and(
        eq(baby.shareCode, shareCode),
        eq(baby.shareCodeExpires, new Date(Date.now()))
      )
    });

    if (!foundBaby) {
      throw error(400, 'Ungültiger oder abgelaufener Teilungscode');
    }

    // Check if already shared
    const existingShare = await db.query.sharedBaby.findFirst({
      where: and(
        eq(sharedBaby.babyId, foundBaby.id),
        eq(sharedBaby.userId, userId)
      )
    });

    if (existingShare) {
      throw error(400, 'Baby bereits geteilt');
    }

    // Create share
    await db.insert(sharedBaby).values({
      babyId: foundBaby.id,
      userId,
      canEdit: false // Default to read-only access
    });

    // Clear share code
    await db.update(baby)
      .set({
        shareCode: null,
        shareCodeExpires: null
      })
      .where(eq(baby.id, foundBaby.id));

    return json({ message: 'Baby erfolgreich geteilt' });
  } catch (err) {
    console.error('Share code redemption error:', err);
    throw error(500, 'Interner Serverfehler');
  }
}; 