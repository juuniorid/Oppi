'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiPaths } from '@/config/api';
import { useApi } from '@/hooks/useApi';
import { NOTIFICATIONS_CHANGED_EVENT } from '@/lib/notification-events';

const DEFAULT_POLL_INTERVAL_MS = 30_000;

type UnreadCountResponse = {
  unreadCount: number;
};

type MarkAllReadResponse = {
  updatedCount: number;
};

/**
 * Keeps unread notifications count synchronized with backend state.
 *
 * This hook is intended for header bell badge usage and relies on
 * authenticated requests with a short polling interval as an MVP.
 */
export function useUnreadNotificationCount(pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const { apiCall } = useApi();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await apiCall<UnreadCountResponse>(
        apiPaths.notifications.unreadCount,
        { skipErrorToast: true }
      );
      setUnreadCount(Number(response?.unreadCount ?? 0));
    } catch {
      // Keep previous value on background polling failure.
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    try {
      await apiCall<MarkAllReadResponse>(apiPaths.notifications.readAll, {
        method: 'PATCH',
        skipErrorToast: true,
      });
      setUnreadCount(0);
      void loadUnreadCount();
      return true;
    } catch {
      // Keep existing count when mark-as-read request fails.
      return false;
    }
  }, [apiCall, loadUnreadCount]);

  useEffect(() => {
    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, pollIntervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void loadUnreadCount();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);

    const handleNotificationsChanged = () => {
      void loadUnreadCount();
    };

    window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, handleNotificationsChanged);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        NOTIFICATIONS_CHANGED_EVENT,
        handleNotificationsChanged
      );
    };
  }, [loadUnreadCount, pollIntervalMs]);

  return {
    unreadCount,
    loading,
    refreshUnreadCount: loadUnreadCount,
    markAllAsRead,
  };
}
