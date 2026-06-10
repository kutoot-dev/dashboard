"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DiscountProgramFields,
  serializeDiscountProgramPayload,
  toDiscountProgramFormState,
} from "@/components/discount-program/discount-program-fields";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";

interface StepDiscountProgramProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepDiscountProgram({ onNext, onBack }: StepDiscountProgramProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const programState = useMemo(
    () => toDiscountProgramFormState(formData),
    [formData],
  );

  const policyCap =
    typeof formData.policy_max_discount_percentage === "number"
      ? formData.policy_max_discount_percentage
      : null;

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (programState.discount_program_enabled) {
      const hasActiveBand = programState.discount_bands.some((band) => band.is_active);
      if (!hasActiveBand) {
        nextErrors.discount_bands = "Add at least one active discount band.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;

    updateFormData(serializeDiscountProgramPayload(programState));
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Discount program</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure bill-pay discounts funded by your store. You can change these later from the merchant panel.
        </p>
      </div>

      <DiscountProgramFields
        value={programState}
        onChange={(next) => updateFormData(serializeDiscountProgramPayload(next))}
        policyCap={policyCap}
        compact
      />

      {errors.discount_bands && (
        <p className="text-sm text-loss">{errors.discount_bands}</p>
      )}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
