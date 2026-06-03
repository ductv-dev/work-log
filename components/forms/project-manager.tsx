"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { formatMoney } from "@/lib/calculations";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types/database";
import type { ProjectWithClient } from "@/lib/types/app";

type ProjectFormState = {
  client_id: string;
  name: string;
  description: string;
  hourly_rate: string;
  status: string;
  is_billable: boolean;
};

const emptyForm: ProjectFormState = {
  client_id: "none",
  name: "",
  description: "",
  hourly_rate: "0",
  status: "active",
  is_billable: true
};

export function ProjectManager({
  initialProjects,
  clients,
  userId
}: {
  initialProjects: ProjectWithClient[];
  clients: Client[];
  userId: string;
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [clientFilter, setClientFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectWithClient | null>(null);
  const [form, setForm] = useState<ProjectFormState>(emptyForm);
  const [loading, setLoading] = useState(false);
  const supabase = createSupabaseClient();

  const filtered = useMemo(
    () => (clientFilter === "all" ? projects : projects.filter((project) => project.client_id === clientFilter)),
    [clientFilter, projects]
  );

  function enrichProject(project: ProjectWithClient): ProjectWithClient {
    const client = clients.find((item) => item.id === project.client_id);
    return {
      ...project,
      clients: client
        ? {
            id: client.id,
            name: client.name,
            default_hourly_rate: client.default_hourly_rate,
            currency: client.currency
          }
        : null
    };
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(project: ProjectWithClient) {
    setEditing(project);
    setForm({
      client_id: project.client_id || "none",
      name: project.name,
      description: project.description || "",
      hourly_rate: String(project.hourly_rate || 0),
      status: project.status,
      is_billable: project.is_billable
    });
    setOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rate = Number(form.hourly_rate || 0);

    if (!form.name.trim()) {
      toast({ title: "Vui lòng nhập tên dự án", variant: "destructive" });
      return;
    }

    if (rate < 0) {
      toast({ title: "Đơn giá theo giờ không được âm", variant: "destructive" });
      return;
    }

    setLoading(true);
    const payload = {
      user_id: userId,
      client_id: form.client_id === "none" ? null : form.client_id,
      name: form.name.trim(),
      description: form.description.trim() || null,
      hourly_rate: rate,
      status: form.status,
      is_billable: form.is_billable
    };

    const request = editing
      ? supabase.from("projects").update(payload).eq("id", editing.id).select().single()
      : supabase.from("projects").insert(payload).select().single();

    const { data, error } = await request;
    setLoading(false);

    if (error) {
      toast({ title: "Không thể lưu dự án", description: error.message, variant: "destructive" });
      return;
    }

    const enriched = enrichProject(data as ProjectWithClient);
    setProjects((current) =>
      editing ? current.map((project) => (project.id === enriched.id ? enriched : project)) : [enriched, ...current]
    );
    toast({ title: editing ? "Đã cập nhật dự án" : "Đã tạo dự án" });
    setOpen(false);
  }

  async function deleteProject(project: ProjectWithClient) {
    if (!window.confirm(`Xóa ${project.name}? Các bản ghi thời gian đã tạo sẽ giữ nguyên dữ liệu đã lưu.`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", project.id);

    if (error) {
      toast({ title: "Không thể xóa dự án", description: error.message, variant: "destructive" });
      return;
    }

    setProjects((current) => current.filter((item) => item.id !== project.id));
    toast({ title: "Đã xóa dự án" });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo khách hàng" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khách hàng</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="hidden md:inline-flex" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Dự án mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Sửa dự án" : "Dự án mới"}</DialogTitle>
              <DialogDescription>Đơn giá của dự án sẽ ưu tiên hơn đơn giá mặc định của khách hàng và hồ sơ.</DialogDescription>
            </DialogHeader>
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <div className="grid gap-2">
                <Label>Khách hàng</Label>
                <Select value={form.client_id} onValueChange={(client_id) => setForm({ ...form, client_id })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không có khách hàng</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-name">Tên</Label>
                <Input id="project-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="project-description">Mô tả</Label>
                <Textarea id="project-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="project-rate">Đơn giá theo giờ</Label>
                  <Input id="project-rate" type="number" min="0" step="0.01" value={form.hourly_rate} onChange={(event) => setForm({ ...form, hourly_rate: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Trạng thái</Label>
                  <Select value={form.status} onValueChange={(status) => setForm({ ...form, status })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Đang chạy</SelectItem>
                      <SelectItem value="paused">Tạm dừng</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={form.is_billable} onCheckedChange={(checked) => setForm({ ...form, is_billable: checked === true })} />
                Mặc định tính phí
              </label>
              <Button disabled={loading}>{loading ? "Đang lưu..." : "Lưu dự án"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[2rem]">
        <CardContent className="p-4 md:p-0">
          {filtered.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Chưa có dự án" description="Tạo một dự án đang chạy trước khi ghi thời gian." />
            </div>
          ) : (
            <>
            <div className="space-y-3 md:hidden">
              {filtered.map((project) => {
                const currency = project.clients?.currency || "VND";
                const fallbackRate = project.clients?.default_hourly_rate || 0;
                const shownRate = project.hourly_rate > 0 ? project.hourly_rate : fallbackRate;
                return (
                  <div key={project.id} className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/30 dark:bg-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold">{project.name}</p>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-white/60">{project.clients?.name || "Không có khách hàng"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-white/10 dark:text-white">
                            {statusLabel(project.status)}
                          </span>
                          <span className="rounded-full bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-white/70">
                            {formatMoney(shownRate, currency)}/giờ
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button type="button" variant="ghost" size="icon" title="Sửa dự án" onClick={() => openEdit(project)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Xóa dự án" onClick={() => deleteProject(project)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Tính phí</TableHead>
                  <TableHead className="w-28 text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => {
                  const currency = project.clients?.currency || "VND";
                  const fallbackRate = project.clients?.default_hourly_rate || 0;
                  const shownRate = project.hourly_rate > 0 ? project.hourly_rate : fallbackRate;
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell className="text-muted-foreground">{project.clients?.name || "-"}</TableCell>
                      <TableCell>{statusLabel(project.status)}</TableCell>
                      <TableCell>{formatMoney(shownRate, currency)}/giờ</TableCell>
                      <TableCell>{project.is_billable ? "Có" : "Không"}</TableCell>
                      <TableCell className="text-right">
                        <Button type="button" variant="ghost" size="icon" title="Sửa dự án" onClick={() => openEdit(project)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" title="Xóa dự án" onClick={() => deleteProject(project)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
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
        title="Dự án mới"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  );
}

function statusLabel(status: string) {
  if (status === "active") return "Đang chạy";
  if (status === "paused") return "Tạm dừng";
  if (status === "completed") return "Hoàn thành";
  return status;
}
