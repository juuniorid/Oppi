import Link from 'next/link';
import { Bell, BookOpen, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="flex h-14 mb-4 shrink-0 items-center gap-3 border-b border-stone-200/80 bg-[#faf8f5] px-4 md:h-16 md:gap-4 md:px-6">
      <Link
        href="/dashboard"
        className="flex min-w-0 shrink-0 items-center gap-2 text-gray-800 md:gap-2.5"
      >
        <BookOpen
          className="h-8 w-8 shrink-0 text-amber-400 md:h-9 md:w-9"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-lg font-bold tracking-tight md:text-xl">
          Oppi
        </span>
      </Link>

      {/* Mobiilis otsing peidetud (mockup); töölaual pill-otsing */}
      <div className="hidden min-w-0 flex-1 justify-center px-2 md:flex md:px-4">
        <div className="relative w-full max-w-2xl">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            id="global-search"
            type="search"
            name="q"
            placeholder="Otsi"
            className="w-full rounded-full border-0 bg-stone-200/80 py-3 pl-12 pr-5 text-sm text-gray-900 placeholder:text-gray-500 shadow-inner outline-none ring-0 transition focus:bg-stone-200 focus:ring-2 focus:ring-amber-300/60"
          />
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          className="relative rounded-full p-1 text-slate-900 transition hover:bg-stone-200/80"
          aria-label="Teavitused, 2 uut"
        >
          <Bell className="h-6 w-6" strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold leading-none text-gray-900">
            2
          </span>
        </button>
        <div
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 ring-2 ring-white shadow-sm"
          role="img"
          aria-label="Profiil"
        />
      </div>
    </header>
  );
}
