import { Job } from "bullmq";
import { getUserRepos } from "../services/github.service.js";
import { logger } from "../config/logger.js";

interface RepoPrefetchData {
  userId: string;
}

/**
 * BullMQ job to pre-warm the GitHub repo cache after OAuth callback.
 * This way, when the user first clicks "Submit", repos are already cached.
 */
export async function processRepoPrefetch(job: Job<RepoPrefetchData>) {
  const { userId } = job.data;

  logger.info({ userId, jobId: job.id }, "Pre-fetching GitHub repos");

  try {
    const repos = await getUserRepos(userId);
    logger.info(
      { userId, repoCount: repos.length },
      "GitHub repos pre-fetched and cached"
    );
    return { repoCount: repos.length };
  } catch (error) {
    logger.warn(
      { userId, jobId: job.id, error },
      "Repo pre-fetch failed (non-critical)"
    );
    // Don't throw — this is a nice-to-have, not critical
    return { repoCount: 0, error: "prefetch failed" };
  }
}
