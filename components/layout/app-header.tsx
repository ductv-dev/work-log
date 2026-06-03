"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { BookOpenText } from "lucide-react";
import { IOSButton } from "@/components/ui/ios-button";

export function AppHeader({ email }: { email?: string | null }) {
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "long"
      }).format(new Date()),
    []
  );
  const initial = email?.slice(0, 1).toUpperCase() || "W";

  return (
    <header className="sticky top-0 z-40 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] lg:px-8">
      <div className="ios-container px-0">
        <div className="glass flex items-center justify-between gap-4 rounded-[2rem] px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500 dark:text-white/60">Xin chào</p>
            <h1 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-white">WorkLog</h1>
            <p className="mt-0.5 truncate text-xs capitalize text-slate-500 dark:text-white/55">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            <IOSButton asChild variant="outline" size="icon" className="hidden h-11 w-11 rounded-full bg-white/45 shadow-none sm:inline-flex">
              <Link href="/huong-dan" title="Hướng dẫn">
                <BookOpenText className="h-4 w-4" />
              </Link>
            </IOSButton>
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white/70 ring-1 ring-white/60 dark:bg-white/10">
              <Image src="/icons/icon-192.png" alt="Avatar WorkLog" fill sizes="48px" className="object-cover" />
              <span className="sr-only">{initial}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
