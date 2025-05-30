import { db } from '$lib/server/db';
import { rateLimit } from '$lib/server/db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const MAX_ATTEMPTS = 5; // Maximum number of attempts allowed
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Check if the IP address is rate limited for the specified action
 * @param ipAddress The IP address to check
 * @param action The action to check ('login' or 'register')
 * @returns Promise<void> - Throws an error if rate limited
 */
export async function checkRateLimit(ipAddress: string, action: 'login' | 'register'): Promise<void> {
  // Find existing rate limit record for this IP and action
  const rateLimitRecord = await db.query.rateLimit.findFirst({
    where: and(
      eq(rateLimit.ipAddress, ipAddress),
      eq(rateLimit.action, action)
    )
  });

  const now = new Date();

  // If there's a record and it's blocked, check if the block has expired
  if (rateLimitRecord?.blockedUntil && rateLimitRecord.blockedUntil > now) {
    // Still blocked
    const minutesLeft = Math.ceil((rateLimitRecord.blockedUntil.getTime() - now.getTime()) / 60000);
    throw error(429, `Zu viele Anfragen. Bitte versuchen Sie es in ${minutesLeft} Minuten erneut.`);
  }

  // If there's a record but it's not blocked or the block has expired
  if (rateLimitRecord) {
    // Check if the last attempt was more than BLOCK_DURATION ago
    const resetTime = new Date(rateLimitRecord.lastAttempt.getTime() + BLOCK_DURATION);

    if (now > resetTime) {
      // Reset attempts if enough time has passed
      await db.update(rateLimit)
        .set({
          attempts: 1,
          lastAttempt: now,
          blockedUntil: null
        })
        .where(eq(rateLimit.id, rateLimitRecord.id));
    } else {
      // Increment attempts
      const newAttempts = rateLimitRecord.attempts + 1;

      if (newAttempts > MAX_ATTEMPTS) {
        // Block the IP
        const blockedUntil = new Date(now.getTime() + BLOCK_DURATION);
        await db.update(rateLimit)
          .set({
            attempts: newAttempts,
            lastAttempt: now,
            blockedUntil
          })
          .where(eq(rateLimit.id, rateLimitRecord.id));

        throw error(429, `Zu viele Anfragen. Bitte versuchen Sie es in 15 Minuten erneut.`);
      } else {
        // Update attempts
        await db.update(rateLimit)
          .set({
            attempts: newAttempts,
            lastAttempt: now
          })
          .where(eq(rateLimit.id, rateLimitRecord.id));
      }
    }
  } else {
    // Create new rate limit record
    await db.insert(rateLimit).values({
      ipAddress,
      action,
      attempts: 1,
      lastAttempt: now
    });
  }
}

/**
 * Reset rate limit for the specified IP address and action
 * @param ipAddress The IP address to reset
 * @param action The action to reset ('login' or 'register')
 */
export async function resetRateLimit(ipAddress: string, action: 'login' | 'register'): Promise<void> {
  await db.delete(rateLimit)
    .where(
      and(
        eq(rateLimit.ipAddress, ipAddress),
        eq(rateLimit.action, action)
      )
    );
}

/**
 * Clean up expired rate limits
 */
export async function cleanupRateLimits(): Promise<void> {
  const now = new Date();
  const expiryTime = new Date(now.getTime() - BLOCK_DURATION);

  // Delete records where blockedUntil is null and lastAttempt is older than BLOCK_DURATION
  await db.delete(rateLimit)
    .where(
      and(
        eq(rateLimit.blockedUntil, null),
        lt(rateLimit.lastAttempt, expiryTime)
      )
    );

  // Reset records where blockedUntil is in the past
  await db.update(rateLimit)
    .set({
      attempts: 1,
      blockedUntil: null
    })
    .where(lt(rateLimit.blockedUntil, now));
}
