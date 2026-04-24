'use client';

/**
 * Töölaua külgriba (md+). Taust `surface`; aktiivne rida: kollane läbipaistvus (`primary`)
 * + tekst `ink`; ikoon aktiivne = `yellow-strong`. Logi välja: `primary`/`secondary` hover.
 */
import clsx from 'clsx';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { isMainNavActive, mainNavVisibleItems } from '@/config/main-nav';
import authService from '@/services/auth.service';
import { useUserRole } from '@/context/UserRoleContext';

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useUserRole();
  const items = mainNavVisibleItems(role);

  return (
    <aside className="hidden w-[260px] shrink-0 flex-col rounded-3xl bg-surface p-3 shadow-sm md:flex">
      <nav className="flex-1">
        <ul className="space-y-1">
          {items.map(({ href, label, Icon }) => {
            const active = isMainNavActive(pathname, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={clsx(
                    'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] font-medium transition-colors',
                    active
                      ? 'bg-primary/35 text-ink'
                      : 'text-gray-600 hover:bg-stone-200/60',
                  )}
                >
                  <Icon
                    className={clsx(
                      'h-5 w-5 shrink-0',
                      active ? 'text-yellow-strong' : 'text-gray-400',
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
        onClick={() => void authService.logout()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary/40 px-3 py-3 text-[15px] font-medium text-ink transition hover:bg-secondary/50"
      >
        <LogOut className="h-5 w-5 text-gray-700" strokeWidth={2} />
        Logi välja
      </button>
    </aside>
  );
}
