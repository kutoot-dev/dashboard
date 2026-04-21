"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  DEFAULT_COMMISSION_TIERS,
  ONBOARDING_STRINGS,
} from "@/lib/constants/onboarding";
import type { CommissionModel, CommissionTier } from "@/lib/types";
import { useMerchantCategories } from "@/lib/hooks";

interface StepCommissionProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepCommission({ onNext, onBack }: StepCommissionProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
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
  }, [selectedCategory]);

  const handleModelChange = (model: CommissionModel) => {
    if (model === "tiered" && !formData.commission_tiers?.length) {
      updateFormData({
        commission_model: model,
        commission_tiers: DEFAULT_COMMISSION_TIERS,
      });
    } else if (model === "flat") {
      updateFormData({
        commission_model: model,
        commission_rate:
          formData.commission_rate === null
            ? categoryMinCommission
            : Math.max(formData.commission_rate, categoryMinCommission),
      });
    } else {
      updateFormData({ commission_model: model });
    }
  };

  useEffect(() => {
    if (
      formData.commission_model === "flat" &&
      formData.commission_rate !== null &&
      formData.commission_rate < categoryMinCommission
    ) {
      updateFormData({ commission_rate: categoryMinCommission });
    }
  }, [
    categoryMinCommission,
    formData.commission_model,
    formData.commission_rate,
    updateFormData,
  ]);

  const handleRateChange = (value: string) => {
    const num = parseFloat(value);
    if (value === "" || value === ".") {
      updateFormData({ commission_rate: null });
      return;
    }
    if (!isNaN(num)) {
      const clamped = Math.min(
        VALIDATION_RULES.commission_rate.max,
        Math.max(categoryMinCommission, num),
      );
      updateFormData({ commission_rate: clamped });
    }
  };

  const updateTier = (
    index: number,
    field: keyof CommissionTier,
    value: string,
  ) => {
    const tiers = [...(formData.commission_tiers || [])];
    const num = value === "" ? null : parseFloat(value);
    tiers[index] = { ...tiers[index], [field]: num };
    updateFormData({ commission_tiers: tiers });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.commission_model) {
      e.commission_model = "Select a commission model.";
    }

    if (formData.commission_model === "flat") {
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
    }

    if (formData.commission_model === "tiered") {
      const tiers = formData.commission_tiers || [];
      for (let i = 0; i < tiers.length; i++) {
        if (
          tiers[i].rate_percent < categoryMinCommission
        ) {
          e[`tier_${i}`] =
            `Tier ${i + 1} rate cannot be less than ${categoryMinCommission.toFixed(2)}%`;
        }
      }
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

  // Format INR for display
  const fmtINR = (n: number | null) =>
    n === null ? "∞" : `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Commission Setup</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up the transaction commission terms. Minimum commission for your category is{" "}
          {categoryMinCommission.toFixed(2)}%.
        </p>
      </div>

      {/* Commission Model */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.commission_model}
        required
        error={errors.commission_model}
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleModelChange("flat")}
            className={`p-4 rounded-lg border text-left transition-all ${
              formData.commission_model === "flat"
                ? "border-accent bg-accent/5 ring-1 ring-accent"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="font-medium text-foreground">Flat Rate</div>
            <div className="text-xs text-muted-foreground mt-1">
              Same % on all transactions
            </div>
          </button>
          {/* <button
            type="button"
            onClick={() => handleModelChange("tiered")}
            className={`p-4 rounded-lg border text-left transition-all ${
              formData.commission_model === "tiered"
                ? "border-accent bg-accent/5 ring-1 ring-accent"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <div className="font-medium text-foreground">Tiered</div>
            <div className="text-xs text-muted-foreground mt-1">
              Different % for volume slabs
            </div>
          </button> */}
        </div>
      </FieldWithInfo>

      {/* Flat Rate Input */}
      {formData.commission_model === "flat" && (
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.commission_rate}
          required
          error={errors.commission_rate}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
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
                  value={formData.commission_rate?.toString() || ""}
                  onChange={(e) => handleRateChange(e.target.value)}
                  min={categoryMinCommission}
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
              onChange={(e) => handleRateChange(e.target.value)}
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

      {/* Tiered Rate Table */}
      {formData.commission_model === "tiered" && (
        <div className="space-y-3">
          <div className="text-sm font-medium text-foreground">
            Commission Slabs
          </div>
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-card text-muted-foreground">
                  <th className="px-3 py-2 text-left">From</th>
                  <th className="px-3 py-2 text-left">To</th>
                  <th className="px-3 py-2 text-left">Rate %</th>
                </tr>
              </thead>
              <tbody>
                {(formData.commission_tiers || []).map((tier, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2 text-foreground">
                      {fmtINR(tier.min_amount)}
                    </td>
                    <td className="px-3 py-2 text-foreground">
                      {fmtINR(tier.max_amount)}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={tier.rate_percent.toString()}
                          onChange={(e) =>
                            updateTier(i, "rate_percent", e.target.value)
                          }
                          min={categoryMinCommission}
                          max={15}
                          step={0.1}
                          className="w-20"
                        />
                        <span className="text-muted-foreground">%</span>
                      </div>
                      {errors[`tier_${i}`] && (
                        <p className="text-xs text-error mt-1">
                          {errors[`tier_${i}`]}
                        </p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            All tier rates must be at least {categoryMinCommission.toFixed(2)}%.
            Higher-volume tiers typically have lower rates.
          </p>
        </div>
      )}

      {/* Commission Agreement */}
      {formData.commission_model && (
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
