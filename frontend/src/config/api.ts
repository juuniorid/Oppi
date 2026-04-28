export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';

type QueryValue = string | number | boolean | null | undefined;

function withQuery(path: string, query?: Record<string, QueryValue>): string {
  if (!query) {
    return path;
  }

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }
    params.set(key, String(value));
  }

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export const apiPaths = {
  auth: {
    google: '/auth/google',
    me: '/auth/me',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  children: {
    listForParent: '/children/my',
    list: '/children',
    group: (groupId: number) => `/children/group/${groupId}`,
    create: '/children',
    update: (childId: number) => `/children/${childId}`,
    delete: (childId: number) => `/children/${childId}`,
  },
  groups: {
    list: '/groups',
  },
  posts: {
    create: '/posts',
    group: (groupId: number) => `/posts/group/${groupId}`,
  },
  absences: {
    childByRange: ({
      childId,
      from,
      to,
    }: {
      childId: number;
      from: string;
      to: string;
    }) => withQuery(`/absences/child/${childId}`, { from, to }),
    groupByRange: ({
      groupId,
      from,
      to,
    }: {
      groupId: number;
      from: string;
      to: string;
    }) => withQuery(`/absences/group/${groupId}`, { from, to }),
  },
  events: {
    listByRange: ({ from, to }: { from: string; to: string }) =>
      withQuery('/events', { from, to }),
    childByRange: ({
      childId,
      from,
      to,
    }: {
      childId: number;
      from: string;
      to: string;
    }) => withQuery(`/events/child/${childId}`, { from, to }),
    create: '/events',
    update: (eventId: number) => `/events/${eventId}`,
    remove: (eventId: number) => `/events/${eventId}`,
  },
  notifications: {
    list: (limit?: number) => withQuery('/notifications', { limit }),
    read: (notificationId: number) => `/notifications/${notificationId}/read`,
    unreadCount: '/notifications/unread-count',
    readAll: '/notifications/read-all',
  },
  invites: {
    create: '/invites',
  },
};

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
