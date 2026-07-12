import { sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { redis } from "../config/redis.js";
import { CACHE_KEYS, CACHE_TTL } from "../utils/constants.js";
import { logger } from "../config/logger.js";

interface LeaderboardEntry {
  userId: string;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  rank: string;
  totalScore: number;
  tasksCompleted: number;
  leaderboardRank: number;
}

/**
 * Get the leaderboard from the materialized view.
 * Cached in Redis for 30-60s.
 */
export async function getLeaderboard(
  cursor?: string,
  limit = 20
): Promise<{ items: LeaderboardEntry[]; meta: { nextCursor: string | null; limit: number } }> {
  // Check cache (only for first page)
  if (!cursor) {
    const cached = await redis.get(CACHE_KEYS.leaderboard);
    if (cached) {
      const parsed = JSON.parse(cached) as LeaderboardEntry[];
      return {
        items: parsed.slice(0, limit),
        meta: {
          nextCursor: parsed.length > limit ? parsed[limit - 1]?.userId ?? null : null,
          limit,
        },
      };
    }
  }

  try {
    // Query the materialized view
    const conditions = cursor
      ? sql`WHERE user_id > ${cursor}`
      : sql``;

    const rows = await db.execute(
      sql`SELECT user_id, username, full_name, avatar_url, rank, total_score, tasks_completed, leaderboard_rank
          FROM leaderboard
          ${conditions}
          ORDER BY total_score DESC, user_id ASC
          LIMIT ${limit + 1}`
    );

    const entries: LeaderboardEntry[] = (rows as unknown as Array<Record<string, unknown>>).map((row) => ({
      userId: row.user_id as string,
      username: row.username as string,
      fullName: row.full_name as string | null,
      avatarUrl: row.avatar_url as string | null,
      rank: row.rank as string,
      totalScore: Number(row.total_score),
      tasksCompleted: Number(row.tasks_completed),
      leaderboardRank: Number(row.leaderboard_rank),
    }));

    const hasMore = entries.length > limit;
    const items = hasMore ? entries.slice(0, limit) : entries;

    // Cache first page
    if (!cursor && items.length > 0) {
      await redis.set(
        CACHE_KEYS.leaderboard,
        JSON.stringify(items),
        "EX",
        CACHE_TTL.LEADERBOARD
      );
    }

    return {
      items,
      meta: {
        nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.userId : null,
        limit,
      },
    };
  } catch (err) {
    // Materialized view might not exist yet
    logger.warn({ err }, "Leaderboard view query failed — view may not exist yet");
    return { items: [], meta: { nextCursor: null, limit } };
  }
}

/**
 * Refresh the leaderboard materialized view.
 * Called by the leaderboard-recalculate BullMQ job.
 */
export async function refreshLeaderboard(): Promise<void> {
  try {
    await db.execute(sql`REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard`);
    await redis.del(CACHE_KEYS.leaderboard);
    logger.info("Leaderboard materialized view refreshed");
  } catch (err) {
    logger.error({ err }, "Failed to refresh leaderboard materialized view");
    throw err;
  }
}
