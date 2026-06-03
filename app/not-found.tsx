import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home, LayoutDashboard, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="app-gradient app-surface flex min-h-dvh items-center justify-center px-4 py-[calc(env(safe-area-inset-top)+1.25rem)] text-slate-900 dark:text-white">
      <section className="screen-enter w-full max-w-md">
        <div className="glass overflow-hidden rounded-[2.5rem] p-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-600 ring-1 ring-white/40 dark:bg-white/10 dark:text-indigo-200">
            <SearchX className="h-6 w-6" />
          </div>

          <div className="relative mx-auto mt-5 aspect-square w-48 overflow-hidden rounded-[2rem] bg-white/50 ring-1 ring-white/40 dark:bg-white/10">
            <Image src="/images/worklog-mascot.png" alt="WorkLog mascot" fill sizes="192px" className="floaty object-cover" priority />
          </div>

          <p className="mt-6 text-sm font-bold uppercase text-indigo-600 dark:text-indigo-200">404</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Không thấy trang này</h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-slate-500 dark:text-white/60">
            Có thể đường dẫn đã đổi hoặc màn hình này chưa có trong WorkLog.
          </p>

          <div className="mt-6 grid gap-3">
            <Button asChild className="h-12 rounded-full">
              <Link href="/">
                <Home className="h-4 w-4" />
                Về trang giới thiệu
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-full">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Mở dashboard
              </Link>
            </Button>
          </div>
        </div>

        <Link
          href="/"
          className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full bg-white/45 px-4 py-2 text-sm font-semibold text-slate-500 backdrop-blur-xl transition hover:text-slate-900 dark:bg-white/10 dark:text-white/60 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại WorkLog
        </Link>
      </section>
    </main>
  );
}
