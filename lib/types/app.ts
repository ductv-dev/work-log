import type { Client, Project, TimeEntry } from "@/lib/types/database";

export type ProjectWithClient = Project & {
  clients: Pick<Client, "id" | "name" | "default_hourly_rate" | "currency"> | null;
};

export type TimeEntryWithRelations = TimeEntry & {
  clients: Pick<Client, "id" | "name" | "currency"> | null;
  projects: Pick<Project, "id" | "name"> | null;
};
