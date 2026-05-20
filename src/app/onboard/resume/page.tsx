"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/onboarding/otp-input";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useSendOtp, useVerifyOtp, useVerifyExecutive } from "@/lib/hooks";
import {
  ONBOARDING_STRINGS,
  VALIDATION_RULES,
} from "@/lib/constants/onboarding";
import { onboardingService } from "@/lib/api/services";
import { cn } from "@/lib/utils/cn";
import type { WizardStepId } from "@/lib/types";

type ResumeMode = "select" | "merchant" | "executive";
type MerchantStep = "phone" | "otp";

const cardClass =
  "glass-card-transparent rounded-2xl p-5 sm:p-6 space-y-4 transition-shadow hover:shadow-lg";

const selectTileClass =
  "glass-card-transparent cursor-pointer rounded-2xl p-6 transition-all hover:ring-2 hover:ring-accent/40 hover:shadow-md active:scale-[0.99]";

function getActiveStepsForResume(
  channel: string | null | undefined,
  visitOutcome: string | null | undefined,
  resumeInventoryHandover: boolean,
): WizardStepId[] {
  if (resumeInventoryHandover) {
    return ["qr_activation", "review"];
  }
  if (channel === "merchant") {
    return ["identity", "basic_details", "commission", "kyc", "bank", "review"];
  }
  if (channel === "field_executive") {
    if (visitOutcome === "interested") {
      return [
        "identity",
        "visit_outcome",
        "basic_details",
        "commission",
        "kyc",
        "bank",
        "qr_activation",
        "review",
      ];
    }
    if (visitOutcome === null || visitOutcome === undefined) {
      return ["identity", "visit_outcome"];
    }
    return ["identity", "visit_outcome", "basic_details", "review"];
  }
  return ["identity"];
}

function inferCompletedSteps(
  currentStep: WizardStepId | null | undefined,
  channel: string | null | undefined,
  visitOutcome: string | null | undefined,
  resumeInventoryHandover: boolean,
): WizardStepId[] {
  const activeSteps = getActiveStepsForResume(channel, visitOutcome, resumeInventoryHandover);
  if (!currentStep) return [];

  const currentIndex = activeSteps.indexOf(currentStep);
  if (currentIndex <= 0) return [];

  return activeSteps.slice(0, currentIndex);
}

const toResumePayload = (
  app: Awaited<ReturnType<typeof onboardingService.listApplications>>["data"]["items"][number],
  resumeInventoryHandover = false,
) => ({
  ...app,
  application_id: app.application_id,
  current_step: app.current_step,
  completed_steps:
    app.completed_steps && Array.isArray(app.completed_steps)
      ? app.completed_steps
      : inferCompletedSteps(app.current_step, app.channel, app.visit_outcome, resumeInventoryHandover),
});

function shouldResumeInventoryHandover(
  app: Awaited<ReturnType<typeof onboardingService.listApplications>>["data"]["items"][number],
): boolean {
  return (
    app.channel === "field_executive" &&
    (app.stage === "approved" || app.stage === "active")
  );
}

