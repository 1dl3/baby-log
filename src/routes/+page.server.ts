import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

/**
 * Server-side page load function for the root route
 * - Redirects authenticated users to the dashboard
 */
export const load: PageServerLoad = async (event) => {
  // If user is authenticated, redirect to dashboard
  if (event.locals.user) {
    throw redirect(302, '/dashboard');
  }

  // Otherwise, continue to the landing page
  return {};
};
