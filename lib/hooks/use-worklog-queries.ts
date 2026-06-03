"use client";

import { useQuery } from "@tanstack/react-query";
import { endOfCurrentWeekISO, startOfCurrentMonthISO, startOfCurrentWeekISO, todayISO } from "@/lib/dates";
import { queryKeys } from "@/lib/query/keys";
import { createClient } from "@/lib/supabase/client";
import type { ProjectWithClient, TimeEntryWithRelations } from "@/lib/types/app";
import type { Client, Profile } from "@/lib/types/database";

type ClientOrder = "name" | "created_at";
type ProjectOrder = "name" | "created_at";

type ReportFilters = {
  startDate: string;
  endDate: string;
  clientId?: string;
  projectId?: string;
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function isMissingRow(error: { code?: string } | null) {
  return error?.code === "PGRST116";
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const supabase = createClient();
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      throwIfError(error);
      return user;
    }
  });
}

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.settings.profile,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("profiles").select("*").single();

      if (isMissingRow(error)) return null;
      throwIfError(error);
      return (data || null) as Profile | null;
    }
  });
}

export function useClients(orderBy: ClientOrder = "name") {
  return useQuery({
    queryKey: queryKeys.clients.list(orderBy),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("clients").select("*").order(orderBy, { ascending: orderBy === "name" });

      throwIfError(error);
      return (data || []) as Client[];
    }
  });
}

export function useProjects(orderBy: ProjectOrder = "name") {
  return useQuery({
    queryKey: queryKeys.projects.list(orderBy),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("projects")
        .select("*, clients(id, name, default_hourly_rate, currency)")
        .order(orderBy, { ascending: orderBy === "name" })
        .returns<ProjectWithClient[]>();

      throwIfError(error);
      return data || [];
    }
  });
}

export function useReportEntries({ startDate, endDate, clientId = "all", projectId = "all" }: ReportFilters) {
  return useQuery({
    queryKey: queryKeys.timeEntries.byRange(startDate, endDate, clientId, projectId),
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("time_entries")
        .select("*, clients(id, name, currency), projects(id, name)")
        .gte("entry_date", startDate)
        .lte("entry_date", endDate)
        .order("entry_date", { ascending: false });

      if (clientId !== "all") query = query.eq("client_id", clientId);
      if (projectId !== "all") query = query.eq("project_id", projectId);

      const { data, error } = await query.returns<TimeEntryWithRelations[]>();
      throwIfError(error);
      return data || [];
    },
    enabled: Boolean(startDate && endDate)
  });
}

export function useDashboardData() {
  const today = todayISO();
  const weekStart = startOfCurrentWeekISO();
  const weekEnd = endOfCurrentWeekISO();
  const monthStart = startOfCurrentMonthISO();

  return useQuery({
    queryKey: queryKeys.dashboard.summary(today, weekStart, weekEnd, monthStart),
    queryFn: async () => {
      const supabase = createClient();

      const [{ data: profile, error: profileError }, { data: weekEntries, error: weekError }, { data: monthEntries, error: monthError }, { data: recentEntries, error: recentError }, activeProjectsResult] =
        await Promise.all([
          supabase.from("profiles").select("*").single(),
          supabase
            .from("time_entries")
            .select("*, clients(id, name, currency), projects(id, name)")
            .gte("entry_date", weekStart)
            .lte("entry_date", weekEnd)
            .order("entry_date", { ascending: false })
            .returns<TimeEntryWithRelations[]>(),
          supabase.from("time_entries").select("duration_minutes").gte("entry_date", monthStart).returns<{ duration_minutes: number }[]>(),
          supabase
            .from("time_entries")
            .select("*, clients(id, name, currency), projects(id, name)")
            .order("created_at", { ascending: false })
            .limit(5)
            .returns<TimeEntryWithRelations[]>(),
          supabase.from("projects").select("id", { count: "exact", head: true }).eq("status", "active")
        ]);

      if (!isMissingRow(profileError)) throwIfError(profileError);
      throwIfError(weekError);
      throwIfError(monthError);
      throwIfError(recentError);
      throwIfError(activeProjectsResult.error);

      const entries = weekEntries || [];
      const todayMinutes = entries
        .filter((entry) => entry.entry_date === today)
        .reduce((sum, entry) => sum + entry.duration_minutes, 0);
      const weekMinutes = entries.reduce((sum, entry) => sum + entry.duration_minutes, 0);
      const weekAmount = entries.reduce((sum, entry) => sum + Number(entry.amount), 0);
      const monthMinutes = (monthEntries || []).reduce((sum, entry) => sum + entry.duration_minutes, 0);
      const currency = profile?.currency || entries[0]?.clients?.currency || "VND";

      const projectTotals = Object.values(
        entries.reduce<Record<string, { id: string; name: string; minutes: number }>>((acc, entry) => {
          const id = entry.project_id || "none";
          acc[id] ||= { id, name: entry.projects?.name || "Không có dự án", minutes: 0 };
          acc[id].minutes += entry.duration_minutes;
          return acc;
        }, {})
      ).sort((a, b) => b.minutes - a.minutes);

      return {
        todayMinutes,
        weekMinutes,
        weekAmount,
        monthMinutes,
        currency,
        projectTotals,
        recentEntries: recentEntries || [],
        activeProjects: activeProjectsResult.count || 0
      };
    }
  });
}
