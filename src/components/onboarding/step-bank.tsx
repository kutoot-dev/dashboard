"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
} from "@/lib/constants/onboarding";

interface StepBankProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepBank({ onNext, onBack }: StepBankProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const setFieldError = (field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  // IFSC auto-verification on blur
  const handleIfscBlur = () => {
    const ifsc = (formData.bank_ifsc ?? "").toUpperCase();
    if (!ifsc || !VALIDATION_RULES.bank_ifsc.pattern.test(ifsc)) return;

    // Mock bank name lookup from IFSC
    const bankMap: Record<string, { bank: string; branch: string }> = {
      SBIN: { bank: "State Bank of India", branch: ifsc },
      HDFC: { bank: "HDFC Bank", branch: ifsc },
      ICIC: { bank: "ICICI Bank", branch: ifsc },
      KKBK: { bank: "Kotak Mahindra Bank", branch: ifsc },
      UTIB: { bank: "Axis Bank", branch: ifsc },
      PUNB: { bank: "Punjab National Bank", branch: ifsc },
      BARB: { bank: "Bank of Baroda", branch: ifsc },
      CNRB: { bank: "Canara Bank", branch: ifsc },
    };
    const prefix = ifsc.substring(0, 4);
    const match = bankMap[prefix];
    if (match) {
      updateFormData({
        bank_name: match.bank,
        bank_branch_name: match.branch,
      });
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const accountName = formData.bank_account_name ?? "";
    const accountNumber = formData.bank_account_number ?? "";
    const accountConfirm = formData.bank_account_confirm ?? "";
    const ifsc = (formData.bank_ifsc ?? "").toUpperCase();

    if (!accountName.trim()) {
      e.bank_account_name = "Account holder name is required.";
    }
    if (!VALIDATION_RULES.bank_account_number.pattern.test(accountNumber)) {
      e.bank_account_number = "Enter a valid account number (9-18 digits).";
    }
    if (accountNumber !== accountConfirm) {
      e.bank_account_confirm = "Account numbers do not match.";
    }
    if (!VALIDATION_RULES.bank_ifsc.pattern.test(ifsc)) {
      e.bank_ifsc = "Enter a valid 11-character IFSC code.";
    }

    const upiId = (formData.upi_id ?? "").trim();
    if (upiId && !VALIDATION_RULES.upi_id.pattern.test(upiId)) {
      e.upi_id = "Enter a valid UPI ID (e.g. name@bank).";
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
        <h2 className="text-xl font-bold text-foreground">Bank Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter your bank account details for payout disbursement. A ₹1 test
          deposit will verify your account.
        </p>
      </div>

      {/* Account Holder Name */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.bank_account_name}
        required
        error={errors.bank_account_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.bank_account_name.placeholder}
          value={formData.bank_account_name}
          onChange={(e) => {
            const value = e.target.value;
            updateFormData({ bank_account_name: value });
            if (value.trim()) {
              clearFieldError("bank_account_name");
            } else {
              setFieldError("bank_account_name", "Account holder name is required.");
            }
          }}
          maxLength={100}
        />
      </FieldWithInfo>

      {/* Account Number */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.bank_account_number}
        required
        error={errors.bank_account_number}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.bank_account_number.placeholder}
          value={formData.bank_account_number}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 18);
            updateFormData({
              bank_account_number: value,
            });
            if (VALIDATION_RULES.bank_account_number.pattern.test(value)) {
              clearFieldError("bank_account_number");
            } else {
              setFieldError("bank_account_number", "Enter a valid account number (9-18 digits).");
            }

            if (formData.bank_account_confirm && value === formData.bank_account_confirm) {
              clearFieldError("bank_account_confirm");
            }
          }}
          maxLength={18}
          inputMode="numeric"
        />
      </FieldWithInfo>

      {/* Confirm Account Number */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.bank_account_confirm}
        required
        error={errors.bank_account_confirm}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.bank_account_confirm.placeholder}
          value={formData.bank_account_confirm}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "").slice(0, 18);
            updateFormData({
              bank_account_confirm: value,
            });
            if (value === (formData.bank_account_number ?? "")) {
              clearFieldError("bank_account_confirm");
            } else {
              setFieldError("bank_account_confirm", "Account numbers do not match.");
            }
          }}
          maxLength={18}
          inputMode="numeric"
        />
      </FieldWithInfo>

      {/* IFSC Code */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.bank_ifsc}
        required
        error={errors.bank_ifsc}
      >
        <div className="flex items-center gap-2">
          <Input
            placeholder={ONBOARDING_FIELDS.bank_ifsc.placeholder}
            value={formData.bank_ifsc}
            onChange={(e) => {
              const value = e.target.value.toUpperCase().slice(0, 11);
              updateFormData({
                bank_ifsc: value,
              });
              if (VALIDATION_RULES.bank_ifsc.pattern.test(value)) {
                clearFieldError("bank_ifsc");
              } else {
                setFieldError("bank_ifsc", "Enter a valid 11-character IFSC code.");
              }
            }}
            onBlur={handleIfscBlur}
            maxLength={11}
            className="uppercase"
          />
        </div>
        {formData.bank_name && (
          <p className="mt-1 text-xs text-muted-foreground">
            Bank: {formData.bank_name}
          </p>
        )}
      </FieldWithInfo>

      {/* UPI ID */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.upi_id}
        error={errors.upi_id}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.upi_id.placeholder}
          value={formData.upi_id}
          onChange={(e) => {
            const value = e.target.value.trim().toLowerCase();
            updateFormData({ upi_id: value });
            if (!value || VALIDATION_RULES.upi_id.pattern.test(value)) {
              clearFieldError("upi_id");
            } else {
              setFieldError("upi_id", "Enter a valid UPI ID (e.g. name@bank).");
            }
          }}
          maxLength={255}
          autoComplete="off"
        />
      </FieldWithInfo>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Preferred Settlement Method</label>
        <Select
          options={[
            { value: "instant", label: "Same Day Payment" },
            { value: "+1 days", label: "+1 days" },
            { value: "+2 days", label: "+2 days" },
          ]}
          value={formData.preferred_settlement_method ?? ""}
          onChange={(value) =>
            updateFormData({ preferred_settlement_method: value })
          }
          placeholder="Select method..."
        />
        {formData.preferred_settlement_method === "instant" && (
          <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:text-amber-300">
            1% charges applicable. Request time: 10:00 AM to 5:00 PM. Payment
            processing within 2 hours.
          </p>
        )}
      </div>

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
