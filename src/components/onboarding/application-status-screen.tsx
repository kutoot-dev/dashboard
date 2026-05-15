"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/lib/hooks";
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/constants/onboarding";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarDays,
  faCircleCheck,
  faCircleInfo,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  SCHEDULE_STAGES,
  TERMINAL_STAGES,
  STAGE_PHASES,
} from "@/lib/types/onboarding";
import type {
  MerchantStage,
  OnboardingApplication,
} from "@/lib/types";

interface ApplicationStatusScreenProps {
  applicationId: string;
  /** Phone number, if known, to show in status copy. */
  phone?: string | null;
  pollMs?: number;
  /**
   * When provided, the approved screen shows a "Continue Setup" button
   * instead of the final "Successfully Onboarded" message.
   * Use this for FE flows where qr_activation still needs to be completed.
   */
  onResume?: () => void;
}

/**
 * Stage-aware status screen for a submitted merchant application.
 *
 * Renders one of four variants based on the backend `stage` value:
 *   - Visit phase (revisit / owner_absent / shop_closed / competitor_user)
 *     shows the next scheduled visit datetime and lets the merchant
 *     re-confirm interest or reschedule.
 *   - Onboarding phase (submitted / under_review / in_progress / invited)
 *     shows the standard "under review" message and auto-polls.
 *   - Post-onboarding (approved / active) routes to the dashboard.
 *   - Terminal stages (rejected / suspended / churned / permanently_closed /
 *     not_interested) show a "needs attention" message.
 */
export function ApplicationStatusScreen({
  applicationId,
  phone,
  pollMs = 15_000,
  onResume,
}: ApplicationStatusScreenProps) {
  const router = useRouter();
  const appQuery = useApplication(applicationId);

  useEffect(() => {
    if (!applicationId) return;
    const id = setInterval(() => appQuery.refetch(), pollMs);
    return () => clearInterval(id);
  }, [applicationId, pollMs, appQuery]);

  const data = appQuery.data as OnboardingApplication | undefined;
  // Prefer the new `stage` field; fall back to the deprecated `status` for
  // transitional API responses.
  const stage: MerchantStage | null = useMemo(() => {
    if (!data) return null;
    if (data.stage) return data.stage;
    const legacy = (data as unknown as { status?: string }).status;
    return (legacy ?? null) as MerchantStage | null;
  }, [data]);

  const rejectionReason = useMemo(() => {
    if (!data) return null;
    const rec = data as unknown as Record<string, unknown>;
    return (rec.rejection_reason ?? rec.rejected_reason ?? rec.admin_notes ?? rec.notes ?? null) as
      | string
      | null;
  }, [data]);

  const displayPhone = phone ?? (data?.phone ?? null);
  const phase = stage ? STAGE_PHASES[stage] : null;
  const nextFollowUpAt = data?.next_follow_up_at ?? null;

  const isApproved = stage === "approved" || stage === "active";
  const isTerminal = stage ? TERMINAL_STAGES.has(stage) : false;
  const isVisitPhase = stage ? SCHEDULE_STAGES.has(stage) : false;
  const isOnboardingPhase = phase === "onboarding";

  const nextVisitLabel = useMemo(() => {
    if (!nextFollowUpAt) return null;
    try {
      const dt = new Date(nextFollowUpAt);
      return dt.toLocaleString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return null;
    }
  }, [nextFollowUpAt]);

  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-5xl text-primary">
        <FontAwesomeIcon
          icon={
            isApproved
              ? faCircleCheck
              : isTerminal
                ? faTriangleExclamation
                : isVisitPhase
                  ? faCalendarDays
                  : faCircleInfo
          }
        />
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        {isApproved
          ? "You're Approved!"
          : isTerminal
            ? "Application Needs Attention"
            : isVisitPhase
              ? "Visit Scheduled"
              : "Application Received"}
      </h2>

      {stage && (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              STAGE_COLORS[stage]?.bg ?? "bg-muted"
            } ${STAGE_COLORS[stage]?.text ?? "text-foreground"}`}
          >
            {STAGE_LABELS[stage] ?? stage}
          </span>
        </div>
      )}

      {isApproved ? (
        onResume ? (
          // FE post-approval: qr_activation still pending
          <div className="space-y-3">
            <p className="text-muted-foreground max-w-md mx-auto">
              Your application has been approved! Complete the final setup steps to
              activate your merchant account.
            </p>
            <div className="flex justify-center">
              <Button variant="primary" onClick={onResume} loading={false}>
                Continue Setup
              </Button>
            </div>
          </div>
        ) : (
          // Final approved state (merchant, or FE after qr_activation review)
          <div className="space-y-3">
            <p className="text-muted-foreground max-w-md mx-auto">
              You are successfully onboarded! Your login credentials will be shared
              through email.
            </p>
          </div>
        )
      ) : isTerminal ? (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            {stage === "rejected"
              ? "Our team flagged this application. Reach out to support with your application ID or submit a fresh application with corrected info."
              : stage === "not_interested"
                ? "We&apos;ve logged that you&apos;re not interested. Reach out anytime to restart the onboarding process."
                : stage === "permanently_closed"
                  ? "This shop is marked permanently closed in our records. Contact support to reopen."
                  : stage === "churned"
                    ? "This merchant account has been closed. Contact support to reactivate."
                    : "This application has been suspended. Contact support for next steps."}
          </p>
          {rejectionReason && (
            <p className="mx-auto max-w-md rounded-md border border-error/30 bg-error/5 px-4 py-2 text-sm text-error">
              <span className="font-semibold">Reason: </span>
              {rejectionReason}
            </p>
          )}
          <div className="flex justify-center gap-2">
            <Button variant="outline" onClick={() => router.push("/onboard/start")}>
              Start over
            </Button>
            <Button
              variant="primary"
              onClick={() =>
                window.open(
                  "mailto:support@kutoot.com?subject=Application%20Review",
                  "_blank",
                )
              }
            >
              Contact Support
            </Button>
          </div>
        </div>
      ) : isVisitPhase ? (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            {stage === "revisit"
              ? "A field executive will revisit you"
              : stage === "owner_absent"
                ? "Our field executive will return to meet the owner"
                : stage === "shop_closed"
                  ? "Our field executive will come back when the shop is open"
                  : "A field executive will reach out shortly"}
            {nextVisitLabel ? (
              <>
                {" "}on <span className="font-semibold">{nextVisitLabel}</span>.
              </>
            ) : (
              "."
            )}
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              onClick={() =>
                window.open(
                  "mailto:support@kutoot.com?subject=Reschedule%20Visit",
                  "_blank",
                )
              }
            >
              Reschedule
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            {stage === "under_review"
              ? "Our team is reviewing your documents. This usually takes under 15 minutes."
              : isOnboardingPhase
                ? displayPhone
                  ? `Your application is under review. You will receive an SMS on +91 ${displayPhone} once approved.`
                  : "Your application is under review. You will receive an SMS once approved."
                : "We're processing your application."}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Auto-refreshing every {Math.round(pollMs / 1000)} seconds
          </div>
          <div className="flex justify-center gap-2">
            <Button
              variant="ghost"
              onClick={() => appQuery.refetch()}
              loading={appQuery.isFetching}
            >
              Check now
            </Button>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground">
        Application ID: <span className="font-mono">{applicationId}</span>
      </p>
    </div>
  );
}
