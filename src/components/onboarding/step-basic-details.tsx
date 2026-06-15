"use client";

import { MerchantBasicDetails } from "./merchant-basic-details";

interface StepBasicDetailsProps {
  onNext?: () => void;
  onBack: () => void;
  isSaving?: boolean;
  mode?: "onboarding" | "panel";
  branchId?: string;
  onComplete?: () => void;
}

export function StepBasicDetails({
  onNext,
  onBack,
  isSaving,
  mode = "onboarding",
  branchId,
  onComplete,
}: StepBasicDetailsProps) {
  return (
    <MerchantBasicDetails
      mode={mode}
      branchId={branchId}
      onBack={onBack}
      onNext={onNext}
      isSaving={isSaving}
      onComplete={onComplete}
    />
  );
}
