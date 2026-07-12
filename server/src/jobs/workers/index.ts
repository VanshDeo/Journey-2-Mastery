import "dotenv/config";
import { Worker } from "bullmq";
import { logger } from "../../config/logger";
import { env } from "../../config/env";
import { processAssignJudge } from "../assignJudge.job";
import { processLeaderboardRecalculate } from "../leaderboardRecalculate.job";
import { processRepoPrefetch } from "../repoPrefetch.job";
import { processNotificationDispatch } from "../notificationDispatch.job";

/**
 * BullMQ Worker Process
 * =====================
 * This runs as a SEPARATE process from the API server.
 * Start with: npm run worker
 *
 * Registers all job processors and connects to Redis.
 */

const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port || "6379", 10),
};

const defaultOpts = {
  connection,
  concurrency: 5,
};

// ── Register Workers ──

const assignJudgeWorker = new Worker(
  "assign-judge",
  processAssignJudge,
  {
    ...defaultOpts,
    concurrency: 3, // Lower concurrency for DB-heavy operations
  }
);

const leaderboardWorker = new Worker(
  "leaderboard-recalculate",
  processLeaderboardRecalculate,
  {
    ...defaultOpts,
    concurrency: 1, // Only one refresh at a time
  }
);

const repoPrefetchWorker = new Worker(
  "repo-prefetch",
  processRepoPrefetch,
  {
    ...defaultOpts,
    concurrency: 5,
  }
);

const notificationWorker = new Worker(
  "notification-dispatch",
  processNotificationDispatch,
  {
    ...defaultOpts,
    concurrency: 10,
  }
);

// ── Error Handling ──

const workers = [
  { name: "assign-judge", worker: assignJudgeWorker },
  { name: "leaderboard-recalculate", worker: leaderboardWorker },
  { name: "repo-prefetch", worker: repoPrefetchWorker },
  { name: "notification-dispatch", worker: notificationWorker },
];

for (const { name, worker } of workers) {
  worker.on("completed", (job) => {
    logger.debug({ jobId: job?.id, queue: name }, "Job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error(
      { jobId: job?.id, queue: name, error: err.message },
      "Job failed"
    );
  });

  worker.on("error", (err) => {
    logger.error({ queue: name, error: err.message }, "Worker error");
  });
}

logger.info(
  { workerCount: workers.length },
  "🔧 BullMQ workers started (separate process)"
);

// ── Graceful Shutdown ──

async function shutdown() {
  logger.info("Shutting down workers...");
  await Promise.all(workers.map(({ worker }) => worker.close()));
  logger.info("All workers shut down");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
