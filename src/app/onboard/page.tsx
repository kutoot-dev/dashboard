"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepVisitOutcome } from "@/components/onboarding/step-visit-outcome";
import { StepBasicDetails } from "@/components/onboarding/step-basic-details";
import { StepCommission } from "@/components/onboarding/step-commission";
import { StepKyc } from "@/components/onboarding/step-kyc";
import { StepBank } from "@/components/onboarding/step-bank";
import { StepQrActivation } from "@/components/onboarding/step-qr-activation";
import { StepReview } from "@/components/onboarding/step-review";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useUpdateApplication, useCreateApplication } from "@/lib/hooks";
import { WIZARD_STEP_CONFIG } from "@/lib/types";
import type { WizardStepId, ApplicationStatus, OnboardingApplication, WizardStepConfig } from "@/lib/types";

// ── Compute active steps based on channel + visit outcome ─────────

function getActiveSteps(
  channel: string | null,
  visitOutcome: string | null,
): WizardStepId[] {
  if (channel === "merchant") {
    // Merchant self-onboarding: no visit_outcome step, no QR step
    return ["identity", "basic_details", "commission", "kyc", "bank", "review"];
  }
  if (channel === "field_executive") {
    if (visitOutcome === "interested") {
      // Full field-executive onboarding flow (with QR)
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

export default function OnboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    currentStep,
    completedSteps,
    applicationId,
    completeStep,
    setStep,
    formData,
  } = useOnboardingStore();
  const updateApp = useUpdateApplication();
  const createApp = useCreateApplication();

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (!applicationId && mode !== "new" && mode !== "resume") {
      router.replace("/onboard/start");
    }
  }, [applicationId, router, searchParams]);

  // Compute which steps are active for this session
  const activeStepIds = useMemo(
    () => getActiveSteps(formData.channel, formData.visit_outcome),
    [formData.channel, formData.visit_outcome],
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
      completeStep(fromStep);

      const payload = {
        current_step: fromStep,
        ...formData,
        status: "draft" as ApplicationStatus,
      } as Record<string, unknown>;

      if (applicationId) {
        updateApp.mutate(
          { id: applicationId, data: payload as Partial<OnboardingApplication> },
          { onSettled: () => goNext() },
        );
      } else {
        createApp.mutate(payload as Partial<OnboardingApplication>, {
          onSuccess: (res) => {
            if (res.data?.application_id) {
              useOnboardingStore.getState().setApplicationId(res.data.application_id);
            }
            goNext();
          },
          onError: () => {
            goNext();
          },
        });
      }
    },
    [applicationId, completeStep, createApp, formData, goNext, updateApp],
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

  return (
    <div className="space-y-6">
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
