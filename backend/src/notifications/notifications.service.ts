import { Injectable } from '@nestjs/common';
import { db } from 'database/db';
import { notificationRecipients } from 'database/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';

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
}
