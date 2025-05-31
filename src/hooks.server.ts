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
        name: true,
        emailVerified: true
      }
    });

    if (userData) {
      // Set user data in locals
      event.locals.user = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified
      };
    }
  }

  // Check if the request is for an API route (except auth routes)
  const isApiRoute = event.url.pathname.startsWith('/api/');
  const isAuthRoute = event.url.pathname.startsWith('/api/auth/');

  // Only allow authenticated users to access API routes (except auth routes)
  if (isApiRoute && !isAuthRoute && !event.locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  return resolve(event);
};
