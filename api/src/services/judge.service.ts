import { eq, and, gt, asc, desc, count, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, submissions, reviews } from "../db/schema.js";
import { leaderboardQueue, notificationQueue } from "../config/queue.js";
import { env } from "../config/env.js";
import { notFound, forbidden, conflict } from "../utils/apiError.js";
import { computeJudgeLoadScore } from "./assignment.service.js";
import { NOTIFICATION_TYPES } from "../utils/constants.js";
import type { SubmitReviewInput, EditReviewInput } from "../validators/judge.validator.js";
import { checkAndPromoteUser, syncUserScore } from "./user.service.js";

const criteriaMap: Record<string, { name: string; maxScore: number }> = {
  codeQuality: { name: "Code Quality", maxScore: 25 },
  functionality: { name: "Functionality", maxScore: 25 },
  documentation: { name: "Documentation", maxScore: 15 },
  testing: { name: "Testing", maxScore: 15 },
  creativity: { name: "Creativity", maxScore: 20 },
};

export function enrichReviewWithScores(review: any) {
  if (!review) return null;
  const breakdown = (review.scoreBreakdown as Record<string, number>) || {};
  const scores = Object.entries(criteriaMap).map(([id, info]) => ({
    criterionId: id,
    criterionName: info.name,
    score: breakdown[id] ?? 0,
    maxScore: info.maxScore,
  }));
  return {
    ...review,
    scores,
  };
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export async function getDashboard(judgeId: string) {
  const [pendingResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(
      and(
        eq(submissions.assignedJudgeId, judgeId),
        eq(submissions.status, "in_review")
      )
    );

  const [reviewedResult] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));

  // Avg turnaround in hours
  const turnaroundResult = await db.execute(sql`
    SELECT AVG(
      EXTRACT(EPOCH FROM (r.reviewed_at - s.assigned_at)) / 3600
    ) as avg_hours
    FROM reviews r
    INNER JOIN submissions s ON s.id = r.submission_id
    WHERE r.judge_id = ${judgeId}
      AND s.assigned_at IS NOT NULL
  `);

  const avgTurnaroundHrs = Number(
    (turnaroundResult as unknown as Array<{ avg_hours: string | null }>)[0]?.avg_hours ?? 0
  );


  // Recent reviews
  const recentReviews = await db.query.reviews.findMany({
    where: eq(reviews.judgeId, judgeId),
    orderBy: [desc(reviews.reviewedAt)],
    limit: 5,
  });

  return {
    pendingCount: pendingResult?.count ?? 0,
    reviewedCount: reviewedResult?.count ?? 0,
    avgTurnaround: avgTurnaroundHrs > 0 ? `${Math.round(avgTurnaroundHrs * 10) / 10}h` : '—',
    recentReviews: recentReviews.map((r) => {
      const enriched = enrichReviewWithScores(r)!;
      return {
        id: enriched.id,
        submissionId: enriched.submissionId,
        judgeId: enriched.judgeId,
        scores: enriched.scores,
        totalScore: enriched.totalScore,
        feedback: enriched.feedback,
        createdAt: enriched.reviewedAt,
      };
    }),
  };
}

// ──────────────────────────────────────────────
// Submissions Queue
// ──────────────────────────────────────────────

export async function getAssignedSubmissions(
  judgeId: string,
  statusFilter?: string,
  cursor?: string,
  limit = 20
) {
  const conditions = [eq(submissions.assignedJudgeId, judgeId)];

  if (statusFilter) {
    conditions.push(eq(submissions.status, statusFilter as "in_review" | "approved" | "rejected"));
  }
  if (cursor) {
    conditions.push(gt(submissions.id, cursor));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      task: true,
      user: { columns: { id: true, username: true, avatarUrl: true } },
      review: true,
    },
    orderBy: [asc(submissions.submittedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const rawItems = hasMore ? result.slice(0, limit) : result;

  const items = rawItems.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    taskTitle: s.task?.title,
    userId: s.userId,
    userName: s.user?.username,
    repoId: s.repoId,
    repoUrl: s.repoUrl,
    repoName: s.repoName,
    status: s.status,
    assignedJudgeId: s.assignedJudgeId,
    autoAssigned: s.autoAssigned,
    submittedAt: s.submittedAt,
    score: s.review?.totalScore ?? null,
    review: s.review,
    task: s.task,
    user: s.user,
  }));

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function getSubmissionForReview(judgeId: string, submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: {
      task: true,
      user: {
        columns: { id: true, username: true, avatarUrl: true, fullName: true },
      },
      review: true,
    },
  });

  if (!submission) throw notFound("Submission", submissionId);
  if (submission.assignedJudgeId !== judgeId) {
    throw forbidden("This submission is not assigned to you");
  }

  return {
    id: submission.id,
    taskId: submission.taskId,
    taskTitle: submission.task?.title,
    userId: submission.userId,
    userName: submission.user?.fullName || submission.user?.username,
    repoId: submission.repoId,
    repoUrl: submission.repoUrl,
    repoName: submission.repoName,
    status: submission.status,
    assignedJudgeId: submission.assignedJudgeId,
    autoAssigned: submission.autoAssigned,
    submittedAt: submission.submittedAt,
    score: submission.review?.totalScore ?? null,
    review: enrichReviewWithScores(submission.review),
    task: submission.task,
    user: submission.user,
  };
}

// ──────────────────────────────────────────────
// Reviews
// ──────────────────────────────────────────────

