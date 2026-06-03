"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Plus, Square } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { calculateAmount, formatMoney, formatTimer, getDurationMinutes, resolveHourlyRate } from "@/lib/calculations";
import { todayISO } from "@/lib/dates";
import { queryKeys } from "@/lib/query/keys";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { Client, Profile } from "@/lib/types/database";
import type { ProjectWithClient } from "@/lib/types/app";

type RunningTimer = {
  clientId: string;
  projectId: string;
  description: string;
  isBillable: boolean;
  startedAt: Date;
};

type TimeEntryPayload = {
  user_id: string;
  client_id: string | null;
  project_id: string;
  description: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  hourly_rate: number;
  amount: number;
  is_billable: boolean;
  entry_date: string;
};

export function TimeTracker({
  clients,
  projects,
  profile,
  userId
}: {
  clients: Client[];
  projects: ProjectWithClient[];
  profile: Profile | null;
  userId: string;
}) {
  const queryClient = useQueryClient();
  const [timerClientId, setTimerClientId] = useState("none");
  const [timerProjectId, setTimerProjectId] = useState("none");
  const [timerDescription, setTimerDescription] = useState("");
  const [timerBillable, setTimerBillable] = useState(true);
  const [running, setRunning] = useState<RunningTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [manualClientId, setManualClientId] = useState("none");
  const [manualProjectId, setManualProjectId] = useState("none");
  const [manualDate, setManualDate] = useState(todayISO());
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [manualDuration, setManualDuration] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualBillable, setManualBillable] = useState(true);
  const createEntryMutation = useMutation({
    mutationFn: async (payload: TimeEntryPayload) => {
      const supabase = createSupabaseClient();
      const { error } = await supabase.from("time_entries").insert(payload);

      if (error) throw new Error(error.message);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reports.all })
      ]);
    }
  });
  const saving = createEntryMutation.isPending;

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - running.startedAt.getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

  const activeProjects = projects.filter((project) => project.status === "active");
  const timerProjects = filterProjects(activeProjects, timerClientId);
  const manualProjects = filterProjects(projects, manualClientId);

  const timerPreview = useMemo(
    () => buildBillingPreview(projects, clients, profile, timerProjectId, timerBillable, Math.floor(elapsedSeconds / 60)),
    [clients, elapsedSeconds, profile, projects, timerBillable, timerProjectId]
  );

  const manualPreview = useMemo(() => {
    const duration = calculateManualDuration(manualDate, manualStart, manualEnd, manualDuration);
    return buildBillingPreview(projects, clients, profile, manualProjectId, manualBillable, duration);
  }, [clients, manualBillable, manualDate, manualDuration, manualEnd, manualProjectId, manualStart, profile, projects]);

  function handleTimerProjectChange(projectId: string) {
    setTimerProjectId(projectId);
    const project = projects.find((item) => item.id === projectId);
    if (project?.client_id) setTimerClientId(project.client_id);
    if (project) setTimerBillable(project.is_billable);
  }

  function handleManualProjectChange(projectId: string) {
    setManualProjectId(projectId);
    const project = projects.find((item) => item.id === projectId);
    if (project?.client_id) setManualClientId(project.client_id);
    if (project) setManualBillable(project.is_billable);
  }

  function startTimer() {
    if (running) return;
    if (timerProjectId === "none" || !timerDescription.trim()) {
      toast({ title: "Vui lòng chọn dự án và nhập mô tả", variant: "destructive" });
      return;
    }

    setRunning({
      clientId: timerClientId,
      projectId: timerProjectId,
      description: timerDescription.trim(),
      isBillable: timerBillable,
      startedAt: new Date()
    });
    setElapsedSeconds(0);
    toast({ title: "Đã bắt đầu bộ đếm" });
  }

  async function stopTimer() {
    if (!running) {
      toast({ title: "Bạn cần bắt đầu bộ đếm trước", variant: "destructive" });
      return;
    }

    const end = new Date();
    const durationMinutes = getDurationMinutes(running.startedAt, end);
    const preview = buildBillingPreview(projects, clients, profile, running.projectId, running.isBillable, durationMinutes);

    try {
      await createEntryMutation.mutateAsync({
        user_id: userId,
        client_id: running.clientId === "none" ? preview.clientId : running.clientId,
        project_id: running.projectId,
        description: running.description,
        start_time: running.startedAt.toISOString(),
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
        hourly_rate: preview.hourlyRate,
        amount: preview.amount,
        is_billable: running.isBillable,
        entry_date: running.startedAt.toISOString().slice(0, 10)
      });
    } catch (error) {
      toast({ title: "Không thể lưu bản ghi thời gian từ bộ đếm", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
      return;
    }

    setRunning(null);
    setElapsedSeconds(0);
    setTimerDescription("");
    toast({ title: "Đã tạo bản ghi thời gian" });
  }

  async function createManualEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (manualProjectId === "none" || !manualDescription.trim()) {
      toast({ title: "Vui lòng chọn dự án và nhập mô tả", variant: "destructive" });
      return;
    }

    const durationMinutes = calculateManualDuration(manualDate, manualStart, manualEnd, manualDuration);
    if (durationMinutes <= 0) {
      toast({ title: "Thời lượng phải lớn hơn 0", variant: "destructive" });
      return;
    }

    const startTime = manualStart ? new Date(`${manualDate}T${manualStart}`).toISOString() : null;
    const endTime = manualEnd ? new Date(`${manualDate}T${manualEnd}`).toISOString() : null;
    const preview = buildBillingPreview(projects, clients, profile, manualProjectId, manualBillable, durationMinutes);

    try {
      await createEntryMutation.mutateAsync({
        user_id: userId,
        client_id: manualClientId === "none" ? preview.clientId : manualClientId,
        project_id: manualProjectId,
        description: manualDescription.trim(),
        start_time: startTime,
        end_time: endTime,
        duration_minutes: durationMinutes,
        hourly_rate: preview.hourlyRate,
        amount: preview.amount,
        is_billable: manualBillable,
        entry_date: manualDate
      });
    } catch (error) {
      toast({ title: "Không thể tạo bản ghi thời gian", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
      return;
    }

    setManualDescription("");
    setManualStart("");
    setManualEnd("");
    setManualDuration("");
    toast({ title: "Đã tạo bản ghi thời gian thủ công" });
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
      <Card className="rounded-[2rem]">
        <CardHeader className="text-center">
          <CardTitle>Bộ đếm</CardTitle>
          <CardDescription>Bắt đầu và dừng bộ đếm thời gian cho công việc đang làm.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-[2rem] bg-white/45 p-6 text-center ring-1 ring-white/30 dark:bg-white/8">
            <div className="font-mono text-6xl font-bold tracking-tight tabular-nums text-slate-950 dark:text-white sm:text-7xl">
              {formatTimer(elapsedSeconds)}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatMoney(timerPreview.amount, timerPreview.currency)} với đơn giá {formatMoney(timerPreview.hourlyRate, timerPreview.currency)}/giờ
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Khách hàng</Label>
              <Select value={timerClientId} onValueChange={setTimerClientId} disabled={!!running}>
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
              <Label>Dự án</Label>
              <Select value={timerProjectId} onValueChange={handleTimerProjectChange} disabled={!!running}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chọn dự án</SelectItem>
                  {timerProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="timer-description">Mô tả công việc</Label>
            <Textarea id="timer-description" value={timerDescription} onChange={(event) => setTimerDescription(event.target.value)} disabled={!!running} />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={timerBillable} onCheckedChange={(checked) => setTimerBillable(checked === true)} disabled={!!running} />
            Tính phí
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" className="h-14 text-base" onClick={startTimer} disabled={!!running || saving}>
              <Play className="h-4 w-4" />
              Bắt đầu
            </Button>
            <Button type="button" className="h-14 text-base" variant="outline" onClick={stopTimer} disabled={!running || saving}>
              <Square className="h-4 w-4" />
              Dừng
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="hidden rounded-[2rem] xl:block">
        <CardHeader>
          <CardTitle>Nhập thủ công</CardTitle>
          <CardDescription>Thêm công việc đã làm bằng giờ bắt đầu/kết thúc hoặc tổng số phút.</CardDescription>
        </CardHeader>
        <CardContent>
          <ManualEntryForm
            clients={clients}
            manualBillable={manualBillable}
            manualClientId={manualClientId}
            manualDate={manualDate}
            manualDescription={manualDescription}
            manualDuration={manualDuration}
            manualEnd={manualEnd}
            manualPreview={manualPreview}
            manualProjectId={manualProjectId}
            manualProjects={manualProjects}
            manualStart={manualStart}
            saving={saving}
            setManualBillable={setManualBillable}
            setManualClientId={setManualClientId}
            setManualDate={setManualDate}
            setManualDescription={setManualDescription}
            setManualDuration={setManualDuration}
            setManualEnd={setManualEnd}
            setManualStart={setManualStart}
            onProjectChange={handleManualProjectChange}
            onSubmit={createManualEntry}
          />
        </CardContent>
      </Card>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="h-14 text-base xl:hidden">
            <Plus className="h-4 w-4" />
            Nhập thủ công
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nhập thủ công</DialogTitle>
            <DialogDescription>Thêm công việc đã làm bằng giờ bắt đầu/kết thúc hoặc tổng số phút.</DialogDescription>
          </DialogHeader>
          <ManualEntryForm
            clients={clients}
            manualBillable={manualBillable}
            manualClientId={manualClientId}
            manualDate={manualDate}
            manualDescription={manualDescription}
            manualDuration={manualDuration}
            manualEnd={manualEnd}
            manualPreview={manualPreview}
            manualProjectId={manualProjectId}
            manualProjects={manualProjects}
            manualStart={manualStart}
            saving={saving}
            setManualBillable={setManualBillable}
            setManualClientId={setManualClientId}
            setManualDate={setManualDate}
            setManualDescription={setManualDescription}
            setManualDuration={setManualDuration}
            setManualEnd={setManualEnd}
            setManualStart={setManualStart}
            onProjectChange={handleManualProjectChange}
            onSubmit={createManualEntry}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManualEntryForm({
  clients,
  manualBillable,
  manualClientId,
  manualDate,
  manualDescription,
  manualDuration,
  manualEnd,
  manualPreview,
  manualProjectId,
  manualProjects,
  manualStart,
  saving,
  setManualBillable,
  setManualClientId,
  setManualDate,
  setManualDescription,
  setManualDuration,
  setManualEnd,
  setManualStart,
  onProjectChange,
  onSubmit
}: {
  clients: Client[];
  manualBillable: boolean;
  manualClientId: string;
  manualDate: string;
  manualDescription: string;
  manualDuration: string;
  manualEnd: string;
  manualPreview: { durationMinutes: number; amount: number; currency: string };
  manualProjectId: string;
  manualProjects: ProjectWithClient[];
  manualStart: string;
  saving: boolean;
  setManualBillable: (value: boolean) => void;
  setManualClientId: (value: string) => void;
  setManualDate: (value: string) => void;
  setManualDescription: (value: string) => void;
  setManualDuration: (value: string) => void;
  setManualEnd: (value: string) => void;
  setManualStart: (value: string) => void;
  onProjectChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>Khách hàng</Label>
                <Select value={manualClientId} onValueChange={setManualClientId}>
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
                <Label>Dự án</Label>
                <Select value={manualProjectId} onValueChange={onProjectChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Chọn dự án</SelectItem>
                    {manualProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="manual-date">Ngày</Label>
                <Input id="manual-date" type="date" value={manualDate} onChange={(event) => setManualDate(event.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manual-start">Bắt đầu</Label>
                <Input id="manual-start" type="time" value={manualStart} onChange={(event) => setManualStart(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="manual-end">Kết thúc</Label>
                <Input id="manual-end" type="time" value={manualEnd} onChange={(event) => setManualEnd(event.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-duration">Thời lượng phút</Label>
              <Input id="manual-duration" type="number" min="0" value={manualDuration} onChange={(event) => setManualDuration(event.target.value)} placeholder="Dùng khi không nhập giờ bắt đầu/kết thúc" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="manual-description">Mô tả công việc</Label>
              <Textarea id="manual-description" value={manualDescription} onChange={(event) => setManualDescription(event.target.value)} required />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Checkbox checked={manualBillable} onCheckedChange={(checked) => setManualBillable(checked === true)} />
                Tính phí
              </label>
              <div className="text-sm text-muted-foreground">
                {manualPreview.durationMinutes} phút · {formatMoney(manualPreview.amount, manualPreview.currency)}
              </div>
            </div>
            <Button disabled={saving}>
              <Plus className="h-4 w-4" />
              {saving ? "Đang lưu..." : "Thêm bản ghi"}
            </Button>
          </form>
  );
}

function filterProjects(projects: ProjectWithClient[], clientId: string) {
  return clientId === "none" ? projects : projects.filter((project) => project.client_id === clientId);
}

function calculateManualDuration(date: string, start: string, end: string, duration: string) {
  if (start && end) {
    return getDurationMinutes(new Date(`${date}T${start}`), new Date(`${date}T${end}`));
  }
  return Math.max(0, Number(duration || 0));
}

function buildBillingPreview(
  projects: ProjectWithClient[],
  clients: Client[],
  profile: Profile | null,
  projectId: string,
  isBillable: boolean,
  durationMinutes: number
) {
  const project = projects.find((item) => item.id === projectId);
  const client = clients.find((item) => item.id === project?.client_id);
  const hourlyRate = resolveHourlyRate(project?.hourly_rate, client?.default_hourly_rate, profile?.default_hourly_rate);
  const currency = client?.currency || profile?.currency || "VND";

  return {
    clientId: project?.client_id || null,
    durationMinutes,
    hourlyRate,
    amount: calculateAmount({ durationMinutes, hourlyRate, isBillable }),
    currency
  };
}
