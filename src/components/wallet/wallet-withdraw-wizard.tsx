"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PhotoCapture } from "@/components/onboarding/photo-capture";
import { VALIDATION_RULES } from "@/lib/constants/onboarding";
import {
  getPayoutDetails,
  getWithdrawEligibility,
  savePayoutDetails,
  submitWithdraw,
} from "@/lib/api/services/wallet.service";
import type {
  WithdrawCheckResult,
  WithdrawPayoutInput,
} from "@/lib/types/wallet";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface WalletWithdrawWizardProps {
  merchantId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type WizardStep = "bank" | "identity" | "documents" | "review" | "done";
type GstPath = "gst" | "enrollment";

const emptyForm: WithdrawPayoutInput = {
  bank_account_name: "",
  bank_name: "",
  bank_branch_name: "",
  account_number: "",
  ifsc_code: "",
  pan_number: "",
  aadhaar_number: "",
  gst_number: "",
  gst_enrollment_number: "",
  gst_doc_photo_url: null,
  pan_doc_photo_url: null,
  aadhaar_doc_photo_url: null,
};

const STEP_TITLES: Record<WizardStep, string> = {
  bank: "Bank details",
  identity: "Identity details",
  documents: "Upload documents",
  review: "Confirm withdrawal",
  done: "Request submitted",
};

const GST_PORTAL_URL = "https://www.gst.gov.in/";
const KUTOOT_SUPPORT_EMAIL = "support@kutoot.com";

const KYC_MISSING_LABELS: Record<string, string> = {
  gst_or_enrollment: "GST number or GST enrollment number",
  gst_verification: "GST verification",
  gst_document: "GST or enrollment certificate",
  pan_number: "PAN number",
  pan_verification: "PAN verification",
  pan_document: "PAN card photo",
  aadhaar_number: "Aadhaar number",
  aadhaar_document: "Aadhaar card photo",
  bank_details: "Bank account details",
  bank_verification: "Bank verification",
};

function GstEnrollmentHelpPanel() {
  return (
    <div className="rounded-lg border border-info/30 bg-info/5 p-4 text-sm">
      <h3 className="font-semibold text-foreground">Generate enrollment number</h3>
      <p className="mt-1 text-muted-foreground">
        If you are a non-GST seller, generate an enrollment number from the GST portal
        before completing withdrawal on Kutoot. Follow these steps:
      </p>
      <ol className="mt-3 list-decimal space-y-2 pl-4 text-foreground">
        <li>
          <span className="font-medium">Access the GST portal</span> — Go to{" "}
          <a
            href={GST_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:text-primary/80"
          >
            gst.gov.in
          </a>
          .
        </li>
        <li>
          <span className="font-medium">Navigate to Services</span> — From the top menu,
          select <span className="text-foreground">Services → User Services</span>.
        </li>
        <li>
          <span className="font-medium">Generate user ID</span> — Click{" "}
          <span className="text-foreground">Generate User ID for Unregistered Applicant</span>.
        </li>
        <li>
          <span className="font-medium">Choose e-commerce option</span> — For “Are you
          applying to enroll as a supplier through E-Commerce Operators?”, select{" "}
          <span className="text-foreground">
            To Apply as a Supplier to e-Commerce Operators
          </span>{" "}
          to proceed.
        </li>
        <li>
          <span className="font-medium">Fill mandatory details</span> — Seller name, PAN,
          email, mobile, state of operation, complete address, HSN code, and captcha.
        </li>
        <li>
          <span className="font-medium">Verify with OTP</span> — Enter the OTP sent to your
          registered mobile and email.
        </li>
        <li>
          <span className="font-medium">Get your enrollment number</span> — After
          verification, your enrollment number is generated on the GSTN portal. Enter it
          below and upload the enrollment certificate in the next step.
        </li>
      </ol>
      <p className="mt-3 text-muted-foreground">
        Questions?{" "}
        <a
          href={`mailto:${KUTOOT_SUPPORT_EMAIL}?subject=GST%20enrollment%20help`}
          className="text-primary underline underline-offset-2 hover:text-primary/80"
        >
          {KUTOOT_SUPPORT_EMAIL}
        </a>
      </p>
    </div>
  );
}

export function WalletWithdrawWizard({
  merchantId,
  isOpen,
  onClose,
  onSuccess,
}: WalletWithdrawWizardProps) {
  const [step, setStep] = useState<WizardStep>("bank");
  const [gstPath, setGstPath] = useState<GstPath>("gst");
  const [form, setForm] = useState<WithdrawPayoutInput>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkResult, setCheckResult] = useState<WithdrawCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const reset = () => {
    setStep("bank");
    setGstPath("gst");
    setForm(emptyForm);
    setErrors({});
    setCheckResult(null);
    setSubmitError(null);
    setSaveSuccess(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const applyPayoutToForm = useCallback(
    (payout: WithdrawPayoutInput, path: GstPath) => {
      setGstPath(path);
      setForm({
        bank_account_name: payout.bank_account_name ?? "",
        bank_name: payout.bank_name ?? "",
        bank_branch_name: payout.bank_branch_name ?? "",
        account_number: payout.account_number ?? "",
        ifsc_code: payout.ifsc_code ?? "",
        pan_number: payout.pan_number ?? "",
        aadhaar_number: payout.aadhaar_number ?? "",
        gst_number: payout.gst_number ?? "",
        gst_enrollment_number: payout.gst_enrollment_number ?? "",
        gst_doc_photo_url: payout.gst_doc_photo_url ?? null,
        pan_doc_photo_url: payout.pan_doc_photo_url ?? null,
        aadhaar_doc_photo_url: payout.aadhaar_doc_photo_url ?? null,
      });
    },
    [],
  );

  const loadSavedState = useCallback(async () => {
    setInitialLoading(true);
    setSubmitError(null);
    try {
      const detailsRes = await getPayoutDetails(merchantId);
      if (detailsRes.success && detailsRes.data) {
        const { payout, payout_kyc_saved, gst_path } = detailsRes.data;
        applyPayoutToForm(payout, gst_path);

        if (payout_kyc_saved) {
          const eligRes = await getWithdrawEligibility(merchantId);
          if (eligRes.success && eligRes.data) {
            setCheckResult(eligRes.data);
            setStep("review");
            return;
          }
        }
      }
      setStep("bank");
    } catch {
      setStep("bank");
    } finally {
      setInitialLoading(false);
    }
  }, [merchantId, applyPayoutToForm]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    void loadSavedState();
  }, [isOpen, loadSavedState]);

  const selectGstPath = (path: GstPath) => {
    setGstPath(path);
    setForm((f) => ({
      ...f,
      gst_number: path === "gst" ? f.gst_number : "",
      gst_enrollment_number: path === "enrollment" ? f.gst_enrollment_number : "",
    }));
    setErrors((e) => {
      const next = { ...e };
      delete next.gst_number;
      delete next.gst_enrollment_number;
      delete next.gst_doc_photo;
      return next;
    });
  };

  const validateBank = (): boolean => {
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
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateIdentity = (): boolean => {
    const e: Record<string, string> = {};
    const pan = form.pan_number.toUpperCase();
    if (!VALIDATION_RULES.pan_number.pattern.test(pan)) {
      e.pan_number = "Enter a valid PAN.";
    }
    if (!VALIDATION_RULES.aadhaar_number.pattern.test(form.aadhaar_number)) {
      e.aadhaar_number = "Enter a valid 12-digit Aadhaar number.";
    }

    if (gstPath === "gst") {
      const gst = (form.gst_number ?? "").trim().toUpperCase();
      if (!gst) {
        e.gst_number = "GST number is required.";
      } else if (!VALIDATION_RULES.gst_number.pattern.test(gst)) {
        e.gst_number = "Enter a valid 15-character GSTIN.";
      }
    } else {
      const enrollment = (form.gst_enrollment_number ?? "").trim().toUpperCase();
      if (!enrollment) {
        e.gst_enrollment_number = "GST enrollment number is required.";
      } else if (!/^[A-Z0-9]{8,20}$/.test(enrollment)) {
        e.gst_enrollment_number =
          "Enter a valid enrollment number (8–20 characters).";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateDocuments = (): boolean => {
    const e: Record<string, string> = {};

    if (!form.pan_doc_photo_url) {
      e.pan_doc_photo = "PAN card photo is required.";
    }
    if (!form.aadhaar_doc_photo_url) {
      e.aadhaar_doc_photo = "Aadhaar card photo is required.";
    }
    if (!form.gst_doc_photo_url) {
      e.gst_doc_photo =
        gstPath === "gst"
          ? "GST certificate photo is required."
          : "GST enrollment certificate photo is required.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = (): WithdrawPayoutInput => ({
    ...form,
    ifsc_code: form.ifsc_code.toUpperCase(),
    pan_number: form.pan_number.toUpperCase(),
    gst_number:
      gstPath === "gst" && form.gst_number?.trim()
        ? form.gst_number.toUpperCase()
        : undefined,
    gst_enrollment_number:
      gstPath === "enrollment" && form.gst_enrollment_number?.trim()
        ? form.gst_enrollment_number.toUpperCase()
        : undefined,
    gst_doc_photo_url: form.gst_doc_photo_url || undefined,
    pan_doc_photo_url: form.pan_doc_photo_url || undefined,
    aadhaar_doc_photo_url: form.aadhaar_doc_photo_url || undefined,
  });

  const persistPayoutDetails = async (): Promise<boolean> => {
    setLoading(true);
    setSubmitError(null);
    setSaveSuccess(null);
    try {
      const res = await savePayoutDetails(merchantId, payload());
      if (!res.success || !res.data) {
        setSubmitError(res.error?.message ?? "Could not save your details.");
        return false;
      }
      setCheckResult(res.data);
      return true;
    } catch {
      setSubmitError("Could not save your details. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!validateDocuments()) return;
    const saved = await persistPayoutDetails();
    if (saved) {
      setStep("review");
    }
  };

  const handleSaveAndClose = async () => {
    if (!validateDocuments()) return;
    const saved = await persistPayoutDetails();
    if (saved) {
      setSaveSuccess(
        "Your bank and KYC details are saved. Return here to submit a withdrawal when referral targets are met.",
      );
      onSuccess();
      setTimeout(() => {
        handleClose();
      }, 1500);
    }
  };

  const handleSubmit = async () => {
    if (!checkResult?.can_submit) return;
    setLoading(true);
    setSubmitError(null);
    try {
      const res = await submitWithdraw(merchantId, { useSavedPayout: true });
      if (!res.success) {
        setSubmitError(res.error?.message ?? "Withdrawal could not be submitted.");
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

  const stepNumber =
    step === "bank" ? 1 : step === "identity" ? 2 : step === "documents" ? 3 : 4;

  const stepFooter = (buttons: React.ReactNode) => (
    <div className="sticky bottom-0 -mx-1 mt-4 border-t border-border/60 bg-card/95 pt-4 backdrop-blur-sm">
      {buttons}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={STEP_TITLES[step]}
      scrollable
      maxWidthClass="max-w-lg"
    >
      {initialLoading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Loading…</p>
      ) : null}

      {!initialLoading && step !== "done" && step !== "review" ? (
        <p className="mb-4 text-xs text-muted-foreground">Step {stepNumber} of 4</p>
      ) : null}

      {!initialLoading && step === "bank" ? (
        <div className="space-y-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Enter your bank account details for payout.
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
          {stepFooter(
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (validateBank()) setStep("identity");
                }}
              >
                Continue
              </Button>
            </div>,
          )}
        </div>
      ) : null}

      {!initialLoading && step === "identity" ? (
        <div className="space-y-4 pb-2">
          <p className="text-sm text-muted-foreground">
            PAN and Aadhaar are required. Provide either a GST number or a GST
            enrollment number if you are not GST registered.
          </p>
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

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">GST status</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => selectGstPath("gst")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  gstPath === "gst"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border/80",
                )}
              >
                I have GST
              </button>
              <button
                type="button"
                onClick={() => selectGstPath("enrollment")}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm transition-colors",
                  gstPath === "enrollment"
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:border-border/80",
                )}
              >
                No GST (enrollment)
              </button>
            </div>
          </div>

          {gstPath === "gst" ? (
            <Input
              label="GST number"
              value={form.gst_number ?? ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  gst_number: e.target.value.toUpperCase().slice(0, 15),
                }))
              }
            />
          ) : (
            <>
              <GstEnrollmentHelpPanel />
              <Input
                label="GST enrollment number"
                value={form.gst_enrollment_number ?? ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    gst_enrollment_number: e.target.value
                      .toUpperCase()
                      .slice(0, 20),
                  }))
                }
              />
            </>
          )}
          {errors.gst_number ? (
            <p className="text-xs text-loss -mt-2">{errors.gst_number}</p>
          ) : null}
          {errors.gst_enrollment_number ? (
            <p className="text-xs text-loss -mt-2">{errors.gst_enrollment_number}</p>
          ) : null}

          {stepFooter(
            <div className="flex justify-between gap-2">
              <Button type="button" variant="secondary" onClick={() => setStep("bank")}>
                Back
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (validateIdentity()) setStep("documents");
                }}
              >
                Continue
              </Button>
            </div>,
          )}
        </div>
      ) : null}

      {!initialLoading && step === "documents" ? (
        <div className="space-y-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Upload clear photos of all required documents. They are saved to your
            store profile. You can close and submit the withdrawal later once
            referral targets are met.
          </p>
          <PhotoCapture
            label="PAN card photo"
            value={form.pan_doc_photo_url ?? null}
            onChange={(url) => setForm((f) => ({ ...f, pan_doc_photo_url: url }))}
            required
            error={errors.pan_doc_photo}
            hint="Required. Front side of PAN card, all text legible."
          />
          <PhotoCapture
            label="Aadhaar card photo"
            value={form.aadhaar_doc_photo_url ?? null}
            onChange={(url) =>
              setForm((f) => ({ ...f, aadhaar_doc_photo_url: url }))
            }
            required
            error={errors.aadhaar_doc_photo}
            hint="Required. Front side of Aadhaar card."
          />
          {gstPath === "enrollment" ? <GstEnrollmentHelpPanel /> : null}
          <PhotoCapture
            label={
              gstPath === "gst"
                ? "GST certificate photo"
                : "GST enrollment certificate photo"
            }
            value={form.gst_doc_photo_url ?? null}
            onChange={(url) => setForm((f) => ({ ...f, gst_doc_photo_url: url }))}
            required
            error={errors.gst_doc_photo}
            hint={
              gstPath === "gst"
                ? "Required. GST registration certificate or official printout."
                : "Required. Official GST enrollment letter or certificate from the portal."
            }
          />
          {submitError ? <p className="text-sm text-loss">{submitError}</p> : null}
          {saveSuccess ? (
            <p className="text-sm text-success">{saveSuccess}</p>
          ) : null}
          {stepFooter(
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("identity")}
              >
                Back
              </Button>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSaveAndClose}
                  disabled={loading}
                >
                  {loading ? "Saving…" : "Save & close"}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveAndContinue}
                  disabled={loading}
                >
                  {loading ? "Saving…" : "Save & continue"}
                </Button>
              </div>
            </div>,
          )}
        </div>
      ) : null}

      {!initialLoading && step === "review" && eligibility ? (
        <div className="space-y-4 pb-2">
          <p className="text-sm text-muted-foreground">
            Your bank and KYC details are saved on Kutoot. Available balance:{" "}
            {formatINR(checkResult?.available_balance ?? 0)}
          </p>
          {!checkResult?.can_submit ? (
            <p className="text-sm text-muted-foreground">
              You can close this window and return later to submit your withdrawal
              when targets are reached.
            </p>
          ) : null}
          <div className="rounded-lg border border-border/70 bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">KYC complete</span>
              <Badge variant={eligibility.kyc_complete ? "gain" : "loss"}>
                {eligibility.kyc_complete ? "Yes" : "No"}
              </Badge>
            </div>
            {!eligibility.kyc_complete && eligibility.kyc_missing.length > 0 ? (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Still needed:</p>
                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                  {eligibility.kyc_missing.map((key) => (
                    <li key={key}>{KYC_MISSING_LABELS[key] ?? key}</li>
                  ))}
                </ul>
                <p className="mt-2">
                  If you already saved everything, tap{" "}
                  <span className="font-medium text-foreground">Edit details</span>{" "}
                  and save again to refresh verification status.
                </p>
              </div>
            ) : null}
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
          {!checkResult?.can_submit ? (
            <p className="text-sm text-warning">
              You cannot submit a withdrawal request until referral targets are
              reached and all requirements are met.
            </p>
          ) : null}
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
          {stepFooter(
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep("documents")}
              >
                Edit details
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !checkResult?.can_submit}
              >
                {loading ? "Submitting…" : "Submit withdrawal request"}
              </Button>
            </div>,
          )}
        </div>
      ) : null}

      {!initialLoading && step === "done" ? (
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
