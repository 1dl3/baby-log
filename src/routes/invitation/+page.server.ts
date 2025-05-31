import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { baby, sharedBaby } from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
  const code = url.searchParams.get('code');
  
  if (!code) {
    throw error(400, 'Kein Einladungscode angegeben');
  }

  // Find baby with invitation code
  const foundBaby = await db.query.baby.findFirst({
    where: and(
      eq(baby.invitationCode, code),
      gte(baby.invitationCodeExpires, new Date())
    )
  });

  if (!foundBaby) {
    throw error(400, 'Ungültiger oder abgelaufener Einladungscode');
  }

  return {
    baby: {
      id: foundBaby.id,
      name: foundBaby.name
    },
    invitationCode: code,
    isAuthenticated: !!locals.user
  };
};

export const actions: Actions = {
  accept: async ({ request, locals }) => {
    const data = await request.formData();
    const code = data.get('code')?.toString();
    
    if (!code) {
      throw error(400, 'Kein Einladungscode angegeben');
    }

    const userId = locals.user?.id;
    if (!userId) {
      // Redirect to login with return URL
      throw redirect(303, `/login?returnTo=${encodeURIComponent(`/invitation?code=${code}`)}`);
    }

    // Find baby with invitation code
    const foundBaby = await db.query.baby.findFirst({
      where: and(
        eq(baby.invitationCode, code),
        gte(baby.invitationCodeExpires, new Date())
      )
    });

    if (!foundBaby) {
      throw error(400, 'Ungültiger oder abgelaufener Einladungscode');
    }

    // Check if already shared
    const existingShare = await db.query.sharedBaby.findFirst({
      where: and(
        eq(sharedBaby.babyId, foundBaby.id),
        eq(sharedBaby.userId, userId)
      )
    });

    if (existingShare) {
      // Already shared, just redirect to baby page
      throw redirect(303, `/baby/${foundBaby.id}`);
    }

    // Create share
    await db.insert(sharedBaby).values({
      babyId: foundBaby.id,
      userId,
      canEdit: false // Default to read-only access
    });

    // Clear invitation code
    await db.update(baby)
      .set({
        invitationCode: null,
        invitationCodeExpires: null,
        invitationEmail: null
      })
      .where(eq(baby.id, foundBaby.id));

    throw redirect(303, `/baby/${foundBaby.id}`);
  }
};