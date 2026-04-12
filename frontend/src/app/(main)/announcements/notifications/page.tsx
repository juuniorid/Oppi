import { redirect } from 'next/navigation';

/**
 * Legacy or alternate URL for notifications under announcements.
 * Keeps old links working by sending users to the main announcements list.
 */
export default function AnnouncementNotificationsRedirectPage() {
  redirect('/announcements');
}
