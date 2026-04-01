'use client';

import clsx from 'clsx';
import {
  Bell,
  Calendar,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Power,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/dashboard', label: 'Avaleht', Icon: Home },
  { href: '/announcements', label: 'Teated', Icon: Bell },
  { href: '/absences', label: 'Kalender', Icon: Calendar },
  { href: '/group', label: 'Vestlus', Icon: MessageCircle },
  { href: '/gallery', label: 'Galerii', Icon: ImageIcon },
  { href: '/settings', label: 'Seaded', Icon: Settings },
] as const;

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  const focusSearch = () => {
    document.getElementById('global-search')?.focus();
  };

  return (
    <aside className="flex w-[260px] shrink-0 flex-col rounded-3xl bg-[#faf8f5] p-3 shadow-sm">
      <nav className="flex-1">
        <ul className="space-y-1">
          {nav.map(({ href, label, Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                    active
                      ? 'bg-amber-100/90 text-gray-900'
                      : 'text-gray-600 hover:bg-stone-200/60'
                  )}
                >
                  <Icon
                    className={clsx(
                      'h-5 w-5 shrink-0',
                      active ? 'text-amber-500' : 'text-gray-400'
                    )}
                    strokeWidth={active ? 2.25 : 2}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <button
        type="button"
        onClick={focusSearch}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-100/90 px-3 py-3 text-[15px] font-medium text-gray-800 transition hover:bg-amber-200/80"
      >
        <Power className="h-5 w-5 text-gray-700" strokeWidth={2} />
        Otsi
      </button>
    </aside>
  );
}
