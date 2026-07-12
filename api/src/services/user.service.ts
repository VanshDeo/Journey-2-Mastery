import { eq, and, gt, sql, ilike, or, desc, asc, count } from "drizzle-orm";
import { db } from "../db/client.js";
import { users, tasks, submissions, reviews, sessions } from "../db/schema.js";
import { assignJudgeQueue, notificationQueue } from "../config/queue.js";
import { notFound, forbidden, conflict, AppError } from "../utils/apiError.js";
import { isRankSufficient, STATUS_PENDING, RANK_ORDER, NOTIFICATION_TYPES } from "../utils/constants.js";
import { logger } from "../config/logger.js";
import type { CreateSubmissionInput, UpdateSubmissionInput, UpdateProfileInput, TaskFilterInput } from "../validators/user.validator.js";
import type { Rank } from "../db/schema.js";
import { enrichReviewWithScores } from "./judge.service.js";

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

/**
 * Get user dashboard summary.
 */
export async function getDashboard(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { rank: true, githubAccessToken: false },
  });

  if (!user) throw notFound("User", userId);

  // Count completed tasks (approved submissions)
  const [completedResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(and(eq(submissions.userId, userId), eq(submissions.status, "approved")));

  // Count total available tasks for user's rank
  const availableRanks = getAvailableRanks(user.rank);
  const [totalTasksResult] = await db
    .select({ count: count() })
    .from(tasks)
    .where(and(eq(tasks.isActive, true), sql`${tasks.rankRequired} IN ${availableRanks}`));

  // Total score from approved reviews
  const [scoreResult] = await db
    .select({ totalScore: sql<number>`COALESCE(SUM(${reviews.totalScore}), 0)` })
    .from(reviews)
    .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
    .where(and(eq(submissions.userId, userId), eq(submissions.status, "approved")));

  return {
    rank: user.rank,
    totalScore: Number(scoreResult?.totalScore ?? 0),
    tasksCompleted: completedResult?.count ?? 0,
    tasksAvailable: (totalTasksResult?.count ?? 0) - (completedResult?.count ?? 0),
  };
}

// ──────────────────────────────────────────────
// Tasks
// ──────────────────────────────────────────────

/**
 * List tasks available for the user's current rank.
 */
export async function getAvailableTasks(userId: string, filters: TaskFilterInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { rank: true },
  });

  if (!user) throw notFound("User", userId);

  const conditions = [
    eq(tasks.isActive, true),
    sql`${tasks.rankRequired} IN ${getAvailableRanks(user.rank)}`,
  ];

  if (filters.category) {
    conditions.push(eq(tasks.category, filters.category));
  }
  if (filters.difficulty) {
    conditions.push(eq(tasks.difficulty, filters.difficulty));
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(tasks.title, `%${filters.search}%`),
        ilike(tasks.description, `%${filters.search}%`)
      )!
    );
  }
  if (filters.cursor) {
    conditions.push(gt(tasks.id, filters.cursor));
  }

  const result = await db
    .select()
    .from(tasks)
    .where(and(...conditions))
    .orderBy(asc(tasks.id))
    .limit(filters.limit + 1);

  const hasMore = result.length > filters.limit;
  const items = hasMore ? result.slice(0, filters.limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit: filters.limit,
    },
  };
}

/**
 * Get a single task by ID.
 */
export async function getTaskById(taskId: string) {
  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
  });

  if (!task) throw notFound("Task", taskId);
  return task;
}

/**
 * List user's completed (approved) tasks.
 */
