import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby, sharedBaby } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

// Get all users who have access to a baby
export const GET: RequestHandler = async ({ params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Nicht autorisiert');
  }

  try {
    // Check if user owns the baby or has access to it
    const foundBaby = await db.query.baby.findFirst({
      where: eq(baby.id, id)
    });

    if (!foundBaby) {
      throw error(404, 'Baby nicht gefunden');
    }

    // Only the owner can see who has access
    if (foundBaby.userId !== userId) {
      throw error(403, 'Keine Berechtigung');
    }

    // Get all users who have access to this baby
    const sharedUsers = await db.query.sharedBaby.findMany({
      where: eq(sharedBaby.babyId, id),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return json(sharedUsers);
  } catch (err) {
    console.error('Error fetching shared users:', err);
    throw error(500, 'Interner Serverfehler');
  }
};

// Remove a user's access to a baby
export const DELETE: RequestHandler = async ({ request, params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;
  const { sharedUserId } = await request.json();

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
      throw error(404, 'Baby nicht gefunden oder keine Berechtigung');
    }

    // Remove the shared access
    await db.delete(sharedBaby)
      .where(and(
        eq(sharedBaby.babyId, id),
        eq(sharedBaby.userId, sharedUserId)
      ));

    return json({ success: true });
  } catch (err) {
    console.error('Error removing shared access:', err);
    throw error(500, 'Interner Serverfehler');
  }
};

// Update a user's access permissions
export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;
  const { sharedUserId, canEdit } = await request.json();

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
      throw error(404, 'Baby nicht gefunden oder keine Berechtigung');
    }

    // Update the shared access permissions
    await db.update(sharedBaby)
      .set({ canEdit })
      .where(and(
        eq(sharedBaby.babyId, id),
        eq(sharedBaby.userId, sharedUserId)
      ));

    return json({ success: true });
  } catch (err) {
    console.error('Error updating shared access:', err);
    throw error(500, 'Interner Serverfehler');
  }
};
