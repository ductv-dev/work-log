import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Clock3, FileDown, FolderKanban, ShieldCheck, Timer } from "lucide-react";
import { InstallAppButton } from "@/components/install-app-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    title: "Ghi giờ nhanh",
    description: "Bật bộ đếm khi bắt đầu làm, dừng là có ngay bản ghi thời gian.",
    icon: Timer
  },
  {
    title: "Tính tiền tự động",
    description: "Ưu tiên đơn giá dự án, khách hàng, rồi đến đơn giá mặc định trong hồ sơ.",
    icon: BarChart3
  },
  {
    title: "Xuất báo cáo CSV",
    description: "Lọc theo ngày, khách hàng, dự án và xuất file gửi cho khách hàng.",
    icon: FileDown
  }
];

export default function HomePage() {
  return (
    <main className="app-gradient app-surface min-h-dvh px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)] text-slate-900 dark:text-white">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col">
        <header className="glass flex items-center justify-between rounded-[2rem] px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-2xl bg-white/70 ring-1 ring-white/50 dark:bg-white/10">
              <Image src="/icons/icon-192.png" alt="WorkLog" fill sizes="44px" className="object-cover" priority />
            </div>
            <div>
              <p className="text-base font-bold leading-none">WorkLog</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-white/55">PWA ghi giờ cho freelancer</p>
            </div>
          </Link>
          <Button asChild variant="outline" className="h-10 rounded-full px-4">
            <Link href="/login">Đăng nhập</Link>
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[1fr_0.9fr] lg:py-16">
          <div className="space-y-6">
            <div className="inline-flex rounded-full border border-white/30 bg-white/45 px-4 py-2 text-sm font-semibold text-indigo-700 backdrop-blur-xl dark:bg-white/10 dark:text-indigo-200">
              iOS glass · Mobile-first · Cài như app
            </div>
            <div className="space-y-4">
              <h1 className="text-5xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
                Ghi giờ làm.
                <span className="block bg-gradient-to-r from-blue-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                  Tính tiền gọn.
                </span>
              </h1>
              <p className="max-w-xl text-base leading-7 text-slate-600 dark:text-white/65 sm:text-lg">
                WorkLog giúp freelancer và team nhỏ ghi thời gian, mô tả việc đã làm, tính phí theo giờ và xuất báo cáo
                chỉ trong vài chạm.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <InstallAppButton alwaysVisible variant="default" className="h-14 rounded-full px-7 text-base">
                Tải app
              </InstallAppButton>
              <Button asChild variant="outline" className="h-14 rounded-full px-7 text-base">
                <Link href="/register">
                  Bắt đầu miễn phí
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <MiniStat label="Timer" value="HH:mm:ss" />
              <MiniStat label="Báo cáo" value="CSV" />
              <MiniStat label="PWA" value="Install" />
            </div>
          </div>

          <div className="relative">
            <div className="glass mx-auto max-w-sm rounded-[2.5rem] p-5 shadow-2xl lg:max-w-md">
              <div className="rounded-[2rem] bg-white/55 p-4 ring-1 ring-white/40 dark:bg-white/8">
                <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-[2rem]">
                  <Image src="/images/worklog-mascot.png" alt="Mascot WorkLog" fill sizes="320px" className="floaty object-cover" priority />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between rounded-3xl bg-white/60 p-4 dark:bg-white/10">
                    <div>
                      <p className="text-sm font-semibold">Hôm nay</p>
                      <p className="text-xs text-slate-500 dark:text-white/55">Website redesign</p>
                    </div>
                    <span className="font-mono text-lg font-bold">02:35:12</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoPill icon={<Clock3 className="h-4 w-4" />} label="Tuần này" value="18 giờ" />
                    <InfoPill icon={<FolderKanban className="h-4 w-4" />} label="Dự án" value="6 active" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 pb-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="rounded-[2rem]">
                <CardContent className="p-5">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-white/10 dark:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-white/60">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <footer className="flex flex-col gap-3 pb-[env(safe-area-inset-bottom)] text-center text-xs text-slate-500 dark:text-white/45 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <span>WorkLog · Ghi giờ và tính phí cho công việc freelance.</span>
          <span className="inline-flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Dữ liệu được bảo vệ bằng Supabase RLS
          </span>
        </footer>
      </div>
    </main>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-3xl p-4">
      <p className="text-xs text-slate-500 dark:text-white/55">{label}</p>
      <p className="mt-1 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white/60 p-4 dark:bg-white/10">
      <div className="mb-2 text-indigo-600 dark:text-indigo-200">{icon}</div>
      <p className="text-xs text-slate-500 dark:text-white/55">{label}</p>
      <p className="mt-1 text-sm font-bold">{value}</p>
    </div>
  );
}
