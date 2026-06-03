"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect } from "react";
import {
  BarChart3,
  BookOpenText,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  Sun,
  Timer,
  UsersRound
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { IOSButton } from "@/components/ui/ios-button";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/stores/app-store";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";

const desktopNavItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/time", label: "Thời gian", icon: Timer },
  { href: "/projects", label: "Dự án", icon: FolderKanban },
  { href: "/clients", label: "Khách hàng", icon: UsersRound },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/huong-dan", label: "Hướng dẫn", icon: BookOpenText },
  { href: "/settings", label: "Cài đặt", icon: Settings }
];

export function AppShell({
  children,
  email
}: {
  children: React.ReactNode;
  email?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase = createClient();
  const setLastPathname = useAppStore((state) => state.setLastPathname);

  useEffect(() => {
    setLastPathname(pathname);
  }, [pathname, setLastPathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    toast({ title: "Đã đăng xuất" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="app-gradient app-surface min-h-dvh text-slate-900 dark:text-white">
      <aside className="fixed bottom-6 left-6 top-6 z-40 hidden w-72 flex-col rounded-[2rem] lg:flex">
        <div className="glass flex h-full flex-col rounded-[2rem] p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-3xl p-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-3xl bg-white/70 shadow-lg ring-1 ring-white/60 dark:bg-white/10">
              <Image src="/icons/icon-192.png" alt="WorkLog" fill sizes="56px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">WorkLog</p>
              <p className="text-xs text-slate-500 dark:text-white/55">Không gian glass iOS</p>
            </div>
          </Link>

          <nav className="mt-4 flex-1 space-y-2">
            {desktopNavItems.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex h-12 items-center gap-3 rounded-3xl px-4 text-sm font-semibold text-slate-500 transition-all hover:bg-white/45 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white",
                    active && "bg-white/70 text-indigo-600 shadow-lg shadow-indigo-500/10 dark:bg-white/12 dark:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 border-t border-white/20 pt-4">
            <div className="truncate px-3 text-xs text-slate-500 dark:text-white/55">{email}</div>
            <div className="grid grid-cols-[auto_1fr] gap-2">
              <IOSButton
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12"
                title="Đổi giao diện sáng/tối"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="hidden h-4 w-4 dark:block" />
              </IOSButton>
              <IOSButton type="button" variant="outline" className="h-12" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </IOSButton>
            </div>
          </div>
        </div>
      </aside>

      <main className="min-h-dvh pb-[calc(6.5rem+env(safe-area-inset-bottom))] lg:ml-80 lg:pb-8">
        <AppHeader email={email} />
        <div className="ios-container screen-enter pb-6">{children}</div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
