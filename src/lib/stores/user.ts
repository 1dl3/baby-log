import { writable } from 'svelte/store';

// Define the user type
type User = {
  id?: string;
  email?: string;
  name?: string;
} | null;

// Create a writable store with initial value of null
export const user = writable<User>(null);

// Function to set the user data in the store
export function setUser(userData: User): void {
  user.set(userData);
}

// Function to clear the user data (for logout)
export function clearUser(): void {
  user.set(null);
}