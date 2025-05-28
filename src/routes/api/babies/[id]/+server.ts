import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

// Get a specific baby by ID
export const GET: RequestHandler = async ({ params, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;

  try {
    // Get the baby and ensure it belongs to the current user
    const babyData = await db.query.baby.findFirst({
      where: and(
        eq(baby.id, id),
        eq(baby.userId, locals.user.id)
      )
    });

    if (!babyData) {
      return json({ error: 'Baby not found' }, { status: 404 });
    }

    return json(babyData);
  } catch (error) {
    console.error('Error fetching baby:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

// Update a baby
export const PUT: RequestHandler = async ({ params, request, locals }) => {
  if (!locals.user) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  const { name, birthDate, gender } = await request.json();

  try {
    // Ensure the baby belongs to the current user
    const existingBaby = await db.query.baby.findFirst({
      where: and(
        eq(baby.id, id),
        eq(baby.userId, locals.user.id)
      )
    });

    if (!existingBaby) {
      return json({ error: 'Baby not found' }, { status: 404 });
    }

    // Update the baby
    const [updatedBaby] = await db.update(baby)
      .set({
        name,
        birthDate: new Date(birthDate),
        gender
      })
      .where(eq(baby.id, id))
      .returning();

    return json(updatedBaby);
  } catch (error) {
    console.error('Error updating baby:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};