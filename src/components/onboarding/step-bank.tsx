"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useVerifyBank } from "@/lib/hooks";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  ONBOARDING_STRINGS,
} from "@/lib/constants/onboarding";

interface StepBankProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepBank({ onNext, onBack }: StepBankProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const verifyBank = useVerifyBank();
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Trigger penny drop on both account + IFSC present
  useEffect(() => {
    const { bank_account_number, bank_ifsc, penny_drop_status } = formData;
    const accountNumber = bank_account_number ?? "";
    const ifsc = (bank_ifsc ?? "").toUpperCase();
    if (
      accountNumber.length >= 9 &&
      VALIDATION_RULES.bank_ifsc.pattern.test(ifsc) &&
      penny_drop_status === "not_started"
    ) {
      updateFormData({ penny_drop_status: "pending", bank_status: "pending" });
      verifyBank.mutate(
        {
          accountNumber,
          ifsc,
        },
        {
          onSuccess: (res) => {
            const d = res.data;
            updateFormData({
              bank_status: d.valid ? "verified" : "failed",
              penny_drop_status: d.penny_drop_status || "completed",
              bank_name: d.bank_name || formData.bank_name,
              bank_branch_name: d.branch_name || formData.bank_branch_name,
            });
          },
          onError: () => {
            // Non-blocking
            updateFormData({ bank_status: "api_error", penny_drop_status: "api_error" });
          },
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bank_account_number, formData.bank_ifsc]);

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      not_started: { label: "", cls: "" },
      pending: { label: "Verifying...", cls: "text-info" },
      verified: { label: "✓ Verified", cls: "text-success" },
      completed: { label: "✓ Penny drop done", cls: "text-success" },
      failed: { label: "✗ Failed", cls: "text-error" },
      api_error: { label: "⚠ Will verify later", cls: "text-warning" },
    };
    const m = map[status] || map.not_started;
    if (!m.label) return null;
    return <span className={`text-xs font-medium ${m.cls}`}>{m.label}</span>;
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

      {/* Bank verification failure notice */}
      {formData.bank_status === "api_error" && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning">{ONBOARDING_STRINGS.API_FAIL_BANK}</p>
        </div>
      )}

      {/* Account Holder Name */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.bank_account_name}
        required
        error={errors.bank_account_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.bank_account_name.placeholder}
          value={formData.bank_account_name}
          onChange={(e) => updateFormData({ bank_account_name: e.target.value })}
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
          onChange={(e) =>
            updateFormData({
              bank_account_number: e.target.value.replace(/\D/g, "").slice(0, 18),
            })
          }
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
          onChange={(e) =>
            updateFormData({
              bank_account_confirm: e.target.value.replace(/\D/g, "").slice(0, 18),
            })
          }
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
            onChange={(e) =>
              updateFormData({
                bank_ifsc: e.target.value.toUpperCase().slice(0, 11),
              })
            }
            onBlur={handleIfscBlur}
            maxLength={11}
            className="uppercase"
          />
          {statusBadge(formData.bank_status)}
        </div>
        {formData.bank_name && (
          <p className="mt-1 text-xs text-muted-foreground">
            Bank: {formData.bank_name}
          </p>
        )}
      </FieldWithInfo>

      {/* Penny drop status */}
      {/* {formData.penny_drop_status !== "not_started" && (
        <div className="p-3 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">
              Penny Drop Verification
            </span>
            {statusBadge(formData.penny_drop_status)}
          </div>
          {formData.penny_drop_status === "pending" && (
            <p className="text-xs text-muted-foreground mt-1">
              Sending ₹1 to verify your account...
            </p>
          )}
        </div>
      )} */}

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
