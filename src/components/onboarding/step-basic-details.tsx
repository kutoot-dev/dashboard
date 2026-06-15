"use client";

import { MerchantBasicDetails } from "./merchant-basic-details";

interface StepBasicDetailsProps {
  onNext: () => void;
  onBack: () => void;
  isSaving?: boolean;
}

export function StepBasicDetails({ onNext, onBack, isSaving }: StepBasicDetailsProps) {
  return <MerchantBasicDetails onBack={onBack} onNext={onNext} isSaving={isSaving} />;
}
