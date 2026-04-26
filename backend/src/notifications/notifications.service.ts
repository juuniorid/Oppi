import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { notificationRecipients, notifications } from 'database/schema';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';

/** One row returned by {@link NotificationsService.listForUser}. */
export type UserNotificationRow = {
  id: number;
  subject: string | null;
  body: string | null;
  readAt: Date | null;
  createdAt: Date;
  audience: string;
};

@Injectable()
export class NotificationsService {
  /**
   * Returns how many notifications are still unread for a user.
   *
   * The count is calculated from per-recipient delivery rows where `readAt`
   * is null, which matches the unread badge behavior in the frontend header.
   */
  async getUnreadCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notificationRecipients)
      .where(
        and(
          eq(notificationRecipients.userId, userId),
          isNull(notificationRecipients.readAt)
        )
      );

    return Number(result?.count ?? 0);
  }

  /**
   * Marks all currently unread notifications as read for one user.
   *
   * Returns how many recipient rows were updated in this operation.
   */
  async markAllAsRead(userId: number): Promise<number> {
    const updatedRows = await db
      .update(notificationRecipients)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationRecipients.userId, userId),
          isNull(notificationRecipients.readAt)
        )
      )
      .returning({ notificationId: notificationRecipients.notificationId });

    return updatedRows.length;
  }

  /**
   * Marks one notification as read for the current user.
   *
   * Returns true when a row was updated, false when the row was already read
   * or did not belong to this user.
   */
  async markAsRead(notificationId: number, userId: number): Promise<boolean> {
    const updatedRows = await db
      .update(notificationRecipients)
      .set({ readAt: new Date() })
      .where(
        and(
          eq(notificationRecipients.notificationId, notificationId),
          eq(notificationRecipients.userId, userId),
          isNull(notificationRecipients.readAt)
        )
      )
      .returning({ notificationId: notificationRecipients.notificationId });

    return updatedRows.length > 0;
  }

  /**
   * Lists notifications delivered to this user (via recipient rows), newest first.
   *
   * Soft-deleted notification envelopes are excluded. Limit is capped server-side.
   */
  async listForUser(userId: number, limit: number): Promise<UserNotificationRow[]> {
    const capped = Math.min(Math.max(limit, 1), 100);

    return db
      .select({
        id: notifications.id,
        subject: notifications.subject,
        body: notifications.body,
        readAt: notificationRecipients.readAt,
        createdAt: notifications.createdAt,
        audience: notifications.audience,
      })
      .from(notificationRecipients)
      .innerJoin(
        notifications,
        eq(notificationRecipients.notificationId, notifications.id)
      )
      .where(
        and(
          eq(notificationRecipients.userId, userId),
          isNull(notifications.deletedAt)
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(capped);
  }
}
