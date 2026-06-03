"use client";

import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/forms/settings-form";
import { EmptyState } from "@/components/layout/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser, useProfile } from "@/lib/hooks/use-worklog-queries";

export default function SettingsPage() {
  const userQuery = useCurrentUser();
  const profileQuery = useProfile();
  const error = userQuery.error || profileQuery.error;

  return (
    <>
      <PageHeader title="Cài đặt" description="Quản lý hồ sơ, đơn giá mặc định và tiền tệ hiển thị." />
      <section className="space-y-5">
        {error ? (
          <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <CardContent className="p-5">Không thể tải cài đặt: {error.message}</CardContent>
          </Card>
        ) : null}
        {userQuery.isLoading || profileQuery.isLoading ? (
          <Card className="rounded-[2rem]">
            <CardContent className="p-5">
              <EmptyState title="Đang tải cài đặt" description="WorkLog đang lấy hồ sơ của bạn." />
            </CardContent>
          </Card>
        ) : userQuery.data ? (
          <SettingsForm profile={profileQuery.data || null} userId={userQuery.data.id} />
        ) : null}
      </section>
    </>
  );
}
