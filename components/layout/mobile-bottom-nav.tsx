"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpenText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Settings,
  Timer,
  UsersRound,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

const primaryItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/time", label: "Giờ làm", icon: Timer },
  { href: "/projects", label: "Dự án", icon: FolderKanban },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 }
];

const moreItems = [
  { href: "/clients", label: "Khách hàng", icon: UsersRound },
  { href: "/settings", label: "Cài đặt", icon: Settings },
  { href: "/huong-dan", label: "Hướng dẫn", icon: BookOpenText }
];

const moreHrefs = moreItems.map((i) => i.href);

export function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close sheet on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isMoreActive = moreHrefs.some((h) => pathname.startsWith(h));

  async function handleLogout() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    toast({ title: "Đã đăng xuất" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* More sheet */}
      <div
        className={cn(
          "fixed inset-x-0 z-50 px-3 transition-all duration-300 ease-out lg:hidden",
          open
            ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] opacity-100"
            : "bottom-[calc(3rem+env(safe-area-inset-bottom))] pointer-events-none opacity-0"
        )}
      >
        <div className="glass mx-auto max-w-md rounded-[2rem] p-4">
          <div className="mb-3 flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-white/50">Thêm</span>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/80">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {moreItems.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl py-4 text-[11px] font-semibold text-slate-500 transition-all active:scale-95 dark:text-white/60",
                    active
                      ? "bg-white/75 text-indigo-600 shadow-sm dark:bg-white/12 dark:text-white"
                      : "hover:bg-white/40 dark:hover:bg-white/8"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="mt-2 border-t border-white/20 pt-3">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50/50 active:scale-[0.98] dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <LogOut className="h-5 w-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] lg:hidden">
        <div className="glass mx-auto grid max-w-md grid-cols-5 rounded-[2rem] p-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 rounded-3xl text-[10px] font-semibold text-slate-500 transition-all duration-200 active:scale-95 dark:text-white/60",
                  active && "bg-white/75 text-indigo-600 shadow-lg shadow-indigo-500/15 dark:bg-white/12 dark:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", active && "-translate-y-0.5")} />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-3xl text-[10px] font-semibold text-slate-500 transition-all duration-200 active:scale-95 dark:text-white/60",
              (open || isMoreActive) && "bg-white/75 text-indigo-600 shadow-lg shadow-indigo-500/15 dark:bg-white/12 dark:text-white"
            )}
          >
            <MoreHorizontal className={cn("h-5 w-5 transition-transform", (open || isMoreActive) && "-translate-y-0.5")} />
            <span className="w-full truncate text-center">Thêm</span>
          </button>
        </div>
      </nav>
    </>
  );
}
