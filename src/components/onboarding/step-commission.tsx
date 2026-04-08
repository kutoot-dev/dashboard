"use client";

import { useState } from "react";
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

interface StepCommissionProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepCommission({ onNext, onBack }: StepCommissionProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleModelChange = (model: CommissionModel) => {
    if (model === "tiered" && !formData.commission_tiers?.length) {
      updateFormData({
        commission_model: model,
        commission_tiers: DEFAULT_COMMISSION_TIERS,
      });
    } else {
      updateFormData({ commission_model: model });
    }
  };

  const handleRateChange = (value: string) => {
    const num = parseFloat(value);
    if (value === "" || value === ".") {
      updateFormData({ commission_rate: null });
      return;
    }
    if (!isNaN(num)) {
      updateFormData({ commission_rate: num });
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
        formData.commission_rate < VALIDATION_RULES.commission_rate.min
      ) {
        e.commission_rate = ONBOARDING_STRINGS.COMMISSION_MIN_ERROR;
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
          tiers[i].rate_percent < VALIDATION_RULES.commission_rate.min
        ) {
          e[`tier_${i}`] =
            `Tier ${i + 1} rate cannot be less than ${VALIDATION_RULES.commission_rate.min}%`;
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
          Set up the transaction commission terms. Minimum commission rate is 2%.
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
          <button
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
          </button>
        </div>
      </FieldWithInfo>

      {/* Flat Rate Input */}
      {formData.commission_model === "flat" && (
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.commission_rate}
          required
          error={errors.commission_rate}
        >
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="2.00"
              value={formData.commission_rate?.toString() || ""}
              onChange={(e) => handleRateChange(e.target.value)}
              min={2}
              max={15}
              step={0.1}
              className="w-32"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          {formData.commission_rate !== null && formData.commission_rate >= 2 && (
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
                          min={2}
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
            All tier rates must be at least {VALIDATION_RULES.commission_rate.min}%.
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
