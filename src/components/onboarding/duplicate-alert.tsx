"use client";

import { cn } from "@/lib/utils/cn";
import type { ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants/onboarding";

interface DuplicateAlertProps {
  status: "active_merchant" | "existing_lead" | "already_submitted";
  applicationId: string | null;
  applicationStatus: ApplicationStatus | null;
  message: string;
  onResume?: () => void;
  className?: string;
}

/**
 * Alert shown when the entered phone number already exists in the system.
 */
export function DuplicateAlert({
  status,
  applicationId,
  applicationStatus,
  message,
  onResume,
  className,
}: DuplicateAlertProps) {
  const colors =
    status === "active_merchant"
      ? { bg: "bg-success/10", border: "border-success/30", icon: "text-success" }
      : status === "already_submitted"
        ? { bg: "bg-warning/10", border: "border-warning/30", icon: "text-warning" }
        : { bg: "bg-info/10", border: "border-info/30", icon: "text-info" };

  return (
    <div
      className={cn(
        "rounded-lg border p-4",
        colors.bg,
        colors.border,
        className,
      )}
    >
      <div className="flex gap-3">
        <div className={cn("flex-shrink-0 mt-0.5", colors.icon)}>
          {status === "active_merchant" ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">{message}</p>
          {applicationId && applicationStatus && (
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">
                Application: <span className="font-mono">{applicationId}</span>
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium",
                  APPLICATION_STATUS_COLORS[applicationStatus]?.bg,
                  APPLICATION_STATUS_COLORS[applicationStatus]?.text,
                )}
              >
                {APPLICATION_STATUS_LABELS[applicationStatus] || applicationStatus}
              </span>
            </div>
          )}
          {status === "existing_lead" && onResume && (
            <button
              type="button"
              onClick={onResume}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 underline"
            >
              Resume this application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
