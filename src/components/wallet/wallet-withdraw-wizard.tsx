"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VALIDATION_RULES } from "@/lib/constants/onboarding";
import {
  checkWithdraw,
  submitWithdraw,
} from "@/lib/api/services/wallet.service";
import type {
  WithdrawCheckResult,
  WithdrawPayoutInput,
} from "@/lib/types/wallet";
import { formatINR } from "@/lib/utils/format";

interface WalletWithdrawWizardProps {
  merchantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = "form" | "review" | "done";

const emptyForm: WithdrawPayoutInput = {
  bank_account_name: "",
  bank_name: "",
  bank_branch_name: "",
  account_number: "",
  ifsc_code: "",
  pan_number: "",
  aadhaar_number: "",
};

export function WalletWithdrawWizard({
  merchantId,
  isOpen,
  onClose,
  onSuccess,
}: WalletWithdrawWizardProps) {
  const [step, setStep] = useState<Step>("form");
  const [form, setForm] = useState<WithdrawPayoutInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkResult, setCheckResult] = useState<WithdrawCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const reset = () => {
    setStep("form");
    setForm(emptyForm);
    setErrors({});
    setCheckResult(null);
    setSubmitError(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.bank_account_name.trim()) {
      e.bank_account_name = "Account holder name is required.";
    }
    if (!VALIDATION_RULES.bank_account_number.pattern.test(form.account_number)) {
      e.account_number = "Enter a valid account number (9–18 digits).";
    }
    const ifsc = form.ifsc_code.toUpperCase();
    if (!VALIDATION_RULES.bank_ifsc.pattern.test(ifsc)) {
      e.ifsc_code = "Enter a valid IFSC code.";
    }
    const pan = form.pan_number.toUpperCase();
    if (!VALIDATION_RULES.pan_number.pattern.test(pan)) {
      e.pan_number = "Enter a valid PAN.";
    }
    if (!VALIDATION_RULES.aadhaar_number.pattern.test(form.aadhaar_number)) {
      e.aadhaar_number = "Enter a valid 12-digit Aadhaar number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = (): WithdrawPayoutInput => ({
    ...form,
    ifsc_code: form.ifsc_code.toUpperCase(),
    pan_number: form.pan_number.toUpperCase(),
  });

  const handleCheck = async () => {
    if (!validate()) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await checkWithdraw(merchantId, payload());
      if (!res.success || !res.data) {
        setSubmitError(res.message ?? "Could not verify withdrawal eligibility.");
        return;
      }
      setCheckResult(res.data);
      setStep("review");
    } catch {
      setSubmitError("Could not verify withdrawal eligibility. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkResult?.can_submit) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await submitWithdraw(merchantId, payload());
      if (!res.success) {
        setSubmitError(res.message ?? "Withdrawal could not be submitted.");
        return;
      }
      setStep("done");
      onSuccess();
    } catch {
      setSubmitError("Withdrawal could not be submitted. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const eligibility = checkResult?.eligibility;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === "form"
          ? "Withdraw funds"
          : step === "review"
            ? "Confirm withdrawal"
            : "Request submitted"
      }
    >
      {step === "form" ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Enter your bank and identity details for payout. Referral requirements are
            checked after you submit this form.
          </p>
          <Input
            label="Account holder name"
            value={form.bank_account_name}
            onChange={(e) =>
              setForm((f) => ({ ...f, bank_account_name: e.target.value }))
            }
          />
          {errors.bank_account_name ? (
            <p className="text-xs text-loss -mt-2">{errors.bank_account_name}</p>
          ) : null}
          <Input
            label="Bank name"
            value={form.bank_name ?? ""}
            onChange={(e) => setForm((f) => ({ ...f, bank_name: e.target.value }))}
          />
          <Input
            label="Branch"
            value={form.bank_branch_name ?? ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, bank_branch_name: e.target.value }))
            }
          />
          <Input
            label="Account number"
            value={form.account_number}
            onChange={(e) =>
              setForm((f) => ({ ...f, account_number: e.target.value }))
            }
          />
          {errors.account_number ? (
            <p className="text-xs text-loss -mt-2">{errors.account_number}</p>
          ) : null}
          <Input
            label="IFSC"
            value={form.ifsc_code}
            onChange={(e) =>
              setForm((f) => ({ ...f, ifsc_code: e.target.value.toUpperCase() }))
            }
          />
          {errors.ifsc_code ? (
            <p className="text-xs text-loss -mt-2">{errors.ifsc_code}</p>
          ) : null}
          <Input
            label="PAN"
            value={form.pan_number}
            onChange={(e) =>
              setForm((f) => ({ ...f, pan_number: e.target.value.toUpperCase() }))
            }
          />
          {errors.pan_number ? (
            <p className="text-xs text-loss -mt-2">{errors.pan_number}</p>
          ) : null}
          <Input
            label="Aadhaar"
            value={form.aadhaar_number}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12),
              }))
            }
          />
          {errors.aadhaar_number ? (
            <p className="text-xs text-loss -mt-2">{errors.aadhaar_number}</p>
          ) : null}
          {submitError ? (
            <p className="text-sm text-loss">{submitError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCheck} disabled={loading}>
              {loading ? "Checking…" : "Continue"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === "review" && eligibility ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Available: {formatINR(checkResult?.available_balance ?? 0)}
          </p>
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">KYC complete</span>
              <Badge variant={eligibility.kyc_complete ? "gain" : "loss"}>
                {eligibility.kyc_complete ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Customer referrals</span>
              <Badge
                variant={
                  eligibility.customer_referrals.met ? "gain" : "neutral"
                }
              >
                {eligibility.customer_referrals.current} /{" "}
                {eligibility.customer_referrals.target}
                {eligibility.customer_referrals.met ? " — Target reached" : ""}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Store referrals</span>
              <Badge variant={eligibility.store_referrals.met ? "gain" : "neutral"}>
                {eligibility.store_referrals.current} /{" "}
                {eligibility.store_referrals.target}
                {eligibility.store_referrals.met ? " — Target reached" : ""}
              </Badge>
            </div>
          </div>
          {!eligibility.eligible && eligibility.blocking_reasons.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-loss space-y-1">
              {eligibility.blocking_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
          {submitError ? (
            <p className="text-sm text-loss">{submitError}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setStep("form")}>
              Back
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !checkResult?.can_submit}
            >
              {loading ? "Submitting…" : "Submit withdrawal request"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === "done" ? (
        <div className="space-y-4">
          <p className="text-sm text-foreground">
            Your withdrawal request has been submitted. Our team will transfer the
            amount and mark it as paid once complete.
          </p>
          <div className="flex justify-end">
            <Button type="button" onClick={handleClose}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
