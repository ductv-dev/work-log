"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Square } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { calculateAmount, formatTimer, getDurationMinutes, resolveHourlyRate } from "@/lib/calculations";
import { queryKeys } from "@/lib/query/keys";
import { useAppStore } from "@/lib/stores/app-store";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { useClients, useCurrentUser, useProfile, useProjects } from "@/lib/hooks/use-worklog-queries";
import type { Client, Profile } from "@/lib/types/database";
import type { ProjectWithClient } from "@/lib/types/app";

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

export function MiniTimer() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const running = useAppStore((state) => state.runningTimer);
  const setRunning = useAppStore((state) => state.setRunningTimer);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const userQuery = useCurrentUser();
  const clientsQuery = useClients("name");
  const projectsQuery = useProjects("name");
  const profileQuery = useProfile();

  useEffect(() => {
    if (!running) {
      setElapsedSeconds(0);
      return;
    }
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - new Date(running.startedAt).getTime()) / 1000)));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running]);

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

  if (!running || pathname === "/time") return null;

  async function stopTimer() {
    if (!running) return;

    if (!userQuery.data) {
      toast({ title: "Đang tải dữ liệu", variant: "destructive" });
      return;
    }

    const projects = projectsQuery.data || [];
    const clients = clientsQuery.data || [];
    const profile = profileQuery.data || null;
    const userId = userQuery.data.id;

    const startedAtDate = new Date(running.startedAt);
    const end = new Date();
    const durationMinutes = getDurationMinutes(startedAtDate, end);
    const preview = buildBillingPreview(projects, clients, profile, running.projectId, running.isBillable, durationMinutes);

    try {
      await createEntryMutation.mutateAsync({
        user_id: userId,
        client_id: running.clientId === "none" ? preview.clientId : running.clientId,
        project_id: running.projectId,
        description: running.description,
        start_time: running.startedAt,
        end_time: end.toISOString(),
        duration_minutes: durationMinutes,
        hourly_rate: preview.hourlyRate,
        amount: preview.amount,
        is_billable: running.isBillable,
        entry_date: running.startedAt.slice(0, 10)
      });
    } catch (error) {
      toast({ title: "Lỗi lưu bộ đếm", description: error instanceof Error ? error.message : "Vui lòng thử lại.", variant: "destructive" });
      return;
    }

    setRunning(null);
    toast({ title: "Đã tạo bản ghi thời gian" });
  }

  const project = (projectsQuery.data || []).find((p) => p.id === running.projectId);
  const projectName = project ? project.name : "Không có dự án";

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 z-40 -translate-x-1/2 lg:bottom-8 lg:left-[auto] lg:right-8 lg:translate-x-0">
      <div className="glass flex items-center gap-4 rounded-full py-2 pl-5 pr-2 shadow-xl ring-1 ring-white/40 dark:bg-slate-900/80 dark:ring-white/20">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/60 truncate max-w-[120px]">
            {running.description || projectName}
          </span>
          <span className="font-mono text-sm font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatTimer(elapsedSeconds)}
          </span>
        </div>
        <Button 
          variant="destructive" 
          size="icon" 
          className="h-10 w-10 rounded-full shadow-md shadow-red-500/20 active:scale-95 transition-transform" 
          onClick={stopTimer} 
          disabled={createEntryMutation.isPending}
        >
          <Square className="h-4 w-4" fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}
