"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useApplication } from "@/lib/hooks";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants/onboarding";
import type { OnboardingApplication } from "@/lib/types";

interface ApplicationStatusScreenProps {
  applicationId: string;
  /** Phone number, if known, to show in status copy. */
  phone?: string | null;
  pollMs?: number;
}

/**
 * Read-only status screen for a submitted merchant application. Polls the
 * backend so the merchant sees the live approval/rejection state without
 * re-entering the wizard. Shared by the submit-confirmation view and the
 * resume flow when the application is no longer a draft.
 */
export function ApplicationStatusScreen({
  applicationId,
  phone,
  pollMs = 15_000,
}: ApplicationStatusScreenProps) {
  const router = useRouter();
  const appQuery = useApplication(applicationId);

  useEffect(() => {
    if (!applicationId) return;
    const id = setInterval(() => appQuery.refetch(), pollMs);
    return () => clearInterval(id);
  }, [applicationId, pollMs, appQuery]);

  const status = appQuery.data?.status ?? null;
  const rejectionReason = useMemo(() => {
    if (!appQuery.data) return null;
    const rec = appQuery.data as unknown as Record<string, unknown>;
    return (rec.rejection_reason ?? rec.rejected_reason ?? rec.notes ?? null) as
      | string
      | null;
  }, [appQuery.data]);
  const displayPhone =
    phone ?? ((appQuery.data as OnboardingApplication | undefined)?.phone ?? null);

  const isApproved = status === "active";
  const isRejected = status === "rejected" || status === "suspended";
  const isVerifying = status === "pending_kyc_review" || status === "pending_bank_verify";
  const isActivating = status === "pending_activation";

  return (
    <div className="text-center py-12 space-y-4">
      <div className="text-5xl">
        {isApproved ? "✅" : isRejected ? "⚠️" : "🎉"}
      </div>
      <h2 className="text-2xl font-bold text-foreground">
        {isApproved
          ? "You're Approved!"
          : isRejected
            ? "Application Needs Attention"
            : "Application Received"}
      </h2>

      {status && (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isApproved
                ? "bg-success/10 text-success border-success/30"
                : isRejected
                  ? "bg-error/10 text-error border-error/30"
                  : "bg-warning/10 text-warning border-warning/30"
            }`}
          >
            {APPLICATION_STATUS_LABELS[status] ?? status}
          </span>
        </div>
      )}

      {isApproved ? (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            Your merchant account is live. We&apos;ve SMS&apos;d your login credentials
            {displayPhone ? (
              <>
                {" "}to <span className="font-mono">+91 {displayPhone}</span>
              </>
            ) : null}
            . Head to the dashboard to start tracking your rank.
          </p>
          <div className="flex justify-center">
            <Button variant="primary" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </div>
        </div>
      ) : isRejected ? (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            Our team flagged this application. Reach out to support with your
            application ID for details, or submit a fresh application with the
            corrected info.
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
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground max-w-md mx-auto">
            {isActivating
              ? "KYC is verified — we're attaching a QR code to your store. You'll get login credentials the moment we're done."
              : isVerifying
                ? "Verifying your KYC & bank details. This usually takes under 15 minutes."
                : displayPhone
                  ? `Your application is under review. You'll receive an SMS on +91 ${displayPhone} once approved.`
                  : "Your application is under review. You'll receive an SMS once approved."}
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
