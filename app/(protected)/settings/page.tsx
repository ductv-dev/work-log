import { PageHeader } from "@/components/layout/page-header";
import { SettingsForm } from "@/components/forms/settings-form";
import { createClient } from "@/lib/supabase/server";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").single();

  return (
    <>
      <PageHeader title="Cài đặt" description="Quản lý hồ sơ, đơn giá mặc định và tiền tệ hiển thị." />
      <section className="space-y-5">
        <SettingsForm profile={profile || null} userId={user!.id} />
      </section>
    </>
  );
}
