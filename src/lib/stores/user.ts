import { writable } from 'svelte/store';
import { browser } from '$app/environment';

// Define the user type
type User = {
	id?: string;
	email?: string;
	name?: string;
	emailVerified?: boolean;
} | null;

// Initialize from localStorage if available
function getInitialUser(): User {
	if (browser) {
		const storedUser = localStorage.getItem('user');
		if (storedUser) {
			try {
				return JSON.parse(storedUser);
			} catch (e) {
				console.error('Failed to parse stored user:', e);
			}
		}
	}
	return null;
}

// Create a writable store with initial value from localStorage or null
export const user = writable<User>(getInitialUser());

// Function to set the user data in the store
export function setUser(userData: User): void {
	// Save to localStorage if in browser environment
	if (browser && userData) {
		try {
			localStorage.setItem('user', JSON.stringify(userData));
		} catch (e) {
			console.error('Failed to save user to localStorage:', e);
		}
	} else if (browser) {
		// Clear localStorage if userData is null
		localStorage.removeItem('user');
	}

	user.set(userData);

	// // Subscribe to the store to verify it was updated
	// const unsubscribe = user.subscribe(value => {
	//   console.log('User store updated to:', value);
	//   unsubscribe();
	// });
}

// Function to clear the user data (for logout)
export function clearUser(): void {
	console.log('clearUser called');

	// Remove from localStorage if in browser environment
	if (browser) {
		localStorage.removeItem('user');
		console.log('User data removed from localStorage');
	}

	user.set(null);
}
