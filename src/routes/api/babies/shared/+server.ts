import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { sharedBaby } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

// Get all babies shared with the current user
export const GET: RequestHandler = async ({ locals }) => {
  const userId = locals.user?.id;

  if (!userId) {
    throw error(401, 'Nicht autorisiert');
  }

  try {
    // Get all babies shared with the user
    const sharedBabies = await db.query.sharedBaby.findMany({
      where: eq(sharedBaby.userId, userId),
      with: {
        baby: true
      }
    });

    return json(sharedBabies);
  } catch (err) {
    console.error('Error fetching shared babies:', err);
    throw error(500, 'Interner Serverfehler');
  }
};