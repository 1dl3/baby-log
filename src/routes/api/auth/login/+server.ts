import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { error } from '@sveltejs/kit';
import { 
  createSession, 
  setSessionCookie, 
  findExistingSession, 
  refreshSession 
} from '$lib/server/session';

/**
 * Handles user login
 * - Validates email and password
 * - Creates or refreshes a session
 * - Sets the session cookie
 */
export const POST: RequestHandler = async (event) => {
  const { request } = event;

  try {
    const { email, password } = await request.json();

    // Find user
    const foundUser = await db.query.user.findFirst({
      where: eq(user.email, email)
    });

    if (!foundUser) {
      throw error(401, 'Ungültige E-Mail oder Passwort');
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword) {
      throw error(401, 'Ungültige E-Mail oder Passwort');
    }

    // Check for existing valid session
    const existingSession = await findExistingSession(foundUser.id);

    let sessionToken: string;

    if (existingSession) {
      // Use existing session but refresh it
      await refreshSession(existingSession.id);
      sessionToken = existingSession.token;
    } else {
      // Create new session
      sessionToken = await createSession(foundUser.id);
    }

    // Set session cookie
    setSessionCookie(event, sessionToken);

    return json({
      user: {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name
      }
    });
  } catch (err) {
    // Don't log sensitive error details
    if (err instanceof Error && err.message !== 'Ungültige E-Mail oder Passwort') {
      console.error('Login error occurred');
    }

    // Re-throw the original error
    throw err;
  }
};
