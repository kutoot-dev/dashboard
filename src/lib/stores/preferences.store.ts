import { create } from "zustand";

interface PreferencesState {
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  soundEnabled: true,
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
