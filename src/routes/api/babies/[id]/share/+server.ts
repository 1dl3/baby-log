import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { baby, sharedBaby, user, notification } from '$lib/server/db/schema';
import { eq, gte, and } from 'drizzle-orm';
import { generateToken } from '$lib/server/token';
import { error } from '@sveltejs/kit';
import QRCode from 'qrcode';
import { env } from '$env/dynamic/private';
import { sendInvitationEmail } from '$lib/server/mail';

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

    // Generate QR code for the share link
    const shareUrl = `${env.APP_URL}/baby/share/${shareCode}`;
    const qrImage = await QRCode.toDataURL(shareUrl);

    return json({ shareCode, qrImage, shareUrl });
  } catch (err) {
    console.error('Share code generation error:', err);
    throw error(500, 'Interner Serverfehler');
  }
};

// Invite a user via email
export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  const { id } = params;
  const userId = locals.user?.id;
  const { email, canEdit } = await request.json();

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

    // Get inviter's name
    const inviter = await db.query.user.findFirst({
      where: eq(user.id, userId)
    });

    if (!inviter) {
      throw error(500, 'Fehler beim Abrufen des Benutzernamens');
    }

    // Generate invitation code
    const invitationCode = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update baby with invitation code
    await db.update(baby)
      .set({
        invitationCode,
        invitationCodeExpires: expiresAt,
        invitationEmail: email
      })
      .where(eq(baby.id, id));

    // Find the user by email
    const invitedUser = await db.query.user.findFirst({
      where: eq(user.email, email)
    });

    if (invitedUser) {
      // User exists - create notification and share
      await db.insert(notification).values({
        userId: invitedUser.id,
        type: 'BABY_INVITATION',
        message: `${inviter.name || 'Ein Benutzer'} hat Sie eingeladen, auf das Baby-Profil von ${foundBaby.name} zuzugreifen.`,
        data: JSON.stringify({
          babyId: id,
          babyName: foundBaby.name,
          inviterId: userId,
          inviterName: inviter.name,
          canEdit,
          invitationCode
        }),
        read: false,
        createdAt: new Date()
      });

      // Check if already shared
      const existingShare = await db.query.sharedBaby.findFirst({
        where: and(
          eq(sharedBaby.babyId, id),
          eq(sharedBaby.userId, invitedUser.id)
        )
      });

      if (existingShare) {
        // Update permissions if already shared
        await db.update(sharedBaby)
          .set({ canEdit })
          .where(and(
            eq(sharedBaby.babyId, id),
            eq(sharedBaby.userId, invitedUser.id)
          ));
      }
    }

    // Send invitation email regardless of whether user exists
    await sendInvitationEmail(
      email,
      inviter.name || 'Ein Benutzer von Baby Log',
      foundBaby.name,
      invitationCode
    );

    return json({ message: 'Einladung erfolgreich gesendet' });
  } catch (err) {
    console.error('User invitation error:', err);
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
        // Check if the expiration time is greater than the current time
				gte(baby.shareCodeExpires, new Date())
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
