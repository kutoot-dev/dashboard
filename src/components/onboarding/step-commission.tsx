"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  ONBOARDING_STRINGS,
} from "@/lib/constants/onboarding";
import { useMerchantCategories } from "@/lib/hooks";

interface StepCommissionProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepCommission({ onNext, onBack }: StepCommissionProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [commissionInput, setCommissionInput] = useState(
    formData.commission_rate?.toString() || "",
  );
  const { categories } = useMerchantCategories();

  const selectedCategory = useMemo(
    () => categories.find((c) => String(c.id) === formData.sector_id),
    [categories, formData.sector_id],
  );
  const categoryMinCommission = useMemo(() => {
    const rawFromApplication = formData.minimum_commission_percentage;
    const raw =
      rawFromApplication != null
        ? rawFromApplication
        : selectedCategory?.minimum_commission_percentage;
    if (raw == null || Number.isNaN(Number(raw))) {
      return VALIDATION_RULES.commission_rate.min;
    }
    return Math.max(VALIDATION_RULES.commission_rate.min, Number(raw));
  }, [formData.minimum_commission_percentage, selectedCategory]);

  const handleModelChange = () =>
    updateFormData({
      commission_model: "flat",
      commission_rate:
        formData.commission_rate === null
          ? categoryMinCommission
          : Math.max(formData.commission_rate, categoryMinCommission),
    });

  useEffect(() => {
    setCommissionInput(formData.commission_rate?.toString() || "");
  }, [formData.commission_rate]);

  const handleRateInputChange = (value: string) => {
    setCommissionInput(value);

    const num = parseFloat(value);
    if (value === "" || value === ".") {
      updateFormData({ commission_rate: null });
      return;
    }

    if (!isNaN(num)) {
      const clamped = Math.min(VALIDATION_RULES.commission_rate.max, num);
      updateFormData({ commission_rate: clamped });
    }
  };

  const handleRateSliderChange = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      return;
    }

    const clamped = Math.min(
      VALIDATION_RULES.commission_rate.max,
      Math.max(categoryMinCommission, num),
    );
    setCommissionInput(clamped.toString());
    updateFormData({ commission_rate: clamped });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (
      formData.commission_rate === null ||
      formData.commission_rate < categoryMinCommission
    ) {
      e.commission_rate = `Commission rate must be at least ${categoryMinCommission.toFixed(2)}% for this category.`;
    } else if (
      formData.commission_rate > VALIDATION_RULES.commission_rate.max
    ) {
      e.commission_rate = ONBOARDING_STRINGS.COMMISSION_MAX_ERROR;
    }

    if (!formData.commission_agreed) {
      e.commission_agreed = "You must agree to the commission terms.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Commission Setup</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up the transaction commission terms. Minimum commission for your category is{" "}
          {categoryMinCommission.toFixed(2)}%.
        </p>
      </div>

      {/* Commission Model (fixed flat model) */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.commission_model}
        required
        error={errors.commission_model}
      >
        <div className="grid grid-cols-1 gap-3">
          <button
            type="button"
            onClick={handleModelChange}
            className={`p-4 rounded-lg border text-left transition-all ${
              true
                ? "border-accent bg-accent/5 ring-1 ring-accent"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="font-medium text-foreground">Flat Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              Same % on all transactions
            </div>
          </button>
        </div>
      </FieldWithInfo>

      {/* Flat Rate Input */}
      {(
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.commission_rate}
          required
          error={errors.commission_rate}
        >
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <p className="text-sm text-muted-foreground">
                Category minimum:{" "}
                <span className="font-medium text-foreground">
                  {categoryMinCommission.toFixed(2)}%
                </span>
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder={categoryMinCommission.toFixed(2)}
                  value={commissionInput}
                  onChange={(e) => handleRateInputChange(e.target.value)}
                  min={VALIDATION_RULES.commission_rate.min}
                  max={VALIDATION_RULES.commission_rate.max}
                  step={0.01}
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <input
              type="range"
              min={categoryMinCommission}
              max={VALIDATION_RULES.commission_rate.max}
              step={0.25}
              value={formData.commission_rate ?? categoryMinCommission}
              onChange={(e) => handleRateSliderChange(e.target.value)}
              className="w-full accent-accent"
              aria-label="Commission rate percentage"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{categoryMinCommission.toFixed(2)}%</span>
              <span>{VALIDATION_RULES.commission_rate.max.toFixed(2)}%</span>
            </div>
          </div>
          {formData.commission_rate !== null && formData.commission_rate > 0 && (
            <div className="mt-2 p-3 bg-card border border-border rounded-md">
              <p className="text-sm text-muted-foreground">
                On a ₹1,000 transaction:
              </p>
              <div className="flex justify-between mt-1">
                <span className="text-sm text-foreground">
                  Kutoot fee: ₹
                  {((1000 * formData.commission_rate) / 100).toFixed(2)}
                </span>
                <span className="text-sm text-success">
                  You receive: ₹
                  {(1000 - (1000 * formData.commission_rate) / 100).toFixed(2)}
                </span>
              </div>
            </div>
          )}
        </FieldWithInfo>
      )}

      {/* Commission Agreement */}
      {(
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.commission_agreed}
              onChange={(e) =>
                updateFormData({ commission_agreed: e.target.checked })
              }
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              {ONBOARDING_STRINGS.COMMISSION_AGREEMENT}
            </span>
          </label>
          {errors.commission_agreed && (
            <p className="text-xs text-error">{errors.commission_agreed}</p>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
