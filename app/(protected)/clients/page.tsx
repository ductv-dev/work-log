import { PageHeader } from "@/components/layout/page-header";
import { ClientManager } from "@/components/forms/client-manager";
import { createClient } from "@/lib/supabase/server";

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: clients } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

  return (
    <>
      <PageHeader title="Khách hàng" description="Quản lý thông tin liên hệ, tiền tệ và đơn giá mặc định của từng khách hàng." />
      <section className="space-y-5">
        <ClientManager initialClients={clients || []} userId={user!.id} />
      </section>
    </>
  );
}
