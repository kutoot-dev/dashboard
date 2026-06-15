"use client";

import { Card } from "@/components/ui/card";
import { STAGE_COLORS, STAGE_LABELS } from "@/lib/constants/onboarding";
import type { OnboardingApplicationStatus } from "@/lib/api/services/merchant.service";
import {
  SCHEDULE_STAGES,
  TERMINAL_STAGES,
  type MerchantStage,
} from "@/lib/types/onboarding";

function formatDateTime(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

function statusDescription(stage: MerchantStage): string {
  if (stage === "approved" || stage === "active") {
    return "Your store is approved and active on Kutoot.";
  }

  if (TERMINAL_STAGES.has(stage)) {
    if (stage === "rejected") {
      return "Our team flagged this application. Review the note below or contact support.";
    }
    if (stage === "not_interested") {
      return "This application is marked as not interested. You can restart onboarding anytime.";
    }
    if (stage === "permanently_closed") {
      return "This shop is marked permanently closed in our records.";
    }
    if (stage === "churned") {
      return "This merchant account has been closed.";
    }
    return "This application needs attention. Contact support for next steps.";
  }

  if (SCHEDULE_STAGES.has(stage)) {
    return "A field visit or follow-up is scheduled for your store.";
  }

  if (stage === "under_review" || stage === "submitted") {
    return "Our team is reviewing your application. We will update this status when there is news.";
  }

  if (
    stage === "basic_details_submitted" ||
    stage === "bank_details_submitted" ||
    stage === "kyc_submitted" ||
    stage === "in_progress" ||
    stage === "invited" ||
    stage === "lead"
  ) {
    return "Complete onboarding to unlock full rankings and payouts.";
  }

  return "Track your onboarding progress here.";
}

interface ApplicationStatusCardProps {
  status: OnboardingApplicationStatus;
}

export function ApplicationStatusCard({ status }: ApplicationStatusCardProps) {
  const stage = status.stage as MerchantStage;
  const label = status.stage_label || STAGE_LABELS[stage] || status.stage;
  const colors = STAGE_COLORS[stage] ?? { bg: "bg-muted", text: "text-foreground" };
  const nextVisit = formatDateTime(status.next_follow_up_at);
  const submittedAt = formatDateTime(status.submitted_at);
  const updatedAt = formatDateTime(status.updated_at);

  return (
    <Card className="space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">Application status</h2>
          <p className="text-sm text-muted-foreground">{statusDescription(stage)}</p>
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
        >
          {label}
        </span>
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        {submittedAt ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Submitted
            </dt>
            <dd className="mt-0.5 text-foreground">{submittedAt}</dd>
          </div>
        ) : null}

        {updatedAt ? (
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Last updated
            </dt>
            <dd className="mt-0.5 text-foreground">{updatedAt}</dd>
          </div>
        ) : null}

        {nextVisit ? (
          <div className="sm:col-span-2">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next visit
            </dt>
            <dd className="mt-0.5 text-foreground">{nextVisit}</dd>
          </div>
        ) : null}
      </dl>

      {status.notes ? (
        <p className="rounded-xl border border-warning/30 bg-warning/5 px-3 py-2 text-sm text-foreground">
          <span className="font-medium text-warning">Note: </span>
          {status.notes}
        </p>
      ) : null}
    </Card>
  );
}
