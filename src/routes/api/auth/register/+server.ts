import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '$lib/server/mail';
import { generateToken } from '$lib/server/token';

export const POST: RequestHandler = async ({ request }) => {
  const { email, password, name } = await request.json();

  try {
    // Check if user already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email)
    });

    if (existingUser) {
      return json({ error: 'Email bereits registriert' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate verification token
    const verificationToken = generateToken();

    // Create user
    const [newUser] = await db.insert(user).values({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      emailVerified: false
    }).returning();

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return json({ message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mails.' });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}; 