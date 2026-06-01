"use client";

import { MerchantBasicDetails } from "./merchant-basic-details";

interface StepBasicDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepBasicDetails({ onNext, onBack }: StepBasicDetailsProps) {
  return <MerchantBasicDetails onBack={onBack} onNext={onNext} />;
}
