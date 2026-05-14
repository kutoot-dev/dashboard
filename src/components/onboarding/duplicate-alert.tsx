"use client";

import { cn } from "@/lib/utils/cn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import type { ApplicationStatus } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants/onboarding";

interface DuplicateAlertProps {
  status: "active_merchant" | "existing_lead" | "already_submitted" | "existing_fe_visit";
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
  const actionLabel =
    status === "already_submitted" || status === "active_merchant"
      ? "View current application status"
      : "Resume this application";

  const colors =
    status === "active_merchant"
      ? { bg: "bg-success/10", border: "border-success/30", icon: "text-success" }
      : status === "already_submitted" || status === "existing_fe_visit"
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
        <div className={cn("shrink-0 mt-0.5", colors.icon)}>
          {status === "active_merchant" ? (
            <FontAwesomeIcon icon={faCircleCheck} className="h-5 w-5" />
          ) : (
            <FontAwesomeIcon icon={faTriangleExclamation} className="h-5 w-5" />
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
          {applicationId && onResume && (
            <button
              type="button"
              onClick={onResume}
              className="mt-2 text-sm font-medium text-primary hover:text-primary/80 underline"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
