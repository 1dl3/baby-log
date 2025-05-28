import { db } from './db';
import { sessions } from '$lib/server/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';
import { generateToken } from './token';
import { dev } from '$app/environment';

export const SESSION_COOKIE = 'session';
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

/**
 * Creates a new session for the given user ID
 * @param userId The user ID to create a session for
 * @returns The session token
 */
export async function createSession(userId: string): Promise<string> {
	const token = generateToken();
	const sessionId = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

	await db.insert(sessions).values({
		id: sessionId,
		userId,
		token,
		expiresAt
	});

	return token;
}

/**
 * Gets the user ID from the session in the request
 * @param event The request event
 * @returns The user ID if a valid session exists, null otherwise
 */
export async function getSession(event: RequestEvent): Promise<string | null> {
	const token = event.cookies.get(SESSION_COOKIE);
	if (!token) return null;

	const session = await db.query.sessions.findFirst({
		where: eq(sessions.token, token)
	});

	if (!session) return null;

	// Check if session is expired
	if (new Date(session.expiresAt) < new Date()) {
		// Clean up expired session
		await destroySession(event);
		return null;
	}

	// Extend session if it's going to expire soon (within 7 days)
	const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	if (new Date(session.expiresAt) < sevenDaysFromNow) {
		await refreshSession(session.id);
	}

	return session.userId;
}

/**
 * Refreshes a session by extending its expiration date
 * @param sessionId The ID of the session to refresh
 */
export async function refreshSession(sessionId: string): Promise<void> {
	const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

	await db.update(sessions)
		.set({ expiresAt })
		.where(eq(sessions.id, sessionId));
}

/**
 * Destroys the session in the request
 * @param event The request event
 */
export async function destroySession(event: RequestEvent): Promise<void> {
	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		await db.delete(sessions).where(eq(sessions.token, token));
		event.cookies.delete(SESSION_COOKIE, { path: '/' });
	}
}

/**
 * Sets the session cookie in the response
 * @param event The request event
 * @param token The session token
 */
export function setSessionCookie(event: RequestEvent, token: string): void {
	event.cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		maxAge: SESSION_MAX_AGE
	});
}

/**
 * Finds an existing valid session for a user
 * @param userId The user ID to find a session for
 * @returns The session if found, null otherwise
 */
export async function findExistingSession(userId: string) {
	return await db.query.sessions.findFirst({
		where: and(
			eq(sessions.userId, userId),
			gt(sessions.expiresAt, new Date())
		)
	});
}
