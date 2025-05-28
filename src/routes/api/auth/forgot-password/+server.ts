import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '$lib/server/mail';
import { generateToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ request }) => {
  const { email } = await request.json();

  try {
    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, email)
    });

    if (!foundUser) {
      // Don't reveal that the email doesn't exist
      return json({ message: 'Wenn die E-Mail-Adresse registriert ist, erhalten Sie eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts.' });
    }

    const resetToken = generateToken();

    await db.update(user)
      .set({
        resetToken,
        resetTokenExpires: new Date(Date.now() + 3600000) // 1 hour from now
      })
      .where(eq(user.id, foundUser.id));

    await sendPasswordResetEmail(email, resetToken);

    return json({ message: 'Wenn die E-Mail-Adresse registriert ist, erhalten Sie eine E-Mail mit Anweisungen zum Zurücksetzen des Passworts.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}; 