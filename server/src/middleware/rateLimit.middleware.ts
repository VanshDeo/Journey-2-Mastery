import { createMiddleware } from "hono/factory";
import type { AppEnv } from "../types/index";
import { redis } from "../config/redis";
import { env } from "../config/env";
import { tooManyRequests } from "../utils/apiError";

/**
 * Sliding-window rate limiter backed by Redis.
 *
 * Uses a simple fixed-window counter per IP:
 *   Key:  ratelimit:{ip}:{window}
 *   TTL:  RATE_LIMIT_WINDOW_MS / 1000 seconds
 *
 * @param maxRequests - Override the default max requests per window
 */
export function rateLimiter(maxRequests?: number) {
  return createMiddleware<AppEnv>(async (c, next) => {
    const max = maxRequests ?? env.RATE_LIMIT_MAX;
    const windowMs = env.RATE_LIMIT_WINDOW_MS;
    const windowSec = Math.ceil(windowMs / 1000);

    // Use forwarded IP or socket IP
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      c.req.header("x-real-ip") ??
      "unknown";

    const windowKey = Math.floor(Date.now() / windowMs);
    const key = `ratelimit:${ip}:${windowKey}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, windowSec);
    }

    // Set rate limit headers
    c.header("X-RateLimit-Limit", String(max));
    c.header("X-RateLimit-Remaining", String(Math.max(0, max - current)));

    if (current > max) {
      c.header("Retry-After", String(windowSec));
      throw tooManyRequests(
        `Rate limit exceeded. Maximum ${max} requests per ${windowSec}s window.`
      );
    }

    await next();
  });
}

/**
 * Stricter rate limiter for GitHub-facing endpoints.
 * Uses a lower limit to stay within GitHub API rate limits.
 */
export const githubRateLimiter = rateLimiter(10);
