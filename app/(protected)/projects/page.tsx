"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ProjectManager } from "@/components/forms/project-manager";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useClients, useCurrentUser, useProjects } from "@/lib/hooks/use-worklog-queries";

export default function ProjectsPage() {
  const userQuery = useCurrentUser();
  const clientsQuery = useClients("name");
  const projectsQuery = useProjects("created_at");
  const error = userQuery.error || clientsQuery.error || projectsQuery.error;

  return (
    <>
      <PageHeader title="Dự án" description="Nhóm công việc theo khách hàng, trạng thái và quy tắc tính phí." />
      <section className="space-y-5">
        {error ? (
          <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="p-5">Không thể tải dự án: {error.message}</CardContent>
          </Card>
        ) : null}
        {userQuery.isLoading || clientsQuery.isLoading || projectsQuery.isLoading ? (
          <Card className="rounded-[2rem]">
            <CardContent className="p-5">
              <EmptyState title="Đang tải dự án" description="WorkLog đang đồng bộ khách hàng và dự án." />
            </CardContent>
          </Card>
        ) : userQuery.data ? (
          <ProjectManager projects={projectsQuery.data || []} clients={clientsQuery.data || []} userId={userQuery.data.id} />
        ) : null}
      </section>
    </>
  );
}
