import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Calendar,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Settings,
  UserPlus,
} from 'lucide-react';

/** Mobiil: alumisel ribal täpselt 3 kirjet + 4. koht on „Rohkem“ (ülejäänud lingid). */
export const MOBILE_DOCK_SLOTS = 3 as const;

/**
 * Üks nimekiri kogu pearuumi jaoks (külgriba).
 *
 * Mobiil: täpselt `MOBILE_DOCK_SLOTS` kirjet `dock` — ülejäänud `overflow`
 * avaneb „Rohkem“ menüüst. Uus leht: lisa kirje; tõenäoliselt `overflow`, kuni
 * toode valib 3 prioriteetset dock’i.
 */
export type MainNavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  mobile: 'dock' | 'overflow';
  /** If set, only users with one of these roles will see this item. */
  roles?: string[];
};

export const mainNav: MainNavItem[] = [
  { href: '/dashboard', label: 'Avaleht', Icon: Home, mobile: 'dock' },
  { href: '/announcements', label: 'Teated', Icon: Bell, mobile: 'dock' },
  { href: '/calendar', label: 'Kalender', Icon: Calendar, mobile: 'dock' },
  { href: '/messages', label: 'Vestlus', Icon: MessageCircle, mobile: 'overflow' },
  { href: '/gallery', label: 'Galerii', Icon: ImageIcon, mobile: 'overflow' },
  { href: '/settings', label: 'Seaded', Icon: Settings, mobile: 'overflow' },
  { href: '/admin', label: 'Kutsu kasutaja', Icon: UserPlus, mobile: 'overflow', roles: ['ADMIN'] },
];

if (process.env.NODE_ENV === 'development') {
  const dockCount = mainNav.filter((i) => i.mobile === 'dock').length;
  if (dockCount !== MOBILE_DOCK_SLOTS) {
    console.warn(
      `[main-nav] Mobiili dock peab olema täpselt ${MOBILE_DOCK_SLOTS} kirjet (hetkel ${dockCount}). Neljas tab on „Rohkem“.`,
    );
  }
}

export function isMainNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Filter nav items visible for the given role. Items without `roles` are always visible. */
function visibleFor(items: MainNavItem[], role?: string | null): MainNavItem[] {
  if (!role) return items.filter((i) => !i.roles);
  return items.filter((i) => !i.roles || i.roles.includes(role));
}

export function mainNavDockItems(role?: string | null): MainNavItem[] {
  return visibleFor(mainNav.filter((i) => i.mobile === 'dock'), role);
}

export function mainNavOverflowItems(role?: string | null): MainNavItem[] {
  return visibleFor(mainNav.filter((i) => i.mobile === 'overflow'), role);
}

/** All visible items for the given role. Used by the desktop sidebar. */
export function mainNavVisibleItems(role?: string | null): MainNavItem[] {
  return visibleFor(mainNav, role);
}
