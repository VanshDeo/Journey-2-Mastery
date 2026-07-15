import { logger } from "./logger";
import { processAssignJudge } from "../jobs/assignJudge.job";
import { processLeaderboardRecalculate } from "../jobs/leaderboardRecalculate.job";
import { processNotificationDispatch } from "../jobs/notificationDispatch.job";
import { processRepoPrefetch } from "../jobs/repoPrefetch.job";

import { AsyncLocalStorage } from "node:async_hooks";

export const asyncLocalStorage = new AsyncLocalStorage<{
  waitUntil: (promise: Promise<unknown>) => void;
}>();

/**
 * MockQueue class that executes job processor logic inline.
 * Mimics the BullMQ Queue interface (.add) to ensure zero code changes
 * in other services and compatibility with serverless environments like Vercel.
 */
class MockQueue {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async add(jobName: string, data: any) {
    logger.info({ queue: this.name, job: jobName }, "Executing job inline via MockQueue");

    const mockJob = {
      id: `mock-${this.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: jobName,
      data,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const runJob = async () => {
      try {
        if (this.name === "assign-judge") {
          await processAssignJudge(mockJob);
        } else if (this.name === "leaderboard-recalculate") {
          await processLeaderboardRecalculate(mockJob);
        } else if (this.name === "notification-dispatch") {
          await processNotificationDispatch(mockJob);
        } else if (this.name === "repo-prefetch") {
          await processRepoPrefetch(mockJob);
        }
      } catch (error) {
        logger.error({ queue: this.name, job: jobName, error }, "MockQueue job execution failed");
        throw error;
      }
    };

    const store = asyncLocalStorage.getStore();

    if (process.env.NODE_ENV === "test") {
      // In tests: run synchronously to ensure deterministic assertions
      await runJob();
    } else if (store && typeof store.waitUntil === "function") {
      // On Vercel: execute background task asynchronously without blocking HTTP response
      logger.info({ queue: this.name, job: jobName }, "Offloading job to Vercel executionCtx.waitUntil");
      store.waitUntil(runJob());
    } else {
      // Locally / Non-Vercel environment: run as fire-and-forget background promise
      logger.info({ queue: this.name, job: jobName }, "Running job as fire-and-forget background promise");
      runJob().catch((error) => {
        logger.error({ queue: this.name, job: jobName, error }, "Fire-and-forget MockQueue job failed");
      });
    }

    return mockJob;
  }
}

/** Judge auto-assignment queue — triggered on submission creation */
export const assignJudgeQueue = new MockQueue("assign-judge");

/** Leaderboard recalculation — triggered after review submission/override */
export const leaderboardQueue = new MockQueue("leaderboard-recalculate");

/** GitHub repo pre-fetch — triggered after OAuth callback to warm cache */
export const repoPrefetchQueue = new MockQueue("repo-prefetch");

/** Notification dispatch — async notification + optional email sends */
export const notificationQueue = new MockQueue("notification-dispatch");

/** Dummy connection export to prevent type errors on imports */
export const redisConnection = {};