export default function ResumePage() {
  const router = useRouter();
  const [mode, setMode] = useState<ResumeMode>("select");
  const [merchantStep, setMerchantStep] = useState<MerchantStep>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();
  const verifyExec = useVerifyExecutive();
  const loadFromApplication = useOnboardingStore((s) => s.loadFromApplication);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const from = searchParams.get("from");
    const queryReferralCode = (searchParams.get("referral_code") ?? "").trim().toUpperCase();

    if (queryReferralCode) {
      setReferralCode(queryReferralCode);
    }

    if (!from) {
      const targetParams = new URLSearchParams();
      if (queryReferralCode) {
        targetParams.set("referral_code", queryReferralCode);
      }
      router.replace(
        targetParams.size > 0
          ? `/onboard/start?${targetParams.toString()}`
          : "/onboard/start",
      );
      return;
    }

    const qPhone = searchParams.get("phone") ?? "";
    const clean = qPhone.replace(/\D/g, "").slice(0, 10);
    if (clean.length === 10) {
      setMode("merchant");
      setPhone(clean);
    }
  }, [router]);

  const handleSendOtp = () => {
    if (!VALIDATION_RULES.phone.pattern.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setError(null);
    sendOtp.mutate(phone, {
      onSuccess: (res) => {
        if (res.success && res.data?.sent) {
          setMerchantStep("otp");
          return;
        }
        setError(res.data?.message || "Failed to send OTP. Try again.");
      },
      onError: () => setError("Failed to send OTP. Try again."),
    });
  };

  const handleVerifyOtp = (otp: string) => {
    setError(null);
    verifyOtp.mutate(
      { phone, otp },
      {
        onSuccess: async () => {
          await loadApplication(phone);
        },
        onError: () => setError("Invalid OTP. Try again."),
      },
    );
  };

  const handleExecResume = () => {
    const normalizedEmployeeCode = employeeCode.trim();
    if (!VALIDATION_RULES.employee_code.pattern.test(normalizedEmployeeCode)) {
      setError("Enter a valid employee code (4-8 alphanumeric).");
      return;
    }
    setError(null);
    verifyExec.mutate(normalizedEmployeeCode, {
      onSuccess: async (res) => {
        if (!res.data.valid) {
          setError(res.data.message || "Invalid employee code.");
          return;
        }
        await loadApplicationByExec(res.data.exec_id || "");
      },
      onError: () => setError("Verification failed. Try again."),
    });
  };

  const hydrateAndGo = async (applicationId: string, resumeInventoryHandover = false) => {
    try {
      const detail = await onboardingService.getApplication(applicationId);
      const fullApp = detail.data ?? null;
      if (fullApp) {
        loadFromApplication({
          ...(fullApp as unknown as Record<string, unknown>),
          application_id: applicationId,
          resume_inventory_handover: resumeInventoryHandover,
          current_step: fullApp.current_step,
          completed_steps:
            Array.isArray((fullApp as { completed_steps?: unknown }).completed_steps)
              ? (fullApp as { completed_steps: WizardStepId[] }).completed_steps
              : inferCompletedSteps(
                  fullApp.current_step,
                  (fullApp as { channel?: string | null }).channel,
                  (fullApp as { visit_outcome?: string | null }).visit_outcome,
                  resumeInventoryHandover,
                ),
        } as Parameters<typeof loadFromApplication>[0]);
      }
    } catch {
      // fall through with whatever the listing already returned
    }
    const params = new URLSearchParams({ mode: "resume" });
    if (referralCode) {
      params.set("referral_code", referralCode);
    }
    router.push(`/onboard?${params.toString()}`);
  };

  const loadApplication = async (phone: string) => {
    setLoading(true);
    try {
      const res = await onboardingService.listApplications({ phone });
      const includeFinalRes = await onboardingService.listApplications({ phone, include_final: true });
      const apps = res.data?.items || [];
      const finalApps = includeFinalRes.data?.items || [];
      const candidateApps = apps.length > 0 ? apps : finalApps;
      if (Array.isArray(candidateApps) && candidateApps.length > 0) {
        const app = candidateApps[0];
        const resumeInventoryHandover = shouldResumeInventoryHandover(app);
        loadFromApplication(toResumePayload(app, resumeInventoryHandover));
        await hydrateAndGo(app.application_id, resumeInventoryHandover);
      } else {
        setError("No application found for this number.");
      }
    } catch {
      setError("Failed to load application. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplicationByExec = async (execId: string) => {
    setLoading(true);
    try {
      const res = await onboardingService.listApplications({ exec_id: execId });
      const finalRes = await onboardingService.listApplications({ exec_id: execId, include_final: true });
      const apps = res.data?.items || [];
      const finalApps = finalRes.data?.items || [];
      const candidateApps = apps.length > 0 ? apps : finalApps;
      if (Array.isArray(candidateApps) && candidateApps.length > 0) {
        const app = candidateApps[0];
        const resumeInventoryHandover = shouldResumeInventoryHandover(app);
        loadFromApplication(toResumePayload(app, resumeInventoryHandover));
        await hydrateAndGo(app.application_id, resumeInventoryHandover);
      } else {
        setError("No applications found for your account.");
      }
    } catch {
      setError("Failed to load application. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {ONBOARDING_STRINGS.RESUME_TITLE}
        </h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          {ONBOARDING_STRINGS.RESUME_SUBTITLE}
        </p>
        <div className="mt-4 h-px w-16 bg-linear-to-r from-transparent via-primary to-transparent" />
      </div>

      {mode === "select" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMode("merchant")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMode("merchant");
              }
            }}
            className={selectTileClass}
          >
            <div className="mb-3 text-3xl" aria-hidden>
              📱
            </div>
            <h3 className="font-semibold text-foreground">I am a Merchant</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Resume using your mobile number + OTP
            </p>
          </div>
          <div
            role="button"
            tabIndex={0}
            onClick={() => setMode("executive")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setMode("executive");
              }
            }}
            className={selectTileClass}
          >
            <div className="mb-3 text-3xl" aria-hidden>
              🪪
            </div>
            <h3 className="font-semibold text-foreground">I am a Field Executive</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Resume using your employee code
            </p>
          </div>
        </div>
      )}

      {mode === "merchant" && merchantStep === "phone" && (
        <div className={cn(cardClass)}>
          <h3 className="font-semibold text-foreground">Enter your mobile number</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <div className="flex shrink-0 items-center justify-center rounded-lg border border-border/80 bg-background/40 px-3 py-2.5 text-sm text-muted-foreground backdrop-blur-sm sm:py-2">
              +91
            </div>
            <Input
              placeholder="9876543210"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              maxLength={10}
              inputMode="numeric"
              className="min-h-11 flex-1"
            />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-3">
            <Button variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={() => setMode("select")}>
              Back
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full sm:w-auto"
              onClick={handleSendOtp}
              loading={sendOtp.isPending}
            >
              Send OTP
            </Button>
          </div>
        </div>
      )}

      {mode === "merchant" && merchantStep === "otp" && (
        <div className={cn(cardClass)}>
          <h3 className="font-semibold text-foreground">
            Enter OTP sent to +91 {phone}
          </h3>
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (val.length === 6) handleVerifyOtp(val);
            }}
            disabled={verifyOtp.isPending || loading}
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:items-center sm:gap-4">
            <Button
              variant="ghost"
              className="min-h-11 w-full sm:w-auto"
              onClick={() => setMerchantStep("phone")}
            >
              Change Number
            </Button>
            {(verifyOtp.isPending || loading) && (
              <span className="text-center text-xs text-muted-foreground sm:text-left">
                Loading...
              </span>
            )}
          </div>
        </div>
      )}

      {mode === "executive" && (
        <div className={cn(cardClass)}>
          <h3 className="font-semibold text-foreground">Enter your employee code</h3>
          <Input
            placeholder="KT1234"
            value={employeeCode}
            onChange={(e) =>
              setEmployeeCode(e.target.value.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8))
            }
            maxLength={8}
            className="min-h-11"
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:gap-3">
            <Button variant="ghost" className="min-h-11 w-full sm:w-auto" onClick={() => setMode("select")}>
              Back
            </Button>
            <Button
              variant="primary"
              className="min-h-11 w-full sm:w-auto"
              onClick={handleExecResume}
              loading={verifyExec.isPending || loading}
            >
              Resume
            </Button>
          </div>
        </div>
      )}

      <div className="text-center">
        <button
          type="button"
          onClick={() => router.push("/onboard/start")}
          className="text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-accent/90 hover:underline"
        >
          Start a new application instead
        </button>
      </div>
    </div>
  );
}
