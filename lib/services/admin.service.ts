import { eq, and, gt, asc, desc, count, sql } from "drizzle-orm";
import { db } from "../db/client";
import {
  users,
  tasks,
  submissions,
  reviews,
  auditLog,
  communityPosts,
} from "../db/schema";
import { notFound, badRequest } from "../utils/apiError";
import { reassignSubmission, computeJudgeLoadScore } from "./assignment.service";
import { AUDIT_ACTIONS, NOTIFICATION_TYPES } from "../utils/constants";
import { checkAndPromoteUser, syncUserScore, syncTeamScore } from "./user.service";
import { env } from "../config/env";
import { enrichReviewWithScores } from "./judge.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  UpdateUserInput,
  ChangeRoleInput,
  ManualAssignInput,
  OverrideReviewInput,
  CreatePostInput,
  UpdatePostInput,
} from "../validators/admin.validator";

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

export async function getDashboard() {
  const [userCount] = await db.select({ count: count() }).from(users);
  const [judgeCount] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.role, "judge"));
  const [taskCount] = await db.select({ count: count() }).from(tasks);

  const statusCounts = await db
    .select({
      status: submissions.status,
      count: count(),
    })
    .from(submissions)
    .groupBy(submissions.status);

  return {
    totalUsers: userCount?.count ?? 0,
    totalJudges: judgeCount?.count ?? 0,
    totalTasks: taskCount?.count ?? 0,
    submissionsByStatus: Object.fromEntries(
      statusCounts.map((r) => [r.status, r.count])
    ),
  };
}

export async function getActivityFeed(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(auditLog.id, cursor));

  const result = await db.query.auditLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      actor: { columns: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: [desc(auditLog.createdAt)],
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
// User Management
// ──────────────────────────────────────────────

export async function getUsers(
  filters: { role?: string; rank?: string; cursor?: string; limit?: number } = {}
) {
  const limit = filters.limit ?? 20;
  const conditions = [];

  if (filters.role) conditions.push(eq(users.role, filters.role as "admin" | "judge" | "user"));
  if (filters.rank) conditions.push(eq(users.rank, filters.rank as "Ronin" | "Kenshi" | "Samurai" | "Shogun"));
  if (filters.cursor) conditions.push(gt(users.id, filters.cursor));

  const result = await db.query.users.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    columns: { githubAccessToken: false },
    orderBy: [asc(users.id)],
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

export async function getUserById(userId: string) {
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

export async function updateUser(
  adminId: string,
  userId: string,
  data: UpdateUserInput
) {
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role, rank: users.rank, isActive: users.isActive });

  if (!updated) throw notFound("User", userId);

  // Audit log
  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    targetType: "user",
    targetId: userId,
    metadata: data,
  });

  return updated;
}

export async function changeUserRole(
  adminId: string,
  userId: string,
  data: ChangeRoleInput
) {
  const [updated] = await db
    .update(users)
    .set({ role: data.role })
    .where(eq(users.id, userId))
    .returning({ id: users.id, role: users.role });

  if (!updated) throw notFound("User", userId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
    targetType: "user",
    targetId: userId,
    metadata: { newRole: data.role },
  });

  return updated;
}

export async function deleteUser(adminId: string, userId: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw notFound("User", userId);

  await db.update(users).set({ isActive: false }).where(eq(users.id, userId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.USER_DELETED,
    targetType: "user",
    targetId: userId,
    metadata: { username: user.username },
  });
}

// ──────────────────────────────────────────────
// Task Management
// ──────────────────────────────────────────────

export async function createTask(adminId: string, data: CreateTaskInput) {
  const [task] = await db
    .insert(tasks)
    .values({ ...data, createdBy: adminId })
    .returning();

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_CREATED,
    targetType: "task",
    targetId: task!.id,
    metadata: { title: data.title },
  });

  return task!;
}

export async function getAllTasks(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(tasks.id, cursor));

  const result = await db.query.tasks.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(tasks.createdAt)],
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

export async function updateTask(
  adminId: string,
  taskId: string,
  data: UpdateTaskInput
) {
  const [updated] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) throw notFound("Task", taskId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_UPDATED,
    targetType: "task",
    targetId: taskId,
    metadata: data,
  });

  return updated;
}

export async function deleteTask(adminId: string, taskId: string) {
  const [updated] = await db
    .update(tasks)
    .set({ isActive: false })
    .where(eq(tasks.id, taskId))
    .returning();

  if (!updated) throw notFound("Task", taskId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.TASK_DELETED,
    targetType: "task",
    targetId: taskId,
  });
}

