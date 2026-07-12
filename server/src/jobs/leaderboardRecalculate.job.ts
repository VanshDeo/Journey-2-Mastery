import { Job } from "bullmq";
import { refreshLeaderboard } from "../services/leaderboard.service";
import { logger } from "../config/logger";

/**
 * BullMQ job processor for leaderboard recalculation.
 * Triggered after a review is submitted or overridden.
 * Refreshes the PostgreSQL materialized view + invalidates Redis cache.
 */
export async function processLeaderboardRecalculate(job: Job) {
  logger.info({ jobId: job.id }, "Processing leaderboard recalculation");

  try {
    await refreshLeaderboard();
    return { refreshed: true };
  } catch (error) {
    logger.error({ jobId: job.id, error }, "Leaderboard recalculation failed");
    throw error;
  }
}
