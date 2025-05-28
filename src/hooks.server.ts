import type { Handle } from '@sveltejs/kit';
import { getSession } from '$lib/server/session';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Server hook to handle authentication
 * - Gets the user session
 * - Populates locals.user with user data if session exists
 */
export const handle: Handle = async ({ event, resolve }) => {
  // Get user ID from session
  const userId = await getSession(event);
  
  if (userId) {
    // Fetch user data from database
    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: {
        id: true,
        email: true,
        name: true
      }
    });
    
    if (userData) {
      // Set user data in locals
      event.locals.user = {
        id: userData.id,
        email: userData.email,
        name: userData.name
      };
    }
  }
  
  return resolve(event);
};