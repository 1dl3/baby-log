import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

/**
 * Server-side layout load function
 * - Uses locals.user from the hook
 * - Redirects unauthenticated users to login page
 * - Redirects unverified users to verification page
 * - Passes user data to the layout
 */
export const load: LayoutServerLoad = async (event) => {
	const path = event.url.pathname;

	// Public routes that don't require authentication
	const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/verify-token'];

	// Redirect unauthenticated users to login page
	if (!event.locals.user && !publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
		throw redirect(302, '/login');
	}

	// Redirect authenticated but unverified users to verification page
	if (event.locals.user && !event.locals.user.emailVerified && 
		!publicRoutes.some(route => path === route || path.startsWith(route + '/'))) {
		throw redirect(302, '/verify-email');
	}

	return { 
		user: event.locals.user 
	};
};
