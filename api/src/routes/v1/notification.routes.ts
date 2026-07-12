import { Hono } from "hono";
import { eq, and, gt, desc } from "drizzle-orm";
import type { AppEnv } from "../../types/index.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { db } from "../../db/client.js";
import { notifications } from "../../db/schema.js";
import { success } from "../../utils/apiResponse.js";
import { notFound, forbidden } from "../../utils/apiError.js";

const notification = new Hono<AppEnv>();

notification.use("/*", authMiddleware);

/** GET /api/v1/notifications — List own notifications */
notification.get("/", async (c) => {
  const user = c.get("user");
  const cursor = c.req.query("cursor");
  const limit = parseInt(c.req.query("limit") || "20", 10);

  const conditions = [eq(notifications.userId, user.id)];
  if (cursor) conditions.push(gt(notifications.id, cursor));

  const result = await db.query.notifications.findMany({
    where: and(...conditions),
    orderBy: [desc(notifications.createdAt)],
    limit: limit + 1,
  });

  const hasMore = result.length > limit;
  const items = hasMore ? result.slice(0, limit) : result;

  return success(c, items, {
    nextCursor: hasMore && items[items.length - 1] ? items[items.length - 1]!.id : null,
    limit,
  });
});

/** PATCH /api/v1/notifications/:id/read — Mark single as read */
notification.patch("/:id/read", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const notif = await db.query.notifications.findFirst({
    where: eq(notifications.id, id),
  });

  if (!notif) throw notFound("Notification", id);
  if (notif.userId !== user.id) throw forbidden("Not your notification");

  const [updated] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, id))
    .returning();

  return success(c, updated);
});

/** PATCH /api/v1/notifications/read-all — Mark all as read */
notification.patch("/read-all", async (c) => {
  const user = c.get("user");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  return success(c, { message: "All notifications marked as read" });
});

/** DELETE /api/v1/notifications/:id — Delete a notification */
notification.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");

  const notif = await db.query.notifications.findFirst({
    where: eq(notifications.id, id),
  });

  if (!notif) throw notFound("Notification", id);
  if (notif.userId !== user.id) throw forbidden("Not your notification");

  await db.delete(notifications).where(eq(notifications.id, id));
  return success(c, { message: "Notification deleted" });
});

export default notification;
