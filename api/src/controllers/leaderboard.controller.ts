import type { Context } from "hono";
import type { AppEnv } from "../types/index.js";
import * as leaderboardService from "../services/leaderboard.service.js";
import { success } from "../utils/apiResponse.js";

/**
 * GET /api/v1/leaderboard
 * Global leaderboard — visible to all authenticated roles.
 */
export async function getLeaderboard(c: Context<AppEnv>) {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await leaderboardService.getLeaderboard(cursor, limit);
  return success(c, result.items, result.meta);
}
