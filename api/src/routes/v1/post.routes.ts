import { Hono } from "hono";
import { eq, and, gt, desc } from "drizzle-orm";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { db } from "../../db/client.js";
import { communityPosts } from "../../db/schema.js";
import { success } from "../../utils/apiResponse.js";
import { notFound } from "../../utils/apiError.js";

const posts = new Hono<AppEnv>();

// All post routes require authentication (any role can read)
posts.use("/*", authMiddleware);

/**
 * GET /api/v1/posts — Paginated feed of published posts, newest first.
 * Available to User + Judge + Admin (read-only).
 * No POST/PATCH/DELETE here — admin-only write lives under /api/v1/admin/posts.
 */
posts.get("/", async (c) => {
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);

  const conditions = [eq(communityPosts.isPublished, true)];
  if (cursor) conditions.push(gt(communityPosts.id, cursor));

  const result = await db.query.communityPosts.findMany({
    where: and(...conditions),
    with: {
      creator: { columns: { id: true, username: true, avatarUrl: true } },
    },
    orderBy: [desc(communityPosts.createdAt)],
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
 * GET /api/v1/posts/:id — Single post detail.
 */
posts.get("/:id", async (c) => {
  const postId = c.req.param("id");
  const post = await db.query.communityPosts.findFirst({
    where: and(eq(communityPosts.id, postId), eq(communityPosts.isPublished, true)),
    with: {
      creator: { columns: { id: true, username: true, avatarUrl: true } },
    },
  });

  if (!post) throw notFound("Post", postId);
  return success(c, post);
});

export default posts;
