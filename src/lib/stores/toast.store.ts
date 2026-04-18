import { create } from "zustand";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: "info" | "success" | "warning" | "error";
  createdAt: number;
  durationMs: number;
}

interface ToastStore {
  toasts: Toast[];
  push: (t: Omit<Toast, "id" | "createdAt" | "durationMs"> & { durationMs?: number }) => void;
  dismiss: (id: string) => void;
  clear: () => void;
}

let counter = 0;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = `toast-${Date.now()}-${++counter}`;
    const toast: Toast = {
      id,
      createdAt: Date.now(),
      durationMs: t.durationMs ?? 4500,
      variant: t.variant ?? "info",
      title: t.title,
      description: t.description,
    };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    if (toast.durationMs > 0) {
      setTimeout(() => {
        set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) }));
      }, toast.durationMs);
    }
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  clear: () => set({ toasts: [] }),
}));
