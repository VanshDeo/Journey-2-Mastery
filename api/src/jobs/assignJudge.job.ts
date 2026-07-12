import { Job } from "bullmq";
import { assignJudge } from "../services/assignment.service.js";
import { logger } from "../config/logger.js";

interface AssignJudgeData {
  submissionId: string;
}

/**
 * BullMQ job processor for judge auto-assignment.
 * Triggered immediately after a submission is created.
 *
 * Runs in a SEPARATE PROCESS from the API server (jobs/workers/index.ts).
 */
export async function processAssignJudge(job: Job<AssignJudgeData>) {
  const { submissionId } = job.data;

  logger.info({ submissionId, jobId: job.id }, "Processing judge assignment job");

  try {
    const assigned = await assignJudge(submissionId);

    if (!assigned) {
      logger.warn(
        { submissionId, jobId: job.id },
        "Judge assignment deferred — no eligible/available judges"
      );
    }

    return { assigned };
  } catch (error) {
    logger.error(
      { submissionId, jobId: job.id, error },
      "Judge assignment job failed"
    );
    throw error; // BullMQ will retry based on queue config
  }
}
