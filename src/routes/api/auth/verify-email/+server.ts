import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const PUT: RequestHandler = async ({ request }) => {
  const { token } = await request.json();
  
  try {
    const [updatedUser] = await db.update(user)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(user.verificationToken, token))
      .returning();

    if (!updatedUser) {
      return json({ error: 'Ungültiger Verifizierungstoken' }, { status: 400 });
    }

    return json({ message: 'E-Mail erfolgreich verifiziert' });
  } catch (error) {
    console.error('Email verification error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}; 