export async function submitReview(
  judgeId: string,
  submissionId: string,
  data: SubmitReviewInput
) {
  // Verify submission is assigned to this judge
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);
  if (submission.assignedJudgeId !== judgeId) {
    throw forbidden("This submission is not assigned to you");
  }
  if (submission.status !== "in_review") {
    throw conflict(
      `Cannot review submission with status '${submission.status}'`,
      "SUBMISSION_NOT_REVIEWABLE"
    );
  }

  // Check for existing review (one review per submission)
  const existingReview = await db.query.reviews.findFirst({
    where: eq(reviews.submissionId, submissionId),
  });

  if (existingReview) {
    throw conflict(
      "A review already exists for this submission",
      "REVIEW_ALREADY_EXISTS"
    );
  }

  let scoreBreakdown = data.scoreBreakdown;
  let totalScore = data.totalScore;

  if (data.scores) {
    scoreBreakdown = data.scores.reduce((acc, s) => {
      acc[s.criterionId] = s.score;
      return acc;
    }, {} as Record<string, number>);

    totalScore = data.scores.reduce((sum, s) => sum + s.score, 0);
  }

  if (totalScore === undefined) {
    totalScore = 0;
  }

  const decision = data.decision || (totalScore >= 50 ? "approved" : "rejected");

  // Create review
  const [review] = await db
    .insert(reviews)
    .values({
      submissionId,
      judgeId,
      scoreBreakdown,
      totalScore,
      feedback: data.feedback,
    })
    .returning();

  // Update submission status
  await db
    .update(submissions)
    .set({ status: decision })
    .where(eq(submissions.id, submissionId));

  // Check and promote user if approved
  if (decision === "approved") {
    await checkAndPromoteUser(submission.userId, submission.taskId);
  }

  // Update user's cached score
  await syncUserScore(submission.userId);

  // Enqueue leaderboard recalculation
  await leaderboardQueue.add("recalculate", {});

  // Notify the submission owner
  await notificationQueue.add("notify-review", {
    userId: submission.userId,
    type:
      decision === "approved"
        ? NOTIFICATION_TYPES.SUBMISSION_APPROVED
        : NOTIFICATION_TYPES.SUBMISSION_REJECTED,
    message: `Your submission has been ${decision}`,
    relatedEntityId: submissionId,
  });

  return enrichReviewWithScores(review)!;
}

export async function editReview(
  judgeId: string,
  reviewId: string,
  data: EditReviewInput
) {
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    with: { submission: true },
  });

  if (!review) throw notFound("Review", reviewId);
  if (review.judgeId !== judgeId) {
    throw forbidden("You can only edit your own reviews");
  }

  // Check edit window
  const editWindowHours = env.REVIEW_EDIT_WINDOW_HOURS;
  const reviewAge =
    (Date.now() - new Date(review.reviewedAt).getTime()) / (1000 * 60 * 60);

  if (reviewAge > editWindowHours) {
    throw conflict(
      `Review edit window has expired (${editWindowHours} hours)`,
      "REVIEW_EDIT_WINDOW_EXPIRED"
    );
  }

  const updateData: Record<string, unknown> = {};

  let scoreBreakdown = data.scoreBreakdown;
  let totalScore = data.totalScore;

  if (data.scores) {
    scoreBreakdown = data.scores.reduce((acc, s) => {
      acc[s.criterionId] = s.score;
      return acc;
    }, {} as Record<string, number>);

    totalScore = data.scores.reduce((sum, s) => sum + s.score, 0);
  }

  if (scoreBreakdown !== undefined) updateData.scoreBreakdown = scoreBreakdown;
  if (totalScore !== undefined) updateData.totalScore = totalScore;
  if (data.feedback !== undefined) updateData.feedback = data.feedback;

  let updated = review;
  if (Object.keys(updateData).length > 0) {
    const [dbUpdated] = await db
      .update(reviews)
      .set(updateData)
      .where(eq(reviews.id, reviewId))
      .returning();
    updated = { ...dbUpdated!, submission: review.submission };
  }

  // Trigger leaderboard recalc if score changed
  if (totalScore !== undefined && review.submission) {
    await syncUserScore(review.submission.userId);
    await leaderboardQueue.add("recalculate", {});
  }

  return enrichReviewWithScores(updated)!;
}

export async function getReviews(judgeId: string, cursor?: string, limit = 20) {
  const conditions = [eq(reviews.judgeId, judgeId)];
  if (cursor) conditions.push(gt(reviews.id, cursor));

  const result = await db.query.reviews.findMany({
    where: and(...conditions),
    with: {
      submission: {
        with: {
          task: { columns: { id: true, title: true, category: true } },
          user: { columns: { id: true, username: true } },
        },
      },
    },
    orderBy: [desc(reviews.reviewedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items: items.map((r) => enrichReviewWithScores(r)!),
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

export async function getReviewById(judgeId: string, reviewId: string) {
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    with: {
      submission: {
        with: {
          task: true,
          user: { columns: { id: true, username: true, fullName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!review) throw notFound("Review", reviewId);
  if (review.judgeId !== judgeId) throw forbidden("You can only view your own reviews");

  return enrichReviewWithScores(review)!;
}

// ──────────────────────────────────────────────
// Workload
// ──────────────────────────────────────────────

export async function getWorkload(judgeId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, judgeId),
    columns: { id: true, username: true },
  });

  if (!user) throw notFound("Judge", judgeId);

  return computeJudgeLoadScore(user.id, user.username);
}
