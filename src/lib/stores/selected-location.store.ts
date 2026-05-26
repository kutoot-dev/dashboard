import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORAGE_KEY = "kutoot_selected_location_id";

interface SelectedLocationState {
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  reset: () => void;
}

export const useSelectedLocationStore = create<SelectedLocationState>()(
  persist(
    (set) => ({
      selectedLocationId: null,
      setSelectedLocationId: (id) => set({ selectedLocationId: id }),
      reset: () => set({ selectedLocationId: null }),
    }),
    { name: STORAGE_KEY },
  ),
);
