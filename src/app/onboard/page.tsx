"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepVisitOutcome } from "@/components/onboarding/step-visit-outcome";
import { StepBasicDetails } from "@/components/onboarding/step-basic-details";
import { StepCommission } from "@/components/onboarding/step-commission";
import { StepKyc } from "@/components/onboarding/step-kyc";
import { StepBank } from "@/components/onboarding/step-bank";
import { StepQrActivation } from "@/components/onboarding/step-qr-activation";
import { StepReview } from "@/components/onboarding/step-review";
import { ApplicationStatusScreen } from "@/components/onboarding/application-status-screen";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useApplication, useUpdateApplication, useCreateApplication } from "@/lib/hooks";
import { useToastStore } from "@/lib/stores/toast.store";
import { ApiError } from "@/lib/api/client";
import { WIZARD_STEP_CONFIG } from "@/lib/types";
import type {
  WizardStepId,
  MerchantStage,
  OnboardingApplication,
  WizardStepConfig,
} from "@/lib/types";

// ── Compute active steps based on channel + visit outcome ─────────

function getActiveSteps(
  channel: string | null,
  visitOutcome: string | null,
  resumeInventoryHandover: boolean,
): WizardStepId[] {
  if (resumeInventoryHandover) {
    return ["qr_activation", "review"];
  }
  if (channel === "merchant") {
    // Merchant self-onboarding: no visit_outcome step, no QR step
    return ["identity", "basic_details", "commission", "kyc", "bank", "review"];
  }
  if (channel === "field_executive") {
    if (visitOutcome === "interested") {
      // Full field-executive onboarding flow (includes QR activation)
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
    if (visitOutcome === null) {
      // FE logged in but hasn't chosen outcome yet
      return ["identity", "visit_outcome"];
    }
    // FE visit-only (any non-interested outcome) — minimal form
    return ["identity", "visit_outcome", "basic_details", "review"];
  }
  // Channel not yet selected — show just identity
  return ["identity"];
}

/**
 * Only fully approved post-onboarding stages should force the read-only
 * status screen for standard merchant resumes.
 */
const STATUS_LOCKED_STAGES: ReadonlySet<string> = new Set([
  "approved",
  "active",
]);

export default function OnboardPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const pushToast = useToastStore((s) => s.push);
  const referralHydratedRef = useRef(false);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const {
    currentStep,
    completedSteps,
    applicationId,
    completeStep,
    setStep,
    formData,
    updateFormData,
  } = useOnboardingStore();
  const updateApp = useUpdateApplication();
  const createApp = useCreateApplication();

  const extractApiErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof ApiError) {
      if (typeof error.details === "object" && error.details !== null) {
        const detailValues = Object.values(error.details as Record<string, unknown>);
        for (const value of detailValues) {
          if (typeof value === "string" && value.trim()) {
            return value;
          }
          if (Array.isArray(value) && typeof value[0] === "string" && value[0].trim()) {
            return value[0];
          }
        }
      }

      if (error.message.trim()) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return "Unable to save this step. Please try again.";
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("mode");
    const referralCode = (searchParams.get("referral_code") ?? "").trim().toUpperCase();
    if (!applicationId && mode === "resume") {
      const targetParams = new URLSearchParams({ from: "onboard" });
      if (referralCode) targetParams.set("referral_code", referralCode);
      router.replace(`/onboard/resume?${targetParams.toString()}`);
      return;
    }

    if (!applicationId && mode !== "new") {
      const targetParams = new URLSearchParams();
      if (referralCode) targetParams.set("referral_code", referralCode);
      router.replace(
        targetParams.size > 0
          ? `/onboard/start?${targetParams.toString()}`
          : "/onboard/start",
      );
    }
  }, [applicationId, router]);

  useEffect(() => {
    if (referralHydratedRef.current) return;

    const searchParams = new URLSearchParams(window.location.search);
    const queryReferralCode = (searchParams.get("referral_code") ?? "").trim().toUpperCase();

    if (!queryReferralCode || formData.referral_code) {
      referralHydratedRef.current = true;
      return;
    }

    // Only pre-fill when the URL code is actually valid format; skip otherwise
    // so the user doesn't land on a pre-filled field that immediately errors.
    if (!/^(ML-\d+|\d+)$/i.test(queryReferralCode)) {
      referralHydratedRef.current = true;
      return;
    }

    updateFormData({ referral_code: queryReferralCode });
    referralHydratedRef.current = true;
  }, [formData.referral_code, updateFormData]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  // When resuming, show the read-only status screen only after final approval.
  // Non-approved applications should continue in the onboarding wizard.
  const resumedApp = useApplication(applicationId);
  const lockedStage = useMemo(() => {
    const data = resumedApp.data as OnboardingApplication | undefined;
    const stage = data?.stage ?? (data?.status as string | undefined) ?? null;
    if (!stage) return null;
    if (!STATUS_LOCKED_STAGES.has(stage)) return null;
    return stage as MerchantStage;
  }, [resumedApp.data]);

  // Compute which steps are active for this session
  const activeStepIds = useMemo(
    () => getActiveSteps(formData.channel, formData.visit_outcome, formData.resume_inventory_handover),
    [formData.channel, formData.visit_outcome, formData.resume_inventory_handover],
  );

  const activeStepConfig: WizardStepConfig[] = useMemo(
    () =>
      activeStepIds
        .map((id) => WIZARD_STEP_CONFIG.find((s) => s.id === id))
        .filter((s): s is WizardStepConfig => s !== undefined),
    [activeStepIds],
  );

  const goNext = useCallback(() => {
    const idx = activeStepIds.indexOf(currentStep);
    if (idx < activeStepIds.length - 1) {
      setStep(activeStepIds[idx + 1]);
    }
  }, [activeStepIds, currentStep, setStep]);

  const goBack = useCallback(() => {
    const idx = activeStepIds.indexOf(currentStep);
    if (idx > 0) {
      setStep(activeStepIds[idx - 1]);
    }
  }, [activeStepIds, currentStep, setStep]);

  // Auto-save draft on step transition
  const saveAndAdvance = useCallback(
    (fromStep: WizardStepId) => {
      const advance = () => {
        completeStep(fromStep);
        goNext();
      };

      if (fromStep !== "identity" && !formData.channel) {
        pushToast({
          variant: "warning",
          title: "Complete identity first",
          description: "Select who is filling this form before saving other steps.",
        });
        setStep("identity");
        return;
      }

      // FE identity step happens before phone collection. Avoid creating a draft
      // too early, otherwise backend validation rejects it and blocks navigation.
      if (!applicationId && fromStep === "identity" && formData.channel === "field_executive") {
        advance();
        return;
      }

      // FE interested: completing bank is a mid-point submission for admin review.
      // The wizard will re-open after approval to continue with qr_activation.
      const isFeBank =
        fromStep === "bank" &&
        formData.channel === "field_executive" &&
        formData.visit_outcome === "interested";

      const payload = {
        current_step: fromStep,
        ...formData,
        stage: (isFeBank ? "submitted" : "in_progress") as MerchantStage,
      } as Record<string, unknown>;

      if (applicationId) {
        updateApp.mutate(
          { id: applicationId, data: payload as Partial<OnboardingApplication> },
          {
            onSuccess: () => {
              advance();
            },
            onError: (error) => {
              pushToast({
                variant: "error",
                title: "Could not save step",
                description: extractApiErrorMessage(error),
              });
            },
          },
        );
      } else {
        createApp.mutate(payload as Partial<OnboardingApplication>, {
          onSuccess: (res) => {
            if (res.data?.application_id) {
              useOnboardingStore.getState().setApplicationId(res.data.application_id);
            }
            advance();
          },
          onError: (error) => {
            pushToast({
              variant: "error",
              title: "Could not save step",
              description: extractApiErrorMessage(error),
            });
          },
        });
      }
    },
    [applicationId, completeStep, createApp, extractApiErrorMessage, formData, goNext, pushToast, setStep, updateApp],
  );

  const handleNext = useCallback(
    () => saveAndAdvance(currentStep),
    [currentStep, saveAndAdvance],
  );

  const renderStep = () => {
    switch (currentStep) {
      case "identity":
        return <StepIdentity onNext={handleNext} />;
      case "visit_outcome":
        return <StepVisitOutcome onNext={handleNext} onBack={goBack} />;
      case "basic_details":
        return <StepBasicDetails onNext={handleNext} onBack={goBack} />;
      case "commission":
        return <StepCommission onNext={handleNext} onBack={goBack} />;
      case "kyc":
        return <StepKyc onNext={handleNext} onBack={goBack} />;
      case "bank":
        return <StepBank onNext={handleNext} onBack={goBack} />;
      case "qr_activation":
        return <StepQrActivation onNext={handleNext} onBack={goBack} />;
      case "review":
        return <StepReview onBack={goBack} />;
      default:
        return <StepIdentity onNext={handleNext} />;
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const themeToggle = (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
      aria-label="Toggle dark and light mode"
      title="Toggle dark and light mode"
    >
      {!mounted ? "Theme" : resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );

  const shouldShowLockedStatus = Boolean(applicationId && lockedStage && !formData.resume_inventory_handover);

  if (shouldShowLockedStatus && applicationId) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">{themeToggle}</div>
        <ApplicationStatusScreen
          applicationId={applicationId}
          phone={formData.phone ?? null}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">{themeToggle}</div>
      <WizardShell
        currentStep={currentStep}
        completedSteps={completedSteps}
        stepConfig={activeStepConfig}
        onStepClick={setStep}
      >
        {renderStep()}
      </WizardShell>
    </div>
  );
}
