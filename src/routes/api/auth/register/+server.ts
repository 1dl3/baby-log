import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user, userToken } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '$lib/server/mail';
import { generateToken } from '$lib/server/token';
import { checkRateLimit, resetRateLimit } from '$lib/server/rate-limit';

export const POST: RequestHandler = async (event) => {
  const { request } = event;
  const clientIp = event.getClientAddress();

  try {
    // Check rate limiting before processing the request
    await checkRateLimit(clientIp, 'register');

    const { email, password, name } = await request.json();
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
      emailVerified: false
    }).returning();

    // Create verification token in the token table
    await db.insert(userToken).values({
      userId: newUser.id,
      type: 'verification',
      token: verificationToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    // Reset rate limit counter on successful registration
    await resetRateLimit(clientIp, 'register');

    return json({ message: 'Registrierung erfolgreich. Bitte überprüfen Sie Ihre E-Mails.' });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}; 