export async function getCompletedTasks(userId: string, cursor?: string, limit = 20) {
  const conditions = [
    eq(submissions.userId, userId),
    eq(submissions.status, "approved"),
  ];

  if (cursor) {
    conditions.push(gt(submissions.id, cursor));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: { task: true, review: true },
    orderBy: [asc(submissions.id)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const rawItems = hasMore ? result.slice(0, limit) : result;
  const items = rawItems.map((s) => ({
    ...s,
    review: enrichReviewWithScores(s.review),
  }));

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

/**
 * List user's pending (submitted but not yet reviewed) tasks.
 */
export async function getPendingTasks(userId: string, cursor?: string, limit = 20) {
  const conditions = [
    eq(submissions.userId, userId),
    or(eq(submissions.status, "pending"), eq(submissions.status, "in_review"))!,
  ];

  if (cursor) {
    conditions.push(gt(submissions.id, cursor));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: { task: true },
    orderBy: [asc(submissions.id)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// Submissions
// ──────────────────────────────────────────────

/**
 * Create a submission by picking a repo.
 * Enqueues auto-assign job immediately after creation.
 */
export async function createSubmission(userId: string, data: CreateSubmissionInput) {
  // Verify task exists and is active
  const task = await db.query.tasks.findFirst({
    where: and(eq(tasks.id, data.taskId), eq(tasks.isActive, true)),
  });

  if (!task) throw notFound("Task", data.taskId);

  // Check user rank is sufficient
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { rank: true },
  });

  if (!user) throw notFound("User", userId);

  if (!isRankSufficient(user.rank, task.rankRequired as Rank)) {
    throw new AppError("RANK_REQUIREMENT_NOT_MET", `Your rank (${user.rank}) is insufficient for this task. Required: ${task.rankRequired}`, 403);
  }

  // Check for duplicate submission (same user + same task with non-rejected status)
  const existingSubmission = await db.query.submissions.findFirst({
    where: and(
      eq(submissions.userId, userId),
      eq(submissions.taskId, data.taskId),
      or(
        eq(submissions.status, "pending"),
        eq(submissions.status, "in_review"),
        eq(submissions.status, "approved")
      )!
    ),
  });

  if (existingSubmission) {
    throw conflict(
      "You already have an active submission for this task",
      "DUPLICATE_SUBMISSION"
    );
  }

  // Create submission
  const [submission] = await db
    .insert(submissions)
    .values({
      taskId: data.taskId,
      userId,
      repoId: data.repoId,
      repoUrl: data.repoUrl,
      repoName: data.repoName,
      status: "pending",
      autoAssigned: false,
    })
    .returning();

  // Enqueue auto-assign job (doesn't block the request)
  await assignJudgeQueue.add("assign-judge", {
    submissionId: submission!.id,
  });

  return submission!;
}

/**
 * List the user's own submissions.
 */
export async function getSubmissions(userId: string, cursor?: string, limit = 20) {
  const conditions = [eq(submissions.userId, userId)];

  if (cursor) {
    conditions.push(gt(submissions.id, cursor));
  }

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      task: { columns: { id: true, title: true, category: true, difficulty: true, points: true } },
      review: { columns: { id: true, totalScore: true, feedback: true, reviewedAt: true, scoreBreakdown: true } },
    },
    orderBy: [desc(submissions.submittedAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const rawItems = hasMore ? result.slice(0, limit) : result;

  const items = rawItems.map((s) => ({
    id: s.id,
    taskId: s.taskId,
    taskTitle: s.task?.title,
    userId: s.userId,
    repoId: s.repoId,
    repoUrl: s.repoUrl,
    repoName: s.repoName,
    status: s.status,
    assignedJudgeId: s.assignedJudgeId,
    autoAssigned: s.autoAssigned,
    submittedAt: s.submittedAt,
    score: s.review?.totalScore ?? null,
    review: enrichReviewWithScores(s.review),
    task: s.task,
  }));

  return {
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

/**
 * Get a single submission with review (if exists).
 * Ownership check: user can only view their own.
 */
export async function getSubmissionById(userId: string, submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: {
      task: true,
      review: true,
      assignedJudge: { columns: { id: true, username: true } },
    },
  });

  if (!submission) throw notFound("Submission", submissionId);
  if (submission.userId !== userId) throw forbidden("You can only view your own submissions");

  return {
    id: submission.id,
    taskId: submission.taskId,
    taskTitle: submission.task?.title,
    userId: submission.userId,
    repoId: submission.repoId,
    repoUrl: submission.repoUrl,
    repoName: submission.repoName,
    status: submission.status,
    assignedJudgeId: submission.assignedJudgeId,
    judgeName: submission.assignedJudge?.username,
    autoAssigned: submission.autoAssigned,
    submittedAt: submission.submittedAt,
    score: submission.review?.totalScore ?? null,
    review: enrichReviewWithScores(submission.review),
    task: submission.task,
  };
}

/**
 * Update a pending submission's repo.
 * Only allowed if status is 'pending' (before review).
 */
export async function updateSubmission(
  userId: string,
  submissionId: string,
  data: UpdateSubmissionInput
) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);
  if (submission.userId !== userId) throw forbidden("You can only edit your own submissions");
  if (submission.status !== STATUS_PENDING) {
    throw conflict(
      `Cannot edit submission with status '${submission.status}'. Only pending submissions can be modified.`,
      "SUBMISSION_NOT_EDITABLE"
    );
  }

  const [updated] = await db
    .update(submissions)
    .set({
      repoId: data.repoId,
      repoUrl: data.repoUrl,
      repoName: data.repoName,
    })
    .where(eq(submissions.id, submissionId))
    .returning();

  return updated!;
}

/**
 * Withdraw a pending submission.
 * Only allowed if status is 'pending'.
 */
export async function deleteSubmission(userId: string, submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);
  if (submission.userId !== userId) throw forbidden("You can only delete your own submissions");
  if (submission.status !== STATUS_PENDING) {
    throw conflict(
      `Cannot withdraw submission with status '${submission.status}'. Only pending submissions can be withdrawn.`,
      "SUBMISSION_NOT_DELETABLE"
    );
  }

  await db.delete(submissions).where(eq(submissions.id, submissionId));
}

// ──────────────────────────────────────────────
// Profile
// ──────────────────────────────────────────────

/**
 * Get the user's own profile.
 */
export async function getProfile(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { githubAccessToken: false },
  });

  if (!user) throw notFound("User", userId);

  // Count submissions
  const [submissionsCountResult] = await db
    .select({ count: count() })
    .from(submissions)
    .where(eq(submissions.userId, userId));

  return {
    ...user,
    submissionCount: submissionsCountResult?.count ?? 0,
  };
}

