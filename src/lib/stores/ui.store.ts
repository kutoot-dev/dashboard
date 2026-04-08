import { create } from "zustand";

interface DateRange {
  start: string;
  end: string;
}

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  dateRange: { start: "2026-03-08", end: "2026-04-08" },
  setDateRange: (range) => set({ dateRange: range }),
}));
