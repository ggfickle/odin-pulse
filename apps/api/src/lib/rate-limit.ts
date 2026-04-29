import { getRedisClient } from "./redis.js";

export class RateLimiter {
  private prefix: string;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  /**
   * Returns remaining attempts. Throws Error with message if limited.
   * @param key - unique key (e.g. email or IP)
   * @param limit - max requests allowed
   * @param windowSeconds - time window in seconds
   */
  async check(key: string, limit: number, windowSeconds: number) {
    const redis = await getRedisClient();
    const redisKey = `${this.prefix}:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    if (count > limit) {
      const ttl = await redis.ttl(redisKey);
      throw new Error(
        `请求过于频繁，请 ${Math.max(1, ttl)} 秒后再试`,
      );
    }
    return { remaining: limit - count };
  }

  /**
   * Record a failure. Returns the total failures so far.
   * Locks key for lockWindowSeconds if limit is reached.
   */
  async recordFailure(
    key: string,
    limit: number,
    windowSeconds: number,
    lockWindowSeconds: number,
  ) {
    const redis = await getRedisClient();
    const redisKey = `${this.prefix}:${key}`;
    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.expire(redisKey, windowSeconds);
    }
    if (count >= limit) {
      await redis.expire(redisKey, lockWindowSeconds);
      throw new Error(
        `操作失败次数过多，请 ${Math.ceil(lockWindowSeconds / 60)} 分钟后再试`,
      );
    }
    return { failures: count, remaining: limit - count };
  }

  /**
   * Check if currently locked out. Throws Error if locked.
   */
  async checkLocked(key: string) {
    const redis = await getRedisClient();
    const redisKey = `${this.prefix}:${key}`;
    const ttl = await redis.ttl(redisKey);
    if (ttl > 0) {
      throw new Error(
        `操作失败次数过多，请 ${Math.ceil(ttl / 60)} 分钟后再试`,
      );
    }
    return false;
  }

  /**
   * Reset the counter on success (e.g. successful login clears failures).
   */
  async reset(key: string) {
    const redis = await getRedisClient();
    await redis.del(`${this.prefix}:${key}`);
  }
}
