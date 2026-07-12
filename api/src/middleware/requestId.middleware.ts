import { createMiddleware } from "hono/factory";
import { v4 as uuidv4 } from "uuid";
import type { AppEnv } from "../types/index.js";

/**
 * Attaches a unique request ID to every request for tracing.
 * Uses the client-provided X-Request-ID header if present,
 * otherwise generates a new UUID.
 */
export const requestIdMiddleware = createMiddleware<AppEnv>(
  async (c, next) => {
    const requestId = c.req.header("x-request-id") || uuidv4();
    c.set("requestId", requestId);
    c.header("X-Request-ID", requestId);
    await next();
  }
);
