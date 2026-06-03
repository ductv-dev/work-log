import { PageHeader } from "@/components/layout/page-header";
import { ProjectManager } from "@/components/forms/project-manager";
import { createClient } from "@/lib/supabase/server";
import type { ProjectWithClient } from "@/lib/types/app";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [{ data: clients }, { data: projects }] = await Promise.all([
    supabase.from("clients").select("*").order("name"),
    supabase
      .from("projects")
      .select("*, clients(id, name, default_hourly_rate, currency)")
      .order("created_at", { ascending: false })
      .returns<ProjectWithClient[]>()
  ]);

  return (
    <>
      <PageHeader title="Dự án" description="Nhóm công việc theo khách hàng, trạng thái và quy tắc tính phí." />
      <section className="space-y-5">
        <ProjectManager initialProjects={projects || []} clients={clients || []} userId={user!.id} />
      </section>
    </>
  );
}
