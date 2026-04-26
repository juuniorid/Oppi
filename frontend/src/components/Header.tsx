'use client';

/**
 * Main application header with branding, search, role-specific controls,
 * and notification bell badge synchronized with unread server state.
 */
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, BookOpen, Search } from 'lucide-react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { useChildSelection } from '@/context/ChildSelectionContext';
import { useUserRole } from '@/context/UserRoleContext';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import { USER_ROLE } from '@/types/enums';

export function Header() {
  const router = useRouter();
  const { children, selectedChildId, setSelectedChildId, loading } = useChildSelection();
  const { role } = useUserRole();
  const { unreadCount, loading: unreadLoading } = useUnreadNotificationCount();
  const showBadge = !unreadLoading && unreadCount > 0;
  const badgeCountText = unreadCount > 99 ? '99+' : String(unreadCount);
  const notificationsAriaLabel = unreadLoading
    ? 'Notifications, loading'
    : unreadCount > 0
      ? `Notifications, ${unreadCount} unread`
      : 'Notifications, none unread';
  const handleNotificationsClick = () => {
    router.push('/announcements');
  };

  return (
    <header className="mb-4 flex h-14 shrink-0 items-center gap-3 border-b border-divider bg-surface px-4 md:h-16 md:gap-4 md:px-6">
      <Link
        href="/dashboard"
        className="flex min-w-0 shrink-0 items-center gap-2 text-ink md:gap-2.5"
      >
        <BookOpen
          className="h-8 w-8 shrink-0 text-yellow-strong md:h-9 md:w-9"
          strokeWidth={2}
          aria-hidden
        />
        <span className="text-lg font-bold tracking-tight md:text-xl">
          Oppi
        </span>
      </Link>

      {/* Search is hidden on mobile (per mockup) and shown as a pill input on desktop. */}
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
            className="w-full rounded-full border-0 bg-stone-200/80 py-3 pl-12 pr-5 text-sm text-ink placeholder:text-gray-500 shadow-inner outline-none ring-0 transition focus:bg-stone-200 focus:ring-2 focus:ring-primary/45"
          />
        </div>
      </div>

      {role === USER_ROLE.PARENT ? (
      <div className="hidden shrink-0 md:block">
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel id="child-select-label">Muuda laps</InputLabel>
          <Select
          labelId="child-select-label"
          id="child-select"
          value={selectedChildId != null ? String(selectedChildId) : ''}
          label="Muuda laps"
          onChange={(e: SelectChangeEvent) => {
            const nextId = Number(e.target.value);
            if (!Number.isNaN(nextId) && nextId > 0) {
              setSelectedChildId(nextId);
            }
          }}
          disabled={loading || children.length <= 1}
  
        >
          {children.length === 0 ? (
            <MenuItem value="">Ei leitud lapsi</MenuItem>
          ) : <MenuItem value="">Vali laps</MenuItem>}
            <MenuItem key={"1"} value={"Robert"}>
              {"Robert"}
            </MenuItem>
          {children.map((child) => (       
            <MenuItem key={child.id} value={String(child.id)}>
              {child.firstName?.trim()}
            </MenuItem>
          ))}
          </Select>
        </FormControl>
      </div>
      ) : null}

      <div className="ml-auto flex shrink-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={handleNotificationsClick}
          className="relative rounded-full p-1 text-slate-900 transition hover:bg-stone-200/80"
          aria-label={notificationsAriaLabel}
        >
          <Bell
            className={`h-6 w-6 ${unreadLoading ? 'animate-pulse opacity-70' : ''}`}
            strokeWidth={2}
          />
          {unreadLoading ? (
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-stone-400/80" />
          ) : null}
          {showBadge ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-ink">
              {badgeCountText}
            </span>
          ) : null}
        </button>
        <div
          className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary via-secondary to-accent-teal ring-2 ring-white shadow-sm"
          role="img"
          aria-label="Profiil"
        />
      </div>
    </header>
  );
}
