"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ReportsView } from "@/components/forms/reports-view";
import { endOfCurrentWeekISO, startOfCurrentMonthISO } from "@/lib/dates";

export default function ReportsPage() {
  const startDate = startOfCurrentMonthISO();
  const endDate = endOfCurrentWeekISO();

  return (
    <>
      <PageHeader title="Báo cáo" description="Lọc bản ghi thời gian, xem tổng tiền tính phí và xuất CSV." />
      <section className="space-y-5">
        <ReportsView initialStartDate={startDate} initialEndDate={endDate} />
      </section>
    </>
  );
}
