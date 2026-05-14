"use client";

import { useEffect } from "react";
import { useToastStore } from "@/lib/stores/toast.store";
import { cn } from "@/lib/utils/cn";

const VARIANT_STYLES: Record<string, string> = {
  info: "border-accent/40 bg-accent/10 text-foreground",
  success: "border-gain/40 bg-gain/10 text-foreground",
  warning: "border-warning/40 bg-warning/10 text-foreground",
  error: "border-loss/40 bg-loss/10 text-foreground",
};

/**
 * Toast portal mounted once in the app shell. Reads from the zustand toast
 * store; individual screens push toasts via `useToastStore().push({ … })`.
 */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  // Ensure we always have SSR-safe mounting.
  useEffect(() => {
    // no-op; store is client-only.
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-4 top-4 z-9999 flex w-auto max-w-sm flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto rounded-lg border px-3 py-2 shadow-lg backdrop-blur",
            VARIANT_STYLES[t.variant ?? "info"],
          )}
          role="status"
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  {t.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Dismiss"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
