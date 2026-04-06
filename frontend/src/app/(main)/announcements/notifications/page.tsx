import { redirect } from 'next/navigation';

/** Tagasiühilduvus: üks voog on `/announcements`. */
export default function AnnouncementNotificationsRedirectPage() {
  redirect('/announcements');
}