// ──────────────────────────────────────────────
// Submission & Review Oversight
// ──────────────────────────────────────────────

export async function getAllSubmissions(
  filters: { status?: string; cursor?: string; limit?: number } = {}
) {
  const limit = filters.limit ?? 20;
  const conditions = [];

  if (filters.status)
    conditions.push(eq(submissions.status, filters.status as "pending" | "in_review" | "approved" | "rejected"));
  if (filters.cursor) conditions.push(gt(submissions.id, filters.cursor));

  const result = await db.query.submissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      task: { columns: { id: true, title: true, category: true } },
      user: { columns: { id: true, username: true } },
      assignedJudge: { columns: { id: true, username: true } },
      review: true,
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
    userName: s.user?.username,
    repoId: s.repoId,
    repoUrl: s.repoUrl,
    repoName: s.repoName,
    status: s.status,
    assignedJudgeId: s.assignedJudgeId,
    judgeName: s.assignedJudge?.username,
    autoAssigned: s.autoAssigned,
    submittedAt: s.submittedAt,
    score: s.review?.totalScore ?? null,
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

export async function getSubmissionById(submissionId: string) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
    with: { task: true, user: true, assignedJudge: true, review: true },
  });

  if (!submission) throw notFound("Submission", submissionId);
  
  return {
    id: submission.id,
    taskId: submission.taskId,
    taskTitle: submission.task?.title,
    userId: submission.userId,
    userName: submission.user?.username,
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
    user: submission.user,
    assignedJudge: submission.assignedJudge,
  };
}

export async function manualAssign(
  adminId: string,
  submissionId: string,
  data: ManualAssignInput
) {
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);

  const judge = await db.query.users.findFirst({
    where: and(eq(users.id, data.judgeId), eq(users.role, "judge")),
  });

  if (!judge) throw notFound("Judge", data.judgeId);

  // Self-review guard
  if (submission.userId === data.judgeId) {
    throw badRequest("Cannot assign a judge to their own submission", "SELF_REVIEW");
  }

  await db
    .update(submissions)
    .set({
      assignedJudgeId: data.judgeId,
      assignedAt: new Date(),
      status: "in_review",
      autoAssigned: false,
    })
    .where(eq(submissions.id, submissionId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.SUBMISSION_ASSIGNED,
    targetType: "submission",
    targetId: submissionId,
    metadata: { judgeId: data.judgeId },
  });

  await notificationQueue.add("notify-assigned", {
    userId: data.judgeId,
    type: NOTIFICATION_TYPES.SUBMISSION_ASSIGNED,
    message: "You have been manually assigned a submission to review",
    relatedEntityId: submissionId,
  });
}

export async function getUnassignedSubmissions(cursor?: string, limit = 20) {
  const conditions = [
    eq(submissions.status, "pending"),
    sql`${submissions.assignedJudgeId} IS NULL`,
  ];
  if (cursor) conditions.push(gt(submissions.id, cursor));

  const result = await db.query.submissions.findMany({
    where: and(...conditions),
    with: {
      task: { columns: { id: true, title: true } },
      user: { columns: { id: true, username: true } },
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

export async function adminReassign(
  adminId: string,
  submissionId: string,
  excludeJudgeId?: string
) {
  const assigned = await reassignSubmission(submissionId, excludeJudgeId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.SUBMISSION_REASSIGNED,
    targetType: "submission",
    targetId: submissionId,
    metadata: { excludeJudgeId },
  });

  return assigned;
}

export async function overrideReview(
  adminId: string,
  reviewId: string,
  data: OverrideReviewInput
) {
  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, reviewId),
    with: { submission: true },
  });

  if (!review) throw notFound("Review", reviewId);

  const updateData: Record<string, unknown> = {};
  if (data.totalScore !== undefined) updateData.totalScore = data.totalScore;
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

  // Update submission decision if provided
  if (data.decision && review.submission) {
    await db
      .update(submissions)
      .set({ status: data.decision })
      .where(eq(submissions.id, review.submissionId));

    if (data.decision === "approved") {
      await checkAndPromoteUser(review.submission.userId, review.submission.taskId);
    }
  }

  // Sync user or team score
  if (review.submission) {
    if (review.submission.teamId) {
      await syncTeamScore(review.submission.teamId);
    } else {
      await syncUserScore(review.submission.userId);
    }
  }

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.REVIEW_OVERRIDDEN,
    targetType: "review",
    targetId: reviewId,
    metadata: data,
  });

  // Recalculate leaderboard
  // await leaderboardQueue.add("recalculate", {});

  return enrichReviewWithScores(updated)!;
}

