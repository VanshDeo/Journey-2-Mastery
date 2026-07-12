import { Queue } from "bullmq";
import { env } from "./env";

/**
 * Redis connection config shared by all queues.
 * Workers use the same config in jobs/workers/index.ts (separate process).
 */
const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || "6379", 10),
};

/** Judge auto-assignment queue — triggered on submission creation */
export const assignJudgeQueue = new Queue("assign-judge", { connection });

/** Leaderboard recalculation — triggered after review submission/override */
export const leaderboardQueue = new Queue("leaderboard-recalculate", {
  connection,
});

/** GitHub repo pre-fetch — triggered after OAuth callback to warm cache */
export const repoPrefetchQueue = new Queue("repo-prefetch", { connection });

/** Notification dispatch — async notification + optional email sends */
export const notificationQueue = new Queue("notification-dispatch", {
  connection,
});

export { connection as redisConnection };
