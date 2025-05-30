import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, userToken } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendVerificationEmail } from '$lib/server/mail';
import { generateToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ locals }) => {
  // Check if user is authenticated
  if (!locals.user) {
    return json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  try {
    // Get user from database to check current verification status
    const userData = await db.query.user.findFirst({
      where: eq(user.id, locals.user.id),
      columns: {
        id: true,
        email: true,
        emailVerified: true
      }
    });

    if (!userData) {
      return json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    // If user is already verified, no need to send verification email
    if (userData.emailVerified) {
      return json({ message: 'E-Mail-Adresse ist bereits verifiziert' });
    }

    // Generate new verification token
    const verificationToken = generateToken();

    // Delete any existing verification tokens for this user
    await db.delete(userToken)
      .where(
        and(
          eq(userToken.userId, userData.id),
          eq(userToken.type, 'verification')
        )
      );

    // Create a new verification token in the token table
    await db.insert(userToken).values({
      userId: userData.id,
      type: 'verification',
      token: verificationToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Send verification email
    await sendVerificationEmail(userData.email, verificationToken);

    return json({ message: 'Verifizierungslink wurde erneut gesendet' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
};
