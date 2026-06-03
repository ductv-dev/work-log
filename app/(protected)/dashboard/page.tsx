"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock3, FolderKanban, ReceiptText, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InstallAppButton } from "@/components/install-app-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { formatDuration, formatMoney } from "@/lib/calculations";
import { useDashboardData } from "@/lib/hooks/use-worklog-queries";

export default function DashboardPage() {
  const { data, error, isLoading } = useDashboardData();

  const todayMinutes = data?.todayMinutes || 0;
  const weekMinutes = data?.weekMinutes || 0;
  const weekAmount = data?.weekAmount || 0;
  const monthMinutes = data?.monthMinutes || 0;
  const currency = data?.currency || "VND";
  const projectTotals = data?.projectTotals || [];
  const recentEntries = data?.recentEntries || [];
  const activeProjects = data?.activeProjects || 0;

  const maxProjectMinutes = Math.max(...projectTotals.map((project) => project.minutes), 1);

  return (
    <>
      <PageHeader title="Tổng quan" description="Theo dõi giờ làm, tiền tính phí và hoạt động trong tuần hiện tại." />
      <section className="space-y-5">
        {error ? (
          <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="p-5">Không thể tải dashboard: {error.message}</CardContent>
          </Card>
        ) : null}
        <Card className="overflow-hidden rounded-[2rem]">
          <CardContent className="grid gap-5 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.7rem] bg-white/60 shadow-xl ring-1 ring-white/50 sm:h-24 sm:w-24">
                <Image src="/images/worklog-mascot.png" alt="Mascot WorkLog" fill sizes="96px" className="floaty object-cover" priority />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">PWA sẵn sàng</p>
                <h2 className="mt-1 text-xl font-semibold">Hôm nay mình ghi gì nè?</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mở bộ đếm khi bắt đầu làm, WorkLog sẽ tự tính giờ và tiền cho bạn.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:w-56 sm:grid-cols-1">
              <Button asChild>
                <Link href="/time">Ghi giờ ngay</Link>
              </Button>
              <InstallAppButton />
              <Button asChild variant="outline">
                <Link href="/reports">Xem báo cáo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 px-1 text-lg font-bold tracking-tight">Hôm nay</h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard title="Giờ hôm nay" value={isLoading ? "..." : formatDuration(todayMinutes)} icon={<Timer className="h-5 w-5" />} />
            <StatCard title="Dự án đang chạy" value={isLoading ? "..." : String(activeProjects)} icon={<FolderKanban className="h-5 w-5" />} />
            <StatCard title="Tháng này" value={isLoading ? "..." : formatDuration(monthMinutes)} icon={<CalendarDays className="h-5 w-5" />} />
          </div>
        </div>

        <div>
          <h2 className="mb-3 px-1 text-lg font-bold tracking-tight">Tuần này</h2>
          <div className="grid gap-3 sm:grid-cols-2">
          <StatCard title="Hôm nay" value={isLoading ? "..." : formatDuration(todayMinutes)} icon={<Timer className="h-5 w-5" />} />
          <StatCard title="Tuần này" value={isLoading ? "..." : formatDuration(weekMinutes)} icon={<Clock3 className="h-5 w-5" />} />
          <StatCard title="Tiền tuần này" value={isLoading ? "..." : formatMoney(weekAmount, currency)} icon={<ReceiptText className="h-5 w-5" />} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1fr_1.1fr]">
          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Giờ làm theo dự án</CardTitle>
            </CardHeader>
            <CardContent>
              {projectTotals.length === 0 ? (
                <EmptyState title="Tuần này chưa có giờ làm" description="Bắt đầu bộ đếm hoặc thêm thủ công để xem tổng theo dự án." />
              ) : (
                <div className="space-y-4">
                  {projectTotals.map((project) => (
                    <div key={project.id} className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="truncate font-medium">{project.name}</span>
                        <span className="text-muted-foreground">{formatDuration(project.minutes)}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white/50 dark:bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${(project.minutes / maxProjectMinutes) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem]">
            <CardHeader>
              <CardTitle>Bản ghi thời gian gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <EmptyState title="Đang tải bản ghi" description="WorkLog đang đồng bộ dữ liệu mới nhất." />
              ) : !recentEntries.length ? (
                <EmptyState title="Chưa có bản ghi thời gian" description="Các bản ghi thời gian mới nhất sẽ xuất hiện tại đây." />
              ) : (
                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <div key={entry.id} className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/30 dark:bg-white/8">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{entry.projects?.name || "Không có dự án"}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-white/60">{entry.description}</p>
                          <p className="mt-2 text-xs text-slate-400 dark:text-white/45">{entry.entry_date}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-white/10 dark:text-white">
                          {formatDuration(entry.duration_minutes)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card className="rounded-[1.7rem]">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-white/10 dark:text-white">{icon}</div>
      </CardContent>
    </Card>
  );
}
