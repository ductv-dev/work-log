import { PageHeader } from "@/components/layout/page-header";
import { TimeTracker } from "@/components/forms/time-tracker";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWithClient } from "@/lib/types/app";

export default async function TimePage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: clients }, { data: projects }, { data: profile }] = await Promise.all([
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
      <PageHeader title="Thời gian" description="Ghi thời gian bằng bộ đếm thời gian thực hoặc nhập thủ công." />
      <section className="space-y-5">
        <TimeTracker clients={clients || []} projects={projects || []} profile={profile || null} userId={user!.id} />
      </section>
    </>
  );
}
