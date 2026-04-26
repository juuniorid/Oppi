'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { TeatedFeed, type TeatedItem } from '@/components/TeatedFeed';
import {
  dispatchNotificationsChanged,
  NOTIFICATIONS_CHANGED_EVENT,
} from '@/lib/notification-events';
import notificationService, {
  type ApiNotification,
} from '@/services/notification.service';
import postService from '@/services/post.service';
import type { Post } from '@/types';

/**
 * /announcements: loads group posts and user notifications from the API, maps them
 * into {@link TeatedItem} for {@link TeatedFeed}. Group id is still a placeholder
 * until the app has a real current-group context.
 */
export default function AnnouncementsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);

  const loadAnnouncements = useCallback(async (): Promise<{
    posts: Post[];
    notifications: ApiNotification[];
  }> => {
    // If the backend is down or an endpoint fails, we silently show an empty slice.
    const [postData, notificationData] = await Promise.all([
      postService.getPostsByGroup(1).catch(() => [] as Post[]),
      notificationService.list(50).catch(() => [] as ApiNotification[]),
    ]);
    return {
      posts: Array.isArray(postData) ? postData : [],
      notifications: Array.isArray(notificationData) ? notificationData : [],
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const syncAnnouncements = async () => {
      const next = await loadAnnouncements();
      if (cancelled) return;
      setPosts(next.posts);
      setNotifications(next.notifications);
    };

    void syncAnnouncements();

    const handleNotificationsChanged = () => {
      if (cancelled) return;
      void syncAnnouncements();
    };

    window.addEventListener(
      NOTIFICATIONS_CHANGED_EVENT,
      handleNotificationsChanged
    );

    return () => {
      cancelled = true;
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        handleNotificationsChanged
      );
    };
  }, [loadAnnouncements]);

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

  const handleNotificationOpen = async (
    notificationId: number,
    readAt: string | null
  ) => {
    if (readAt != null) return;

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
      dispatchNotificationsChanged({ countDelta: -1 });
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