export async function getAllReviews(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(reviews.id, cursor));

  const result = await db.query.reviews.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      judge: { columns: { id: true, username: true } },
      submission: {
        with: {
          task: { columns: { id: true, title: true } },
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
    items,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// Leaderboard Management
// ──────────────────────────────────────────────

export async function triggerLeaderboardRecalculation() {
  // const job = await leaderboardQueue.add("admin-recalculate", {});
  return { jobId: "sync" };
}

// ──────────────────────────────────────────────
// Judge Management
// ──────────────────────────────────────────────

export async function getJudges(cursor?: string, limit = 20) {
  const conditions = [eq(users.role, "judge")];
  if (cursor) conditions.push(gt(users.id, cursor));

  const judges = await db.query.users.findMany({
    where: and(...conditions),
    columns: { githubAccessToken: false },
    orderBy: [asc(users.id)],
    limit: limit + 1,
  });

  const hasMore = judges.length > limit;
  const items = hasMore ? judges.slice(0, limit) : judges;

  // Enrich with workload stats
  const enriched = await Promise.all(
    items.map(async (judge) => {
      const loadScore = await computeJudgeLoadScore(judge.id, judge.username);
      return { ...judge, workload: loadScore };
    })
  );

  return {
    items: enriched,
    meta: {
      nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
      limit,
    },
  };
}

// ──────────────────────────────────────────────
// Community Posts (admin CRUD)
// ──────────────────────────────────────────────

export async function createPost(adminId: string, data: CreatePostInput) {
  const [post] = await db
    .insert(communityPosts)
    .values({ ...data, createdBy: adminId })
    .returning();

  return post!;
}

export async function getAdminPosts(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(communityPosts.id, cursor));

  const result = await db.query.communityPosts.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(communityPosts.createdAt)],
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

export async function updatePost(
  adminId: string,
  postId: string,
  data: UpdatePostInput
) {
  const [updated] = await db
    .update(communityPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(communityPosts.id, postId))
    .returning();

  if (!updated) throw notFound("Post", postId);

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.POST_UPDATED,
    targetType: "post",
    targetId: postId,
    metadata: data,
  });

  return updated;
}

export async function deletePost(adminId: string, postId: string) {
  const post = await db.query.communityPosts.findFirst({
    where: eq(communityPosts.id, postId),
  });
  if (!post) throw notFound("Post", postId);

  await db.delete(communityPosts).where(eq(communityPosts.id, postId));

  await db.insert(auditLog).values({
    actorId: adminId,
    action: AUDIT_ACTIONS.POST_DELETED,
    targetType: "post",
    targetId: postId,
  });
}

// ──────────────────────────────────────────────
// Audit Log
// ──────────────────────────────────────────────

export async function getAuditLog(cursor?: string, limit = 20) {
  const conditions = [];
  if (cursor) conditions.push(gt(auditLog.id, cursor));

  const result = await db.query.auditLog.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: { actor: { columns: { id: true, username: true } } },
    orderBy: [desc(auditLog.createdAt)],
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

/**
 * Get aggregated performance metrics for a specific judge.
 */
export async function getJudgePerformance(judgeId: string) {
  const judge = await db.query.users.findFirst({
    where: eq(users.id, judgeId),
    columns: { username: true, fullName: true },
  });

  if (!judge) throw notFound("Judge", judgeId);

  const [reviewedResult] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));
  const totalReviews = reviewedResult?.count ?? 0;

  const [avgScoreResult] = await db
    .select({ avgScore: sql<number>`COALESCE(AVG(${reviews.totalScore}), 0)` })
    .from(reviews)
    .where(eq(reviews.judgeId, judgeId));
  const avgScoreGiven = Number(avgScoreResult?.avgScore ?? 0);

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
  const avgTurnaroundHours = Number(
    (turnaroundResult as unknown as Array<{ avg_hours: string | null }>)[0]?.avg_hours ?? 0
  );

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

  return {
    judgeId,
    judgeName: judge.fullName || judge.username,
    totalReviews,
    avgScoreGiven,
    avgTurnaroundHours,
    pendingCount,
  };
}
