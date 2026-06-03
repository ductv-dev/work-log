export const queryKeys = {
  auth: {
    user: ["auth", "user"] as const
  },
  clients: {
    all: ["clients"] as const,
    list: (orderBy: "name" | "created_at" = "name") => ["clients", "list", orderBy] as const,
    detail: (clientId: string) => ["clients", clientId] as const
  },
  projects: {
    all: ["projects"] as const,
    list: (orderBy: "name" | "created_at" = "name") => ["projects", "list", orderBy] as const,
    byClient: (clientId: string) => ["projects", "client", clientId] as const,
    detail: (projectId: string) => ["projects", projectId] as const
  },
  timeEntries: {
    all: ["time-entries"] as const,
    recent: ["time-entries", "recent"] as const,
    byRange: (from: string, to: string, clientId = "all", projectId = "all") =>
      ["time-entries", "range", from, to, clientId, projectId] as const
  },
  dashboard: {
    all: ["dashboard"] as const,
    summary: (today: string, weekStart: string, weekEnd: string, monthStart: string) =>
      ["dashboard", "summary", today, weekStart, weekEnd, monthStart] as const
  },
  reports: {
    all: ["reports"] as const,
    summary: (from: string, to: string, clientId = "all", projectId = "all") =>
      ["reports", "summary", from, to, clientId, projectId] as const
  },
  settings: {
    profile: ["settings", "profile"] as const
  }
};
