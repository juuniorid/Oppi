import Link from 'next/link';

export function Sidebar() {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <nav>
        <ul>
          <li><Link href="/dashboard/announcements">Announcements</Link></li>
          <li><Link href="/dashboard/group">My Group</Link></li>
          <li><Link href="/dashboard/messages">Messages</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
