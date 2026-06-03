"use client";

import { Download, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/layout/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { formatDuration, formatMoney } from "@/lib/calculations";
import { useClients, useProfile, useProjects, useReportEntries } from "@/lib/hooks/use-worklog-queries";

export function ReportsView({
  initialStartDate,
  initialEndDate
}: {
  initialStartDate: string;
  initialEndDate: string;
}) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [clientId, setClientId] = useState("all");
  const [projectId, setProjectId] = useState("all");
  const [appliedFilters, setAppliedFilters] = useState({
    startDate: initialStartDate,
    endDate: initialEndDate,
    clientId: "all",
    projectId: "all"
  });
  const clientsQuery = useClients("name");
  const projectsQuery = useProjects("name");
  const profileQuery = useProfile();
  const entriesQuery = useReportEntries(appliedFilters);
  const clients = clientsQuery.data || [];
  const projects = projectsQuery.data || [];
  const profile = profileQuery.data || null;
  const entries = useMemo(() => entriesQuery.data || [], [entriesQuery.data]);
  const loading = clientsQuery.isLoading || projectsQuery.isLoading || profileQuery.isLoading || entriesQuery.isFetching;
  const error = clientsQuery.error || projectsQuery.error || profileQuery.error || entriesQuery.error;

  const filteredProjects = clientId === "all" ? projects : projects.filter((project) => project.client_id === clientId);

  const totals = useMemo(
    () => ({
      minutes: entries.reduce((sum, entry) => sum + entry.duration_minutes, 0),
      amount: entries.reduce((sum, entry) => sum + Number(entry.amount), 0)
    }),
    [entries]
  );

  function applyFilters() {
    setAppliedFilters({ startDate, endDate, clientId, projectId });
    toast({ title: "Đã cập nhật báo cáo" });
  }

  function exportCsv() {
    const headers = ["Ngày", "Khách hàng", "Dự án", "Mô tả", "Thời lượng phút", "Đơn giá theo giờ", "Thành tiền", "Tính phí"];
    const rows = entries.map((entry) => [
      entry.entry_date,
      entry.clients?.name || "",
      entry.projects?.name || "",
      entry.description || "",
      String(entry.duration_minutes),
      String(entry.hourly_rate),
      String(entry.amount),
      entry.is_billable ? "Có" : "Không"
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `worklog-${startDate}-to-${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Đã xuất CSV" });
  }

  const currency = profile?.currency || entries[0]?.clients?.currency || "VND";

  return (
    <div className="space-y-5">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-2">
            <Label htmlFor="start-date">Từ ngày</Label>
            <Input id="start-date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">Đến ngày</Label>
            <Input id="end-date" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Khách hàng</Label>
            <Select
              value={clientId}
              onValueChange={(value) => {
                setClientId(value);
                setProjectId("all");
              }}
            >
              <SelectTrigger>
                <SelectValue />
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
          <div className="grid gap-2">
            <Label>Dự án</Label>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả dự án</SelectItem>
                {filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button type="button" className="flex-1" onClick={applyFilters} disabled={loading}>
              <Filter className="h-4 w-4" />
              {loading ? "Đang tải..." : "Áp dụng"}
            </Button>
            <Button type="button" variant="outline" size="icon" title="Xuất CSV" onClick={exportCsv} disabled={entries.length === 0}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="rounded-[2rem] border-red-200/60 bg-red-50/70 text-red-700 dark:bg-red-950/30 dark:text-red-200">
          <CardContent className="p-5">Không thể tải báo cáo: {error.message}</CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-[1.7rem]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tổng thời lượng</p>
            <p className="mt-2 text-2xl font-semibold">{formatDuration(totals.minutes)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.7rem]">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Tổng tiền</p>
            <p className="mt-2 text-2xl font-semibold">{formatMoney(totals.amount, currency)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem]">
        <CardContent className="p-4 md:p-0">
          {entries.length === 0 ? (
            <div className="p-5">
              <EmptyState title="Không có bản ghi thời gian phù hợp" description="Thử đổi bộ lọc hoặc ghi thêm thời gian." />
            </div>
          ) : (
            <>
            <div className="space-y-3 md:hidden">
              {entries.map((entry) => {
                const entryCurrency = entry.clients?.currency || currency;
                return (
                  <div key={entry.id} className="rounded-3xl bg-white/45 p-4 ring-1 ring-white/30 dark:bg-white/8">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{entry.projects?.name || "Không có dự án"}</p>
                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-white/60">{entry.clients?.name || "Không có khách hàng"}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-white/60">{entry.description}</p>
                        <p className="mt-2 text-xs text-slate-400 dark:text-white/45">{entry.entry_date}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300">{formatMoney(entry.amount, entryCurrency)}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-white/55">{formatDuration(entry.duration_minutes)}</p>
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
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Dự án</TableHead>
                  <TableHead>Mô tả</TableHead>
                  <TableHead>Thời lượng</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Thành tiền</TableHead>
                  <TableHead>Tính phí</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const entryCurrency = entry.clients?.currency || currency;
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.entry_date}</TableCell>
                      <TableCell>{entry.clients?.name || "-"}</TableCell>
                      <TableCell>{entry.projects?.name || "-"}</TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">{entry.description}</TableCell>
                      <TableCell>{formatDuration(entry.duration_minutes)}</TableCell>
                      <TableCell>{formatMoney(entry.hourly_rate, entryCurrency)}</TableCell>
                      <TableCell>{formatMoney(entry.amount, entryCurrency)}</TableCell>
                      <TableCell>{entry.is_billable ? "Có" : "Không"}</TableCell>
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
    </div>
  );
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
