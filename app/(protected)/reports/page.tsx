import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/forms/reports-view";
import { endOfCurrentWeekISO, startOfCurrentMonthISO } from "@/lib/dates";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWithClient, TimeEntryWithRelations } from "@/lib/types/app";

export default async function ReportsPage() {
  const supabase = await createClient();
  const startDate = startOfCurrentMonthISO();
  const endDate = endOfCurrentWeekISO();

  const [{ data: entries }, { data: clients }, { data: projects }, { data: profile }] = await Promise.all([
    supabase
      .from("time_entries")
      .select("*, clients(id, name, currency), projects(id, name)")
      .gte("entry_date", startDate)
      .lte("entry_date", endDate)
      .order("entry_date", { ascending: false })
      .returns<TimeEntryWithRelations[]>(),
    supabase.from("clients").select("*").order("name"),
    supabase
      .from("projects")
      .select("*, clients(id, name, default_hourly_rate, currency)")
      .order("name")
      .returns<ProjectWithClient[]>(),
    supabase.from("profiles").select("*").single()
  ]);

  return (
    <>
      <PageHeader title="Báo cáo" description="Lọc bản ghi thời gian, xem tổng tiền tính phí và xuất CSV." />
      <section className="space-y-5">
        <ReportsView
          initialEntries={entries || []}
          clients={clients || []}
          projects={projects || []}
          profile={profile || null}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </section>
    </>
  );
}
