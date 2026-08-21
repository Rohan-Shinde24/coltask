import { Redis } from '@upstash/redis';

// Initialize the Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

/**
 * -------------------------------------------------------------
 * 1. Login/Session Management
 * -------------------------------------------------------------
 */
export async function storeSession(userId: string, token: string, expiresInDays: number = 7) {
  const key = `session:${userId}:${token}`;
  // Store session with expiration (e.g., 7 days)
  await redis.set(key, 'active', { ex: expiresInDays * 24 * 60 * 60 });
}

export async function isSessionActive(userId: string, token: string): Promise<boolean> {
  const key = `session:${userId}:${token}`;
  const status = await redis.get(key);
  return status === 'active';
}

export async function deleteSession(userId: string, token: string) {
  const key = `session:${userId}:${token}`;
  await redis.del(key);
}

/**
 * -------------------------------------------------------------
 * 2. API Rate Limiting
 * -------------------------------------------------------------
 */
export async function checkRateLimit(identifier: string, limit: number, windowInSeconds: number) {
  const key = `ratelimit:${identifier}`;
  const currentCount = await redis.incr(key);

  if (currentCount === 1) {
    // Set expiration on the first request
    await redis.expire(key, windowInSeconds);
  }

  const ttl = await redis.ttl(key);
  
  return {
    success: currentCount <= limit,
    limit,
    remaining: Math.max(0, limit - currentCount),
    reset: Date.now() + (ttl * 1000)
  };
}

/**
 * -------------------------------------------------------------
 * 3. Cache Workspace Data
 * -------------------------------------------------------------
 */
export async function cacheUserWorkshops(userId: string, workshopsData: any) {
  const key = `workshops:${userId}`;
  // Cache for 15 minutes
  await redis.set(key, JSON.stringify(workshopsData), { ex: 15 * 60 });
}

export async function getCachedUserWorkshops(userId: string) {
  const key = `workshops:${userId}`;
  const data = await redis.get(key);
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function invalidateUserWorkshops(userId: string) {
  const key = `workshops:${userId}`;
  await redis.del(key);
}

/**
 * -------------------------------------------------------------
 * 4. Cache Project/Task Data
 * -------------------------------------------------------------
 */
export async function cacheTaskData(taskId: string, data: any) {
  const key = `task:${taskId}`;
  await redis.set(key, JSON.stringify(data), { ex: 30 * 60 }); // 30 minutes
}

export async function getCachedTaskData(taskId: string) {
  const key = `task:${taskId}`;
  const data = await redis.get(key);
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function invalidateTaskData(taskId: string) {
  const key = `task:${taskId}`;
  await redis.del(key);
}

/**
 * -------------------------------------------------------------
 * 5. OTP / Email Verification
 * -------------------------------------------------------------
 */
export async function storeOTP(email: string, otp: string, expiresInMinutes: number = 10) {
  const key = `otp:${email}`;
  await redis.set(key, otp, { ex: expiresInMinutes * 60 });
}

export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  const key = `otp:${email}`;
  const storedOTP = await redis.get(key);
  
  if (storedOTP && String(storedOTP) === String(otp)) {
    // Single use, delete after successful verification
    await redis.del(key);
    return true;
  }
  return false;
}

/**
 * -------------------------------------------------------------
 * 6. Password-reset Tokens
 * -------------------------------------------------------------
 */
export async function storeResetToken(userId: string, token: string, expiresInMinutes: number = 30) {
  const key = `reset_token:${userId}`;
  await redis.set(key, token, { ex: expiresInMinutes * 60 });
}

export async function verifyResetToken(userId: string, token: string): Promise<boolean> {
  const key = `reset_token:${userId}`;
  const storedToken = await redis.get(key);
  
  if (storedToken && String(storedToken) === String(token)) {
    // Single use
    await redis.del(key);
    return true;
  }
  return false;
}

/**
 * -------------------------------------------------------------
 * 7. Temporary Security Locks
 * -------------------------------------------------------------
 */
export async function lockAccount(email: string, lockoutMinutes: number = 15) {
  const key = `lockout:${email}`;
  await redis.set(key, 'locked', { ex: lockoutMinutes * 60 });
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const key = `lockout:${email}`;
  const status = await redis.get(key);
  return status === 'locked';
}

/**
 * -------------------------------------------------------------
 * 8. Temporary Notification Data
 * -------------------------------------------------------------
 */
export async function storeNotification(userId: string, notification: any, expiresInHours: number = 24) {
  const key = `notifications:${userId}`;
  // Use list to store multiple notifications
  await redis.lpush(key, JSON.stringify(notification));
  await redis.expire(key, expiresInHours * 60 * 60);
}

export async function getNotifications(userId: string, limit: number = 50) {
  const key = `notifications:${userId}`;
  const data = await redis.lrange(key, 0, limit - 1);
  return data.map((item: any) => typeof item === 'string' ? JSON.parse(item) : item);
}

export async function clearNotifications(userId: string) {
  const key = `notifications:${userId}`;
  await redis.del(key);
}

/**
 * -------------------------------------------------------------
 * 9. Request/Activity Counters
 * -------------------------------------------------------------
 */
export async function incrementActivityCounter(userId: string, action: string) {
  const key = `activity:${userId}:${action}`;
  await redis.incr(key);
  // Keep counters around for 24h as temporary data
  await redis.expire(key, 24 * 60 * 60);
}

export async function getActivityCount(userId: string, action: string): Promise<number> {
  const key = `activity:${userId}:${action}`;
  const count = await redis.get(key);
  return count ? parseInt(count as string, 10) : 0;
}

/**
 * -------------------------------------------------------------
 * 10. Temporary Chat-related Data
 * -------------------------------------------------------------
 */
export async function cacheRecentMessages(workshopId: string, messages: any) {
  const key = `chat:${workshopId}`;
  await redis.set(key, JSON.stringify(messages), { ex: 60 * 60 }); // 1 hour
}

export async function getCachedRecentMessages(workshopId: string) {
  const key = `chat:${workshopId}`;
  const data = await redis.get(key);
  return typeof data === 'string' ? JSON.parse(data) : data;
}

export async function invalidateChatCache(workshopId: string) {
  const key = `chat:${workshopId}`;
  await redis.del(key);
}
