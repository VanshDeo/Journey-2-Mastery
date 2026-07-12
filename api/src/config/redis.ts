import IORedis from "ioredis";
const Redis = IORedis.default ?? IORedis;
import { env } from "./env.js";
import { logger } from "./logger.js";

/**
 * Shared Redis client for caching, JWT blacklist, and rate limiting.
 * BullMQ creates its own connections internally from the same URL.
 */
const redisOptions = {
  maxRetriesPerRequest: null as null, // Required by BullMQ
  enableReadyCheck: false,
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

export const redis = new Redis(env.REDIS_URL, redisOptions);

redis.on("connect", () => {
  logger.info("Redis connected");
});

redis.on("error", (err: Error) => {
  logger.error({ err }, "Redis connection error");
});