/**
 * Update the user's own profile.
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      avatarUrl: users.avatarUrl,
      bio: users.bio,
    });

  if (!updated) throw notFound("User", userId);
  return updated;
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Get the list of ranks a user can access tasks for.
 * A user can access tasks at their level or below.
 */
function getAvailableRanks(userRank: string): string[] {
  const allRanks = ["Ronin", "Kenshi", "Samurai", "Shogun"];
  const idx = allRanks.indexOf(userRank);
  if (idx === -1) return ["Ronin"];
  return allRanks.slice(0, idx + 1);
}

/**
 * Check if the user completed a task of their current rank level.
 * If yes, promote them to the next rank in the hierarchy.
 */
export async function checkAndPromoteUser(userId: string, taskId: string): Promise<void> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { rank: true },
  });

  const task = await db.query.tasks.findFirst({
    where: eq(tasks.id, taskId),
    columns: { rankRequired: true },
  });

  if (!user || !task) return;

  const currentRank = user.rank as Rank;
  const taskRank = task.rankRequired as Rank;

  // Promote only if completing a task of their current rank level
  if (currentRank === taskRank) {
    const currentIdx = RANK_ORDER.indexOf(currentRank);
    if (currentIdx !== -1 && currentIdx < RANK_ORDER.length - 1) {
      const nextRank = RANK_ORDER[currentIdx + 1]!;
      await db
        .update(users)
        .set({ rank: nextRank })
        .where(eq(users.id, userId));

      logger.info({ userId, oldRank: currentRank, newRank: nextRank }, "User promoted to next rank");

      // Notify user
      await notificationQueue.add("notify-rank-up", {
        userId,
        type: NOTIFICATION_TYPES.RANK_UP,
        message: `Congratulations! You have completed the challenge and ranked up to ${nextRank}!`,
      });
    }
  }
}

// ──────────────────────────────────────────────
// Settings
// ──────────────────────────────────────────────

export async function getSettings(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { settings: true },
  });

  if (!user) throw notFound("User", userId);

  return user.settings;
}

export async function updateSettings(userId: string, data: any) {
  const currentSettings = await getSettings(userId);
  const newSettings = { ...((currentSettings as any) || {}), ...data };

  const [updated] = await db
    .update(users)
    .set({ settings: newSettings })
    .where(eq(users.id, userId))
    .returning({ settings: users.settings });

  return updated!.settings;
}

// ──────────────────────────────────────────────
// Account Deletion
// ──────────────────────────────────────────────

export async function deleteAccount(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) throw notFound("User", userId);

  // Hard delete (cascade takes care of relations thanks to Drizzle config if applicable, 
  // but let's delete the user and rely on the DB's foreign key constraints or manual cleanup)
  await db.transaction(async (tx) => {
    // Audit log and others without cascade need manual deletion or we can just delete the user if cascade is enabled
    // The `users` relations are mostly NOT cascade in the schema! Wait, they don't have onDelete: "cascade" in schema.ts
    // For safety, let's just do a soft delete for the account by deactivating it.
    await tx.update(users).set({ isActive: false, bio: "Account deleted", avatarUrl: null, email: null, githubAccessToken: null, githubId: `deleted_${user.id}`, username: `deleted_${user.id}` }).where(eq(users.id, userId));
    
    // Revoke all sessions
    await tx.delete(sessions).where(eq(sessions.userId, userId));
  });

  logger.info({ userId }, "User account deleted (soft delete)");
}

/**
 * Recalculate and update the user's score in the users table.
 */
export async function syncUserScore(userId: string) {
  const [scoreResult] = await db
    .select({ totalScore: sql<number>`COALESCE(SUM(${reviews.totalScore}), 0)` })
    .from(reviews)
    .innerJoin(submissions, eq(reviews.submissionId, submissions.id))
    .where(and(eq(submissions.userId, userId), eq(submissions.status, "approved")));

  const newScore = Number(scoreResult?.totalScore ?? 0);
  await db.update(users).set({ score: newScore }).where(eq(users.id, userId));
  logger.info({ userId, score: newScore }, "Synchronized user score");
  return newScore;
}
