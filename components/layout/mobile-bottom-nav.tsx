"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Timer,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Tổng", icon: LayoutDashboard },
  { href: "/time", label: "Giờ", icon: Timer },
  { href: "/projects", label: "Dự án", icon: FolderKanban },
  { href: "/clients", label: "Khách", icon: UsersRound },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/settings", label: "Cài đặt", icon: Settings },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
      <div className="glass mx-auto grid max-w-md grid-cols-5 rounded-[2rem] p-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-3xl text-[10px] font-semibold text-slate-500 transition-all duration-200 active:scale-95 dark:text-white/60",
                active &&
                  "bg-white/75 text-indigo-600 shadow-lg shadow-indigo-500/15 dark:bg-white/12 dark:text-white",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  active && "-translate-y-0.5",
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
