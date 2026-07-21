import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/client";
import { notifications } from "../db/schema";
import { notFound, forbidden } from "../utils/apiError";

export async function getNotifications(userId: string) {
  const result = await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: [desc(notifications.createdAt)],
  });
  return result;
}

export async function markAsRead(userId: string, notificationId: string) {
  const [notification] = await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  if (!notification) throw notFound("Notification", notificationId);
  return notification;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
}

export async function deleteNotification(userId: string, notificationId: string) {
  const [deleted] = await db
    .delete(notifications)
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning();

  if (!deleted) throw notFound("Notification", notificationId);
  return deleted;
}

export async function createNotification(data: {
  userId: string;
  type: string;
  message: string;
  relatedEntityId?: string;
}) {
  const [notification] = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    message: data.message,
    relatedEntityId: data.relatedEntityId,
  }).returning();
  return notification;
}
