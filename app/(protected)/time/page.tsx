"use client";

import { PageHeader } from "@/components/layout/page-header";
import { TimeTracker } from "@/components/forms/time-tracker";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useClients, useCurrentUser, useProfile, useProjects } from "@/lib/hooks/use-worklog-queries";

export default function TimePage() {
  const userQuery = useCurrentUser();
  const clientsQuery = useClients("name");
  const projectsQuery = useProjects("name");
  const profileQuery = useProfile();
  const error = userQuery.error || clientsQuery.error || projectsQuery.error || profileQuery.error;

  return (
    <>
      <PageHeader title="Thời gian" description="Ghi thời gian bằng bộ đếm thời gian thực hoặc nhập thủ công." />
      <section className="space-y-5">
        {error ? (
          <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="p-5">Không thể tải dữ liệu ghi giờ: {error.message}</CardContent>
          </Card>
        ) : null}
        {userQuery.isLoading || clientsQuery.isLoading || projectsQuery.isLoading || profileQuery.isLoading ? (
          <Card className="rounded-[2rem]">
            <CardContent className="p-5">
              <EmptyState title="Đang tải bộ đếm" description="WorkLog đang chuẩn bị khách hàng, dự án và hồ sơ." />
            </CardContent>
          </Card>
        ) : userQuery.data ? (
          <TimeTracker clients={clientsQuery.data || []} projects={projectsQuery.data || []} profile={profileQuery.data || null} userId={userQuery.data.id} />
        ) : null}
      </section>
    </>
  );
}
