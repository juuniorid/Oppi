'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiPaths } from '@/config/api';
import { useApi } from '@/hooks/useApi';

const DEFAULT_POLL_INTERVAL_MS = 30_000;

type UnreadCountResponse = {
  unreadCount: number;
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

  useEffect(() => {
    void loadUnreadCount();

    const intervalId = window.setInterval(() => {
      void loadUnreadCount();
    }, pollIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadUnreadCount, pollIntervalMs]);

  return { unreadCount, loading, refreshUnreadCount: loadUnreadCount };
}
