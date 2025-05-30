import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, userToken } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { token, password } = await request.json();

  try {
    // Find valid reset token
    const foundToken = await db.query.userToken.findFirst({
      where: and(
        eq(userToken.token, token),
        eq(userToken.type, 'reset'),
        gt(userToken.expiresAt, new Date())
      )
    });

    if (!foundToken) {
      throw error(400, 'Ungültiger oder abgelaufener Reset-Token');
    }

    // Find the user
    const foundUser = await db.query.user.findFirst({
      where: eq(user.id, foundToken.userId)
    });

    if (!foundUser) {
      throw error(400, 'Benutzer nicht gefunden');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await db.update(user)
      .set({
        password: hashedPassword
      })
      .where(eq(user.id, foundUser.id));

    // Delete the reset token
    await db.delete(userToken)
      .where(eq(userToken.id, foundToken.id));

    return json({ message: 'Passwort erfolgreich zurückgesetzt' });
  } catch (err) {
    console.error('Password reset error:', err);
    throw error(500, 'Interner Serverfehler');
  }
}; 
