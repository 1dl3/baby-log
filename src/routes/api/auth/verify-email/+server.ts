import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, userToken } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';

export const PUT: RequestHandler = async ({ request }) => {
  const { token } = await request.json();

  try {
    // Find the token in the userToken table
    const foundToken = await db.query.userToken.findFirst({
      where: and(
        eq(userToken.token, token),
        eq(userToken.type, 'verification')
      )
    });

    if (!foundToken) {
      return json({ error: 'Ungültiger Verifizierungstoken' }, { status: 400 });
    }

    // Update the user to mark email as verified
    const [updatedUser] = await db.update(user)
      .set({ emailVerified: true })
      .where(eq(user.id, foundToken.userId))
      .returning();

    if (!updatedUser) {
      return json({ error: 'Benutzer nicht gefunden' }, { status: 400 });
    }

    // Delete the token
    await db.delete(userToken)
      .where(eq(userToken.id, foundToken.id));

    return json({ message: 'E-Mail erfolgreich verifiziert' });
  } catch (error) {
    console.error('Email verification error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}; 
