import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	// Pass the full user object from the server
	return { user: data.user };
}; 
