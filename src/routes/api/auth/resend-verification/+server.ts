import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
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

    // Update user with new verification token
    await db.update(user)
      .set({ verificationToken })
      .where(eq(user.id, userData.id));

    // Send verification email
    await sendVerificationEmail(userData.email, verificationToken);

    return json({ message: 'Verifizierungslink wurde erneut gesendet' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
};