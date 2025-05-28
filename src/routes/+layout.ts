import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	// Pass the full user object from the server
	console.log('Client-side layout load received data:', data);
	return { user: data.user };
}; 
