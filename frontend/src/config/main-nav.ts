import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Calendar,
  Home,
  Image as ImageIcon,
  MessageCircle,
  Settings,
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
};

export const mainNav: MainNavItem[] = [
  { href: '/dashboard', label: 'Avaleht', Icon: Home, mobile: 'dock' },
  { href: '/announcements', label: 'Teated', Icon: Bell, mobile: 'dock' },
  { href: '/calendar', label: 'Kalender', Icon: Calendar, mobile: 'dock' },
  { href: '/group', label: 'Vestlus', Icon: MessageCircle, mobile: 'overflow' },
  { href: '/gallery', label: 'Galerii', Icon: ImageIcon, mobile: 'overflow' },
  { href: '/settings', label: 'Seaded', Icon: Settings, mobile: 'overflow' },
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

export function mainNavDockItems(): MainNavItem[] {
  return mainNav.filter((i) => i.mobile === 'dock');
}

export function mainNavOverflowItems(): MainNavItem[] {
  return mainNav.filter((i) => i.mobile === 'overflow');
}
