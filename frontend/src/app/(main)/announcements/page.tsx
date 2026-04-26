'use client';

import { useEffect, useMemo, useState } from 'react';
import { TeatedFeed, type TeatedItem } from '@/components/TeatedFeed';
import notificationService, {
  type ApiNotification,
} from '@/services/notification.service';
import postService from '@/services/post.service';
import type { Post } from '@/types';
import { dispatchNotificationsChanged } from '@/lib/notification-events';

/**
 * /announcements: loads group posts and user notifications from the API, maps them
 * into {@link TeatedItem} for {@link TeatedFeed}. Group id is still a placeholder
 * until the app has a real current-group context.
 */
export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  useEffect(() => {
    let cancelled = false;
    // If the backend is down or an endpoint fails, we silently show an empty slice.
    Promise.all([
      postService.getPostsByGroup(1).catch(() => [] as Post[]),
      notificationService.list(50).catch(() => [] as ApiNotification[]),
    ]).then(([postData, notificationData]) => {
      if (cancelled) return;
      setPosts(Array.isArray(postData) ? postData : []);
      setNotifications(
        Array.isArray(notificationData) ? notificationData : []
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Map backend Post shape into feed rows (today: group posts only).
  const feedItems = useMemo<TeatedItem[]>(() => {
    const groupItems: TeatedItem[] = posts.map((post) => ({
      kind: 'group' as const,
      id: `g-${post.id}`,
      title: post.title,
      body: post.message,
      at: post.createdAt,
    }));
    const notificationItems: TeatedItem[] = notifications.map((n) => ({
      kind: 'notification' as const,
      id: `n-${n.id}`,
      notificationId: n.id,
      title: (n.subject ?? '').trim() || 'Teavitus',
      body: n.body ?? '',
      at: n.createdAt,
      readAt: n.readAt,
    }));
    return [...groupItems, ...notificationItems];
  }, [posts, notifications]);

  const handleNotificationOpen = async (notificationId: number) => {
    try {
      const updated = await notificationService.markAsRead(notificationId);
      if (!updated) return;
      setNotifications((current) =>
        current.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item
        )
      );
      dispatchNotificationsChanged();
    } catch {
      // Keep local state as is; unread count hook will eventually re-sync.
    }
  };

  return (
    <TeatedFeed
      items={feedItems}
      onNotificationOpen={handleNotificationOpen}
    />
  );
}
