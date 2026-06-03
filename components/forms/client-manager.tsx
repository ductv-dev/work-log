"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { EmptyState } from "@/components/layout/empty-state";
import { formatMoney } from "@/lib/calculations";
import { queryKeys } from "@/lib/query/keys";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types/database";

type ClientFormState = {
  name: string;
  email: string;
  phone: string;
  note: string;
  default_hourly_rate: string;
  currency: string;
};

const emptyForm: ClientFormState = {
  name: "",
  email: "",
  phone: "",
  note: "",
  default_hourly_rate: "0",
  currency: "VND"
};

export function ClientManager({ clients, userId }: { clients: Client[]; userId: string }) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormState>(emptyForm);
  const saveClientMutation = useMutation({
    mutationFn: async () => {
      const rate = Number(form.default_hourly_rate || 0);
      const payload = {
        user_id: userId,
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        note: form.note.trim() || null,
        default_hourly_rate: rate,
        currency: form.currency
      };
      const supabase = createSupabaseClient();
      const request = editing
        ? supabase.from("clients").update(payload).eq("id", editing.id).select().single()
        : supabase.from("clients").insert(payload).select().single();
      const { error } = await request;

      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all })
      ]);
      toast({ title: editing ? "Đã cập nhật khách hàng" : "Đã tạo khách hàng" });
      setOpen(false);
    },
    onError: (error) => {
      toast({ title: "Không thể lưu khách hàng", description: error.message, variant: "destructive" });
    }
  });
  const deleteClientMutation = useMutation({
    mutationFn: async (client: Client) => {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("clients").delete().eq("id", client.id);

      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all })
      ]);
      toast({ title: "Đã xóa khách hàng" });
    },
    onError: (error) => {
      toast({ title: "Không thể xóa khách hàng", description: error.message, variant: "destructive" });
    }
  });

  const filtered = useMemo(
    () => clients.filter((client) => client.name.toLowerCase().includes(query.toLowerCase())),
    [clients, query]
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(client: Client) {
    setEditing(client);
    setForm({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      note: client.note || "",
      default_hourly_rate: String(client.default_hourly_rate || 0),
      currency: client.currency || "VND"
    });
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rate = Number(form.default_hourly_rate || 0);

    if (!form.name.trim()) {
      toast({ title: "Vui lòng nhập tên khách hàng", variant: "destructive" });
      return;
    }

    if (rate < 0) {
      toast({ title: "Đơn giá theo giờ không được âm", variant: "destructive" });
      return;
    }

    saveClientMutation.mutate();
  }

  async function deleteClient(client: Client) {
    if (!window.confirm(`Xóa ${client.name}? Các dự án thuộc khách hàng này cũng sẽ bị xóa.`)) return;
    deleteClientMutation.mutate(client);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khách hàng" className="pl-9" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="hidden md:inline-flex" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Khách hàng mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Sửa khách hàng" : "Khách hàng mới"}</DialogTitle>
              <DialogDescription>Đơn giá mặc định của khách hàng sẽ được dùng khi dự án chưa có đơn giá riêng.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="client-name">Tên</Label>
                <Input id="client-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="client-email">Email</Label>
                  <Input id="client-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="client-phone">Số điện thoại</Label>
                  <Input id="client-phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="client-rate">Đơn giá theo giờ</Label>
                  <Input id="client-rate" type="number" min="0" step="0.01" value={form.default_hourly_rate} onChange={(event) => setForm({ ...form, default_hourly_rate: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tiền tệ</Label>
                  <Select value={form.currency} onValueChange={(currency) => setForm({ ...form, currency })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="client-note">Ghi chú</Label>
                <Textarea id="client-note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
              </div>
              <Button disabled={saveClientMutation.isPending}>{saveClientMutation.isPending ? "Đang lưu..." : "Lưu khách hàng"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[2rem]">
        <CardContent className="p-4 md:p-0">
          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Chưa có khách hàng" description="Tạo khách hàng để nhóm dự án và thiết lập đơn giá tính phí." />
            </div>
          ) : (
            <>
            <div className="space-y-3 md:hidden">
              {filtered.map((client) => (
                <div key={client.id} className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/30 dark:bg-white/8">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold">{client.name}</p>
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-white/60">
                        {[client.email, client.phone].filter(Boolean).join(" / ") || "Chưa có liên hệ"}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                        {formatMoney(client.default_hourly_rate, client.currency)}/giờ
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button type="button" variant="ghost" size="icon" title="Sửa khách hàng" onClick={() => openEdit(client)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" title="Xóa khách hàng" onClick={() => deleteClient(client)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Liên hệ</TableHead>
                  <TableHead>Đơn giá mặc định</TableHead>
                  <TableHead className="w-28 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {[client.email, client.phone].filter(Boolean).join(" / ") || "-"}
                    </TableCell>
                    <TableCell>{formatMoney(client.default_hourly_rate, client.currency)}/giờ</TableCell>
                    <TableCell className="text-right">
                      <Button type="button" variant="ghost" size="icon" title="Sửa khách hàng" onClick={() => openEdit(client)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" title="Xóa khách hàng" onClick={() => deleteClient(client)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
            </>
          )}
        </CardContent>
      </Card>
      <Button
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] right-5 z-40 h-14 w-14 rounded-full p-0 shadow-2xl md:hidden"
        onClick={openCreate}
        title="Khách hàng mới"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}
