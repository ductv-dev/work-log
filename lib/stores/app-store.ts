"use client";

import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";

export type RunningTimerState = {
  clientId: string;
  projectId: string;
  description: string;
  isBillable: boolean;
  startedAt: string;
};

type TimerDraft = {
  clientId?: string;
  projectId?: string;
  description?: string;
};

type AppState = {
  lastPathname: string;
  manualEntryOpen: boolean;
  timerDraft: TimerDraft;
  runningTimer: RunningTimerState | null;
  setLastPathname: (pathname: string) => void;
  setManualEntryOpen: (open: boolean) => void;
  updateTimerDraft: (draft: Partial<TimerDraft>) => void;
  resetTimerDraft: () => void;
  setRunningTimer: (timer: RunningTimerState | null) => void;
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        lastPathname: "/dashboard",
        manualEntryOpen: false,
        timerDraft: {},
        runningTimer: null,
        setLastPathname: (pathname) => set({ lastPathname: pathname }, false, "app/set-last-pathname"),
        setManualEntryOpen: (open) => set({ manualEntryOpen: open }, false, "app/set-manual-entry-open"),
        updateTimerDraft: (draft) =>
          set((state) => ({ timerDraft: { ...state.timerDraft, ...draft } }), false, "app/update-timer-draft"),
        resetTimerDraft: () => set({ timerDraft: {} }, false, "app/reset-timer-draft"),
        setRunningTimer: (timer) => set({ runningTimer: timer }, false, "app/set-running-timer")
      }),
      {
        name: "worklog-app-store",
        partialize: (state) => ({
          lastPathname: state.lastPathname,
          timerDraft: state.timerDraft,
          runningTimer: state.runningTimer
        }),
        storage: createJSONStorage(() => localStorage)
      }
    ),
    { name: "WorkLogAppStore" }
  )
);
