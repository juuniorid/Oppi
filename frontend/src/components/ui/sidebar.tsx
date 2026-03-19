// src/components/ui/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  UserMinus,
  Users,
  Image as ImageIcon,
  Settings,
  BookOpen
} from "lucide-react";

const navItems = [
  { name: "Kodu", href: "/dashboard", icon: Home },
  { name: "Teated", href: "/dashboard/announcements", icon: MessageSquare },
  { name: "Puudumised", href: "/dashboard/absences", icon: UserMinus },
  { name: "Grupid", href: "/dashboard/group", icon: Users },
  { name: "Galerii", href: "/dashboard/gallery", icon: ImageIcon },
  { name: "Seaded", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-[#F8F9F9] flex flex-col px-6 py-8 hidden md:flex border-r border-gray-100">
      {/* Logo Section */}
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="bg-[#F9E79F] p-2 rounded-xl">
          <BookOpen className="w-6 h-6 text-yellow-700" strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold text-gray-800">Oppi</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 font-medium ${
                isActive
                  ? "bg-[#F9E79F] text-gray-900 shadow-sm"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}