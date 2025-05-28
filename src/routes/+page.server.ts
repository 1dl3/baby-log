import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getSession } from '$lib/server/session';

/**
 * Server-side page load function for the root route
 * - Redirects authenticated users to the dashboard
 */
export const load: PageServerLoad = async (event) => {
  const userId = await getSession(event);
  
  // If user is authenticated, redirect to dashboard
  if (userId) {
    throw redirect(302, '/dashboard');
  }
  
  // Otherwise, continue to the landing page
  return {};
};