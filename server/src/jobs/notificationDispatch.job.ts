import { Job } from "bullmq";
import { db } from "../db/client";
import { notifications } from "../db/schema";
import { logger } from "../config/logger";

interface NotificationData {
  userId: string;
  type: string;
  message: string;
  relatedEntityId?: string;
}

/**
 * BullMQ job to dispatch notifications asynchronously.
 * Creates the notification record in DB.
 * Email dispatch is stubbed — would integrate with SendGrid/SES in production.
 */
export async function processNotificationDispatch(
  job: Job<NotificationData>
) {
  const { userId, type, message, relatedEntityId } = job.data;

  logger.info({ userId, type, jobId: job.id }, "Dispatching notification");

  try {
    // Create notification in DB
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        message,
        relatedEntityId,
        isRead: false,
      })
      .returning();

    // TODO: Email dispatch (SendGrid/SES)
    // if (userPreferences.emailNotifications) {
    //   await emailService.send(userId, type, message);
    // }

    logger.info(
      { notificationId: notification!.id, userId, type },
      "Notification dispatched"
    );

    return { notificationId: notification!.id };
  } catch (error) {
    logger.error(
      { userId, type, jobId: job.id, error },
      "Notification dispatch failed"
    );
    throw error;
  }
}
