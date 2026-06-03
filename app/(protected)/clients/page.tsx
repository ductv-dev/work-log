"use client";

import { PageHeader } from "@/components/layout/page-header";
import { ClientManager } from "@/components/forms/client-manager";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useClients, useCurrentUser } from "@/lib/hooks/use-worklog-queries";

export default function ClientsPage() {
  const userQuery = useCurrentUser();
  const clientsQuery = useClients("created_at");
  const error = userQuery.error || clientsQuery.error;

  return (
    <>
      <PageHeader title="Khách hàng" description="Quản lý thông tin liên hệ, tiền tệ và đơn giá mặc định của từng khách hàng." />
      <section className="space-y-5">
        {error ? (
          <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="p-5">Không thể tải khách hàng: {error.message}</CardContent>
          </Card>
        ) : null}
        {userQuery.isLoading || clientsQuery.isLoading ? (
          <Card className="rounded-[2rem]">
            <CardContent className="p-5">
              <EmptyState title="Đang tải khách hàng" description="WorkLog đang lấy dữ liệu mới nhất." />
            </CardContent>
          </Card>
        ) : userQuery.data ? (
          <ClientManager clients={clientsQuery.data || []} userId={userQuery.data.id} />
        ) : null}
      </section>
    </>
  );
}
