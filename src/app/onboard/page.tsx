"use client";

import { useCallback } from "react";
import { WizardShell } from "@/components/onboarding/wizard-shell";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepBasicDetails } from "@/components/onboarding/step-basic-details";
import { StepCommission } from "@/components/onboarding/step-commission";
import { StepKyc } from "@/components/onboarding/step-kyc";
import { StepBank } from "@/components/onboarding/step-bank";
import { StepQrActivation } from "@/components/onboarding/step-qr-activation";
import { StepReview } from "@/components/onboarding/step-review";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useUpdateApplication, useCreateApplication } from "@/lib/hooks";
import type { WizardStepId, ApplicationStatus, OnboardingApplication } from "@/lib/types";

export default function OnboardPage() {
  const { currentStep, completedSteps, applicationId, completeStep, nextStep, prevStep, setStep, formData } =
    useOnboardingStore();
  const updateApp = useUpdateApplication();
  const createApp = useCreateApplication();

  // Auto-save draft on step transition
  const saveAndAdvance = useCallback(
    (fromStep: WizardStepId) => {
      completeStep(fromStep);

      // Build partial payload for draft save
      const payload = {
        current_step: fromStep,
        ...formData,
        status: "draft" as ApplicationStatus,
      } as Record<string, unknown>;

      if (applicationId) {
        updateApp.mutate(
          { id: applicationId, data: payload as Partial<OnboardingApplication> },
          { onSettled: () => nextStep() },
        );
      } else {
        // First save: create draft
        createApp.mutate(payload as Partial<OnboardingApplication>, {
          onSuccess: (res) => {
            if (res.data?.application_id) {
              useOnboardingStore.getState().setApplicationId(res.data.application_id);
            }
            nextStep();
          },
          onError: () => {
            // Proceed even if save fails — data is in memory
            nextStep();
          },
        });
      }
    },
    [applicationId, completeStep, createApp, formData, nextStep, updateApp],
  );

  const handleNext = useCallback(
    () => saveAndAdvance(currentStep),
    [currentStep, saveAndAdvance],
  );

  const renderStep = () => {
    switch (currentStep) {
      case "identity":
        return <StepIdentity onNext={handleNext} />;
      case "basic_details":
        return <StepBasicDetails onNext={handleNext} onBack={prevStep} />;
      case "commission":
        return <StepCommission onNext={handleNext} onBack={prevStep} />;
      case "kyc":
        return <StepKyc onNext={handleNext} onBack={prevStep} />;
      case "bank":
        return <StepBank onNext={handleNext} onBack={prevStep} />;
      case "qr_activation":
        return <StepQrActivation onNext={handleNext} onBack={prevStep} />;
      case "review":
        return <StepReview onBack={prevStep} />;
      default:
        return <StepIdentity onNext={handleNext} />;
    }
  };

  return (
    <div className="space-y-6">
      <WizardShell currentStep={currentStep} completedSteps={completedSteps} onStepClick={setStep}>
        {renderStep()}
      </WizardShell>
    </div>
  );
}
