import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSession } from '$lib/server/session';

/**
 * Server-side layout load function
 * - Gets the user session
 * - Redirects unauthenticated users to login page
 * - Passes user ID to the layout
 */
export const load: LayoutServerLoad = async (event) => {
	const userId = await getSession(event);
	const path = event.url.pathname;

	// Public routes that don't require authentication
	const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];

	// Redirect unauthenticated users to login page
	if (!userId && !publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
		throw redirect(302, '/login');
	}

	return { userId };
};
