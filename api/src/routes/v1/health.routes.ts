import { Hono } from "hono";
import type { AppEnv } from "../../types/index.js";
import { db } from "../../db/client.js";
import { redis } from "../../config/redis.js";
import { sql } from "drizzle-orm";
import { success } from "../../utils/apiResponse.js";

const health = new Hono<AppEnv>();

/**
 * GET /api/v1/health
 * Health check for load balancer / orchestrator probes.
 * Checks DB and Redis connectivity.
 */
health.get("/", async (c) => {
  const checks: Record<string, string> = {};
  let healthy = true;

  // Check PostgreSQL
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Check Redis
  try {
    await redis.ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
    healthy = false;
  }

  const data = {
    status: healthy ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    checks,
  };

  if (!healthy) {
    return c.json({ success: true, data }, 503);
  }

  return success(c, data);
});

export default health;
