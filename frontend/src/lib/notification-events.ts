/**
 * Lightweight cross-component signal for notification-related UI updates.
 *
 * The header unread badge hook listens for this event so other screens (for
 * example `/announcements`) can trigger an immediate refetch after mutating
 * read state, without introducing global React state.
 */
export const NOTIFICATIONS_CHANGED_EVENT = 'oppi:notifications-changed';

export function dispatchNotificationsChanged(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_CHANGED_EVENT));
}
