import { Hono } from "hono";
import { z } from "zod";
import { eq, and, gt, asc } from "drizzle-orm";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { db } from "../../db/client.js";
import { comments, submissions } from "../../db/schema.js";
import { success, created } from "../../utils/apiResponse.js";
import { notFound, forbidden } from "../../utils/apiError.js";

const commentSchema = z.object({
  message: z.string().min(1).max(2000),
});

const commentRoutes = new Hono<AppEnv>();

commentRoutes.use("/*", authMiddleware);

/**
 * GET /api/v1/submissions/:id/comments
 * Get comment thread on a submission.
 * Available to: submission owner, assigned judge, and admin.
 */
commentRoutes.get("/:id/comments", async (c) => {
  const user = c.get("user");
  const submissionId = c.req.param("id");

  // Verify access
  const submission = await db.query.submissions.findFirst({
    where: eq(submissions.id, submissionId),
  });

  if (!submission) throw notFound("Submission", submissionId);

  // Check access: owner, assigned judge, or admin
  const isOwner = submission.userId === user.id;
  const isAssignedJudge = submission.assignedJudgeId === user.id;
  const isAdmin = user.role === "admin";

  if (!isOwner && !isAssignedJudge && !isAdmin) {
    throw forbidden("You don't have access to this submission's comments");
  }

  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "50", 10);

  const conditions = [eq(comments.submissionId, submissionId)];
  if (cursor) conditions.push(gt(comments.id, cursor));

  const result = await db.query.comments.findMany({
    where: and(...conditions),
    with: {
      author: { columns: { id: true, username: true, avatarUrl: true, role: true } },
    },
    orderBy: [asc(comments.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return success(c, items, {
    nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
    limit,
  });
});

/**
 * POST /api/v1/submissions/:id/comments
 * Add a comment to a submission.
 * Available to: submission owner, assigned judge, and admin.
 */
commentRoutes.post(
  "/:id/comments",
  validate("json", commentSchema),
  async (c) => {
    const user = c.get("user");
    const submissionId = c.req.param("id");
    const { message } = c.req.valid("json" as never) as { message: string };

    const submission = await db.query.submissions.findFirst({
      where: eq(submissions.id, submissionId),
    });

    if (!submission) throw notFound("Submission", submissionId);

    const isOwner = submission.userId === user.id;
    const isAssignedJudge = submission.assignedJudgeId === user.id;
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAssignedJudge && !isAdmin) {
      throw forbidden("You don't have access to comment on this submission");
    }

    const [comment] = await db
      .insert(comments)
      .values({
        submissionId,
        authorId: user.id,
        message,
      })
      .returning();

    return created(c, comment);
  }
);

export default commentRoutes;
