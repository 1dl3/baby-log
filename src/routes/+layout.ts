import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data }) => {
	// Create a user object with the userId as the id property
	const user = data.userId ? { id: data.userId } : null;
	return { user, userId: data.userId };
}; 
