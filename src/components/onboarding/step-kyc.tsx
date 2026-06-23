"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useVerifyGst, useVerifyPan } from "@/lib/hooks";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  ONBOARDING_STRINGS,
  normalizeKycReviewStatus,
} from "@/lib/constants/onboarding";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils/cn";

interface StepKycProps {
  onNext: () => void;
  onBack: () => void;
}

type GstPath = "none" | "gst" | "enrollment";

function inferGstPath(formData: {
  gst_number?: string | null;
  gst_enrollment_number?: string | null;
}): GstPath {
  if (formData.gst_enrollment_number?.trim()) {
    return "enrollment";
  }
  if (formData.gst_number?.trim()) {
    return "gst";
  }
  return "none";
}

export function StepKyc({ onNext, onBack }: StepKycProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gstPath, setGstPath] = useState<GstPath>(() => inferGstPath(formData));
  const [gstVerificationDeferred, setGstVerificationDeferred] = useState(false);
  const [panVerificationDeferred, setPanVerificationDeferred] = useState(false);
  const verifyGst = useVerifyGst();
  const verifyPan = useVerifyPan();

  const aadhaarRequired = gstPath === "none";
  const aadhaarDigits = (formData.aadhaar_number ?? "").replace(/\D/g, "");
  const hasStoredAadhaarMask = Boolean((formData.aadhaar_number_masked ?? "").trim());
  const hasSavedAadhaar = hasStoredAadhaarMask || Boolean(formData.aadhaar_doc_photo_url);

  const selectGstPath = (path: GstPath) => {
    setGstPath(path);
    updateFormData({
      gst_number: path === "gst" ? formData.gst_number : "",
      gst_enrollment_number: path === "enrollment" ? formData.gst_enrollment_number : "",
      gst_registration_status:
        path === "enrollment" ? "enrollment_pending" : path === "none" ? "" : formData.gst_registration_status,
      gst_doc_photo_url: path === "none" ? null : formData.gst_doc_photo_url,
      aadhaar_number: path === "none" ? formData.aadhaar_number : "",
    });
    setErrors((e) => {
      const next = { ...e };
      delete next.gst_number;
      delete next.gst_enrollment_number;
      delete next.aadhaar_number;
      return next;
    });
  };

  // GST verification on blur
  const handleGstBlur = () => {
    const gst = formData.gst_number.toUpperCase();
    if (!gst) return;

    if (!VALIDATION_RULES.gst_number.pattern.test(gst)) {
      setErrors((e) => ({ ...e, gst_number: "Invalid GST format." }));
      return;
    }

    updateFormData({ gst_status: "pending" });
    setGstVerificationDeferred(false);
    verifyGst.mutate({ gstNumber: gst, ownerName: formData.owner_name }, {
      onSuccess: (res) => {
        const d = res.data;
        updateFormData({
          gst_status: normalizeKycReviewStatus(d.status),
          gst_business_name: null,
          gst_business_address: d.business_address || null,
        });
        setGstVerificationDeferred(false);
        setErrors((e) => {
          const copy = { ...e };
          delete copy.gst_number;
          return copy;
        });
      },
      onError: () => {
        updateFormData({ gst_status: "pending" });
        setGstVerificationDeferred(true);
      },
    });
  };

  // PAN verification on blur
  const handlePanBlur = () => {
    const pan = formData.pan_number.toUpperCase();
    if (!pan) return;

    if (!VALIDATION_RULES.pan_number.pattern.test(pan)) {
      setErrors((e) => ({ ...e, pan_number: "Invalid PAN format." }));
      return;
    }

    updateFormData({ pan_status: "pending" });
    setPanVerificationDeferred(false);
    verifyPan.mutate(
      { panNumber: pan, ownerName: formData.owner_name },
      {
        onSuccess: (res) => {
          const d = res.data;
          updateFormData({
            pan_status: normalizeKycReviewStatus(d.status),
            pan_holder_name: null,
          });
          setPanVerificationDeferred(false);
          setErrors((e) => {
            const copy = { ...e };
            delete copy.pan_number;
            return copy;
          });
        },
        onError: () => {
          updateFormData({ pan_status: "pending" });
          setPanVerificationDeferred(true);
        },
      },
    );
  };

  const statusBadge = (status: string, isVerifying: boolean) => {
    if (isVerifying) {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-info">
          Verifying...
        </span>
      );
    }

    const normalized = normalizeKycReviewStatus(status);
    const map: Record<string, { label: string; cls: string; icon?: typeof faCircleCheck }> = {
      pending: { label: "", cls: "" },
      approved: { label: "Approved", cls: "text-success", icon: faCircleCheck },
      rejected: { label: "Rejected", cls: "text-error", icon: faCircleXmark },
    };
    const m = map[normalized];
    if (!m?.label) return null;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium ${m.cls}`}>
        {m.icon && <FontAwesomeIcon icon={m.icon} />}
        {m.label}
      </span>
    );
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    const gst = (formData.gst_number ?? "").trim().toUpperCase();
    const enrollment = (formData.gst_enrollment_number ?? "").trim().toUpperCase();

    if (gstPath === "gst") {
      if (!gst) {
        e.gst_number = "Enter your GST number or choose Skip GST.";
      } else if (!VALIDATION_RULES.gst_number.pattern.test(gst)) {
        e.gst_number = "Invalid GST format (15 chars: 29ABCDE1234F1Z5).";
      }
    } else if (gstPath === "enrollment") {
      if (!enrollment) {
        e.gst_enrollment_number = "Enter your enrollment number or choose Skip GST.";
      } else if (!/^[A-Z0-9]{8,20}$/.test(enrollment)) {
        e.gst_enrollment_number = "Enter a valid enrollment number (8–20 characters).";
      }
    }

    // PAN is optional but must be valid if provided
    if (
      formData.pan_number &&
      !VALIDATION_RULES.pan_number.pattern.test(formData.pan_number.toUpperCase())
    ) {
      e.pan_number = "Invalid PAN format (10 chars: ABCDE1234F).";
    }

    if (aadhaarRequired) {
      if (!aadhaarDigits && !hasSavedAadhaar) {
        e.aadhaar_number = "Aadhaar is required when GST number and enrollment number are not provided.";
      } else if (
        aadhaarDigits &&
        !VALIDATION_RULES.aadhaar_number.pattern.test(aadhaarDigits)
      ) {
        e.aadhaar_number = "Aadhaar must be exactly 12 digits.";
      }
    } else if (
      aadhaarDigits &&
      !VALIDATION_RULES.aadhaar_number.pattern.test(aadhaarDigits)
    ) {
      e.aadhaar_number = "Aadhaar must be exactly 12 digits.";
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
        <h2 className="text-xl font-bold text-foreground">KYC Verification</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide your business identity numbers. You can skip GST, but Aadhaar is
          required if you do. Verification failures will NOT block your onboarding —
          they will be reviewed manually.
        </p>
      </div>

      {/* API failure notice */}
      {(gstVerificationDeferred || panVerificationDeferred) && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning">
            {gstVerificationDeferred
              ? ONBOARDING_STRINGS.API_FAIL_GST
              : ONBOARDING_STRINGS.API_FAIL_PAN}
          </p>
        </div>
      )}

      {/* GST Number */}
      <div className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
        <div>
          <p className="text-sm font-medium text-foreground">GST registration</p>
          <p className="text-xs text-muted-foreground mt-1">
            Choose whether you have a GSTIN, an enrollment number, or want to skip GST
            for now. If you skip GST, you must provide Aadhaar below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => selectGstPath("none")}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              gstPath === "none"
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-border/80",
            )}
          >
            Skip GST
          </button>
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
            Enrollment only
          </button>
        </div>

        {gstPath === "gst" ? (
          <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.gst_number} error={errors.gst_number}>
            <div className="flex items-center gap-2">
              <Input
                placeholder={ONBOARDING_FIELDS.gst_number.placeholder}
                value={formData.gst_number}
                onChange={(e) =>
                  updateFormData({
                    gst_number: e.target.value.toUpperCase().slice(0, 15),
                  })
                }
                onBlur={handleGstBlur}
                maxLength={15}
                className="uppercase"
              />
              {statusBadge(formData.gst_status, verifyGst.isPending)}
            </div>
            {formData.gst_business_address && (
              <p className="text-xs text-muted-foreground">
                Address: {formData.gst_business_address}
              </p>
            )}
          </FieldWithInfo>
        ) : null}

        {gstPath === "enrollment" ? (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              GST enrollment / ARN number
            </label>
            <p className="text-xs text-muted-foreground">
              Use this if you applied for GST but do not have a GSTIN yet.
            </p>
            <Input
              placeholder="e.g. AAFCA1234D2024"
              value={formData.gst_enrollment_number}
              onChange={(e) =>
                updateFormData({
                  gst_enrollment_number: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  gst_registration_status: "enrollment_pending",
                })
              }
              maxLength={20}
              className="uppercase"
            />
            {errors.gst_enrollment_number && (
              <p className="text-xs text-error">{errors.gst_enrollment_number}</p>
            )}
          </div>
        ) : null}
      </div>

      {/* PAN Number */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.pan_number} error={errors.pan_number}>
        <div className="flex items-center gap-2">
          <Input
            placeholder={ONBOARDING_FIELDS.pan_number.placeholder}
            value={formData.pan_number}
            onChange={(e) =>
              updateFormData({
                pan_number: e.target.value.toUpperCase().slice(0, 10),
              })
            }
            onBlur={handlePanBlur}
            maxLength={10}
            className="uppercase"
          />
          {statusBadge(formData.pan_status, verifyPan.isPending)}
        </div>
      </FieldWithInfo>

      {/* Aadhaar */}
      {aadhaarRequired ? (
        <FieldWithInfo
          fieldInfo={ONBOARDING_FIELDS.aadhaar_number}
          error={errors.aadhaar_number}
        >
          <Input
            placeholder="XXXX XXXX 1234"
            value={aadhaarDigits}
            onChange={(e) =>
              updateFormData({
                aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12),
                aadhaar_number_masked: "",
              })
            }
            maxLength={14}
            inputMode="numeric"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            {hasSavedAadhaar && !aadhaarDigits
              ? `Aadhaar already on file${
                hasStoredAadhaarMask ? ` (${formData.aadhaar_number_masked})` : ""
              }. Re-enter only if you want to replace it.`
              : "Required because GST was skipped. Only last 4 digits are stored."}
          </p>
        </FieldWithInfo>
      ) : null}

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
