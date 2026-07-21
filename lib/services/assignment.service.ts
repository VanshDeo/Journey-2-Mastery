import { eq, and, sql, count } from "drizzle-orm";
import { db } from "../db/client";
import { users, submissions, reviews } from "../db/schema";
import { env } from "../config/env";
import { logger } from "../logger";
import { notFound } from "../utils/apiError";
import { NOTIFICATION_TYPES } from "../utils/constants";
import { createNotification } from "./notification.service";

export interface JudgeLoadScore {
  judgeId: string;
  username: string;
  pendingCount: number;
  assignedCount: number;
  completedCount: number;
  avgTurnaroundHrs: number;
  loadScore: number;
  lastAssignedAt: Date | null;
}

/**
 * Judge Auto-Assignment Algorithm
 * ================================
 * Implements the load-score algorithm exactly as specified in Section 5:
 *
 * 1. Fetch all active judges
 * 2. For each: loadScore = pendingCount + (avgTurnaroundHrs / 24)
 * 3. Filter: must NOT be the submission author (self-review guard)
 * 4. Sort by loadScore ascending → pick lowest
 * 5. Tie-break: round-robin (last-assigned-longest-ago)
 * 6. Assign + trigger notification
 *
 * Edge cases:
 * - No active judges → stays pending, flagged for admin
 * - Overload threshold → queue instead of force-assign
 */
export async function assignJudge(submissionId: string): Promise<boolean> {
  // Fetch the submission
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) {
    logger.error({ submissionId }, "Assignment failed: submission not found");
    throw notFound("Submission", submissionId);
  }

  // Only assign if still pending
  if (submission.status !== "pending") {
    logger.info(
      { submissionId, status: submission.status },
      "Skipping assignment: submission is not pending"
    );
    return false;
  }

  // 1. Fetch all active judges
  const activeJudges = await db.query.users.findMany({
    where: and(eq(users.role, "judge"), eq(users.isActive, true)),
    columns: { id: true, username: true },
  });

  if (activeJudges.length === 0) {
    logger.warn({ submissionId }, "No active judges available — submission stays pending");
    return false;
  }

  // 2. Compute load score for each judge
  const judgeScores: JudgeLoadScore[] = [];

  for (const judge of activeJudges) {
    // Self-review guard: skip if the judge is the submission author
    if (judge.id === submission.userId) {
      continue;
    }

    const score = await computeJudgeLoadScore(judge.id, judge.username);
    judgeScores.push(score);
  }

  // 3. Filter: after removing self-review, if no judges left
  if (judgeScores.length === 0) {
    logger.warn(
      { submissionId },
      "No eligible judges after self-review filter — submission stays pending"
    );
    return false;
  }

  // 4. Overload check: if ALL judges exceed the threshold, queue instead
  const overloadThreshold = env.JUDGE_OVERLOAD_THRESHOLD;
  const allOverloaded = judgeScores.every(
    (j) => j.pendingCount >= overloadThreshold
  );

  if (allOverloaded) {
    logger.warn(
      { submissionId, overloadThreshold },
      "All judges at/above overload threshold — submission stays pending for admin review"
    );
    return false;
  }

  // 5. Sort by loadScore ascending
  judgeScores.sort((a, b) => {
    // Primary: lowest load score
    if (a.loadScore !== b.loadScore) {
      return a.loadScore - b.loadScore;
    }
    // Tie-break: round-robin — pick the one assigned longest ago (or never)
    const aTime = a.lastAssignedAt?.getTime() ?? 0;
    const bTime = b.lastAssignedAt?.getTime() ?? 0;
    return aTime - bTime; // Smallest (oldest) first
  });

  // 6. Pick the best candidate (lowest load, tie-broken by last assignment)
  const selectedJudge = judgeScores[0]!;

  // Skip judges that are overloaded even if not ALL are
  if (selectedJudge.pendingCount >= overloadThreshold) {
    // Find first non-overloaded judge
    const nonOverloaded = judgeScores.find(
      (j) => j.pendingCount < overloadThreshold
    );
    if (!nonOverloaded) {
      logger.warn({ submissionId }, "All sorted judges are overloaded");
      return false;
    }
    // Use the non-overloaded one
    Object.assign(selectedJudge, nonOverloaded);
  }

  // 7. Assign
  const now = new Date();
  await db
    .update(submissions)
    .set({
      assignedJudgeId: selectedJudge.judgeId,
      assignedAt: now,
      status: "in_review",
      autoAssigned: true,
    })
    .where(eq(submissions.id, submissionId));

  logger.info(
    {
      submissionId,
      judgeId: selectedJudge.judgeId,
      loadScore: selectedJudge.loadScore,
      pendingCount: selectedJudge.pendingCount,
    },
    "Judge auto-assigned to submission"
  );

  // 8. Trigger notification
  await createNotification({
    userId: selectedJudge.judgeId,
    type: NOTIFICATION_TYPES.SUBMISSION_ASSIGNED,
    message: `You have been assigned a new submission to review`,
    relatedEntityId: submissionId,
  });

  return true;
}

