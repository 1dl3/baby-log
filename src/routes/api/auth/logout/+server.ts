import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destroySession } from '$lib/server/session';

/**
 * Handles user logout
 * - Destroys the session
 * - Clears the session cookie
 */
export const DELETE: RequestHandler = async (event) => {
  await destroySession(event);
  return json({ message: 'Logout erfolgreich' });
};
