import Link from 'next/link';

const nav = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/announcements', label: 'Announcements' },
  { href: '/group', label: 'My group' },
  { href: '/messages', label: 'Messages' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/docs', label: 'Docs' },
  { href: '/settings', label: 'Settings' },
] as const;

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-100 p-4">
      <nav>
        <ul className="space-y-1">
          {nav.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="block rounded-md px-2 py-1.5 text-gray-800 hover:bg-gray-200"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
