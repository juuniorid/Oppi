'use client';

import { Building2, Inbox } from 'lucide-react';
import { useMemo } from 'react';

export type TeatedItem =
  | {
      kind: 'group';
      id: string;
      title: string;
      body: string;
      at: string;
    }
  | {
      kind: 'personal';
      id: string;
      senderName: string;
      groupName: string;
      body: string;
      at: string;
    };

/** Ajutine: isiklikud read kuni API ühtset voogu pakub. */
export const MOCK_PERSONAL_TEATED: Extract<TeatedItem, { kind: 'personal' }>[] =
  [
    {
      kind: 'personal',
      id: 'p1',
      senderName: 'Rain Müürisepp',
      groupName: 'Päevalill Rühm — Rühm B',
      body: 'Kate jäi täna pärastlõunase uinaku ajal veidi teistest eemale, aga oli siiski rõõmus.',
      at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      kind: 'personal',
      id: 'p2',
      senderName: 'Rain Müürisepp',
      groupName: 'Päevalill Rühm — Rühm A',
      body: 'Hommikune jalutuskäik jäi lühemaks, sest sadas hetkeks vihma; jätkame homme samal ajal.',
      at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      kind: 'personal',
      id: 'p3',
      senderName: 'Kadri Kask',
      groupName: 'Päevalill Rühm — Rühm A',
      body: 'Täname kõiki, kes tõid täna maiustusi — jagasime need pärast lõunat.',
      at: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    },
  ];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatTeatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat('et-EE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type TeatedFeedProps = {
  items: TeatedItem[];
};

export function TeatedFeed({ items }: TeatedFeedProps) {
  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
      ),
    [items]
  );

  if (sorted.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-divider bg-canvas shadow-sm">
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/30 text-yellow-strong">
            <Inbox className="h-8 w-8" strokeWidth={2} aria-hidden />
          </div>
          <p className="max-w-sm text-base text-ink/65">
            Sul pole veel teateid.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-divider bg-canvas shadow-sm">
      <ul className="divide-y divide-divider">
        {sorted.map((item) =>
          item.kind === 'group' ? (
            <li key={item.id} className="px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex gap-3 sm:gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-yellow-strong shadow-sm ring-2 ring-white"
                  aria-hidden
                >
                  <Building2 className="h-5 w-5" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/45">
                    Rühm
                  </p>
                  <h2 className="text-[15px] font-semibold leading-snug text-ink">
                    {item.title}
                  </h2>
                  <p className="mt-2 border-l-2 border-divider pl-3 text-sm leading-relaxed text-ink/55">
                    {item.body}
                  </p>
                  <time
                    className="mt-2 block text-xs tabular-nums text-ink/45"
                    dateTime={item.at}
                  >
                    {formatTeatedAt(item.at)}
                  </time>
                </div>
              </div>
            </li>
          ) : (
            <li key={item.id} className="px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex gap-3 sm:gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-secondary to-accent-teal text-xs font-bold text-ink shadow-sm ring-2 ring-white"
                  aria-hidden
                >
                  {initials(item.senderName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-ink/45">
                    Õpetaja
                  </p>
                  <p className="text-[15px] font-semibold leading-snug text-ink">
                    {item.senderName}
                  </p>
                  <p className="mt-0.5 text-sm text-ink/70">{item.groupName}</p>
                  <p className="mt-2 border-l-2 border-divider pl-3 text-sm leading-relaxed text-ink/55">
                    {item.body}
                  </p>
                  <time
                    className="mt-2 block text-xs tabular-nums text-ink/45"
                    dateTime={item.at}
                  >
                    {formatTeatedAt(item.at)}
                  </time>
                </div>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
