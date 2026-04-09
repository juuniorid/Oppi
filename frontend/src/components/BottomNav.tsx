'use client';

import clsx from 'clsx';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  isMainNavActive,
  mainNavDockItems,
  mainNavOverflowItems,
} from '@/config/main-nav';

/**
 * Mobiilne alumine nav (md peidetud). `fixed` — lehelõigu padding on `(main)/layout.tsx`-is.
 * Värvid: `surface`, `divider`; aktiivne tab: tekst `ink`, ikoon `yellow-strong`.
 * „Rohkem“ menüü: sama; taust overlay must/25.
 */
export function BottomNav() {
  const pathname = usePathname();
  const dock = mainNavDockItems();
  const overflow = mainNavOverflowItems();
  const [moreOpen, setMoreOpen] = useState(false);

  const overflowActive = overflow.some((i) => isMainNavActive(pathname, i.href));
  const showMore = overflow.length > 0;

  useEffect(() => {
    if (!moreOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moreOpen]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-divider bg-surface/95 backdrop-blur-sm md:hidden"
      aria-label="Mobiilne navigeerimine"
    >
      <ul
        className={clsx(
          'grid gap-0 px-0.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5',
          showMore ? 'grid-cols-4' : 'grid-cols-3',
        )}
      >
        {dock.map(({ href, label, Icon }) => {
          const active = isMainNavActive(pathname, href);
          return (
            <li key={href} className="min-w-0">
              <Link
                href={href}
                className={clsx(
                  'flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 text-[10px] font-medium leading-tight transition-colors',
                  active
                    ? 'text-ink'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon
                  className={clsx(
                    'h-5 w-5 shrink-0',
                    active ? 'text-yellow-strong' : 'text-gray-400',
                  )}
                  strokeWidth={active ? 2.25 : 2}
                />
                <span className="line-clamp-2 w-full text-center">{label}</span>
              </Link>
            </li>
          );
        })}

        {showMore ? (
          <li className="relative min-w-0">
            <button
              type="button"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              onClick={() => setMoreOpen((o) => !o)}
              className={clsx(
                'flex w-full flex-col items-center gap-0.5 rounded-lg px-0.5 py-1 text-[10px] font-medium leading-tight transition-colors',
                overflowActive || moreOpen
                  ? 'text-ink'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <Menu
                className={clsx(
                  'h-5 w-5 shrink-0',
                  overflowActive || moreOpen ? 'text-yellow-strong' : 'text-gray-400',
                )}
                strokeWidth={overflowActive || moreOpen ? 2.25 : 2}
              />
              <span className="line-clamp-2 w-full text-center">Rohkem</span>
            </button>

            {moreOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40 bg-black/25"
                  aria-label="Sulge menüü"
                  onClick={() => setMoreOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute bottom-full left-1/2 z-50 mb-2 w-[min(18rem,calc(100vw-1rem))] -translate-x-1/2 rounded-2xl border border-divider bg-white py-2 shadow-lg"
                >
                  {overflow.map(({ href, label, Icon }) => {
                    const active = isMainNavActive(pathname, href);
                    return (
                      <Link
                        key={href}
                        href={href}
                        role="menuitem"
                        onClick={() => setMoreOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-4 py-3 text-sm font-medium',
                          active
                            ? 'bg-primary/25 text-ink'
                            : 'text-gray-700 hover:bg-stone-50',
                        )}
                      >
                        <Icon
                          className={clsx(
                            'h-5 w-5 shrink-0',
                            active ? 'text-yellow-strong' : 'text-gray-400',
                          )}
                          strokeWidth={2}
                        />
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : null}
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