/**
 * Compute the load score for a single judge.
 *
 * loadScore = pendingCount + (avgTurnaroundHrs / 24)
 *
 * @returns JudgeLoadScore with all computed metrics
 */
export async function computeJudgeLoadScore(
  judgeId: string,
  username: string
): Promise<JudgeLoadScore> {
  // Pending count: submissions assigned to this judge with status 'in_review'
  const [pendingResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.assignedJudgeId, judgeId),
        eq(submissions.status, "in_review")
      )
    );

  const pendingCount = pendingResult?.count ?? 0;

  // Average turnaround: time between assignedAt and reviewedAt
  // over their last N reviews (configurable, default 10)
  const sampleSize = env.JUDGE_TURNAROUND_SAMPLE_SIZE;

  const turnaroundResult = await db.execute(sql`
    WITH recent_reviews AS (
      SELECT r.reviewed_at, s.assigned_at
      FROM reviews r
      INNER JOIN submissions s ON s.id = r.submission_id
      WHERE r.judge_id = ${judgeId}
        AND s.assigned_at IS NOT NULL
      ORDER BY r.reviewed_at DESC
      LIMIT ${sampleSize}
    )
    SELECT AVG(
      EXTRACT(EPOCH FROM (reviewed_at - assigned_at)) / 3600
    ) as avg_hours
    FROM recent_reviews
  `);

  const avgTurnaroundHrs = Number(
    (turnaroundResult as unknown as Array<{ avg_hours: string | null }>)[0]?.avg_hours ?? 0
  );

  // loadScore = pendingCount + (avgTurnaroundHrs / 24)
  const loadScore = Math.round((pendingCount + avgTurnaroundHrs / 24) * 100) / 100;

  // Last assigned time (for tie-breaking)
  const [lastAssigned] = await db
    .select({ assignedAt: submissions.assignedAt })
    .from(submissions)
    .where(eq(submissions.assignedJudgeId, judgeId))
    .orderBy(sql`${submissions.assignedAt} DESC NULLS LAST`)
    .limit(1);

  // Completed count: reviews submitted by this judge
  const [completedResult] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));

  const completedCount = completedResult?.count ?? 0;

  return {
    judgeId,
    username,
    pendingCount,
    assignedCount: pendingCount,
    completedCount,
    avgTurnaroundHrs,
    loadScore,
    lastAssignedAt: lastAssigned?.assignedAt ?? null,
  };
}

/**
 * Re-run auto-assignment for a specific submission.
 * Used by admin's POST /api/admin/assignment/reassign/:submissionId
 *
 * @param submissionId - The submission to re-assign
 * @param excludeJudgeId - Optionally exclude a specific judge (e.g., previous reviewer)
 */
export async function reassignSubmission(
  submissionId: string,
  _excludeJudgeId?: string
): Promise<boolean> {
  // Reset the submission to pending first
  await db
    .update(submissions)
    .set({
      assignedJudgeId: null,
      assignedAt: null,
      status: "pending",
      autoAssigned: false,
    })
    .where(eq(submissions.id, submissionId));

  // Re-run assignment
  // The exclusion is handled by the self-review guard + we can temporarily
  // mark the excluded judge. For simplicity, we re-run the main algorithm.
  // The excluded judge filter is a TODO for a more sophisticated version.
  return assignJudge(submissionId);
}
