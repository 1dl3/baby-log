import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
  const { token, password } = await request.json();

  try {
    // Find user with valid reset token
    const foundUser = await db.query.user.findFirst({
      where: and(
        eq(user.resetToken, token),
        gt(user.resetTokenExpires, new Date())
      )
    });

    if (!foundUser) {
      throw error(400, 'Ungültiger oder abgelaufener Reset-Token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and clear reset token
    await db.update(user)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null
      })
      .where(eq(user.id, foundUser.id));

    return json({ message: 'Passwort erfolgreich zurückgesetzt' });
  } catch (err) {
    console.error('Password reset error:', err);
    throw error(500, 'Interner Serverfehler');
  }
}; 