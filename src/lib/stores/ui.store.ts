import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  chartTimeRange: number;
  setChartTimeRange: (range: number) => void;
  selectedPeriodId: string | null;
  setSelectedPeriodId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  chartTimeRange: -1,
  setChartTimeRange: (range) => set({ chartTimeRange: range }),
  selectedPeriodId: null,
  setSelectedPeriodId: (id) => set({ selectedPeriodId: id }),
}));
