"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { PhotoCapture } from "./photo-capture";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useVerifyGst, useVerifyPan } from "@/lib/hooks";
import {
  ONBOARDING_FIELDS,
  VALIDATION_RULES,
  ONBOARDING_STRINGS,
} from "@/lib/constants/onboarding";

interface StepKycProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepKyc({ onNext, onBack }: StepKycProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const verifyGst = useVerifyGst();
  const verifyPan = useVerifyPan();

  // GST verification on blur
  const handleGstBlur = () => {
    const gst = formData.gst_number.toUpperCase();
    if (!gst) return;

    if (!VALIDATION_RULES.gst_number.pattern.test(gst)) {
      setErrors((e) => ({ ...e, gst_number: "Invalid GST format." }));
      return;
    }

    updateFormData({ gst_status: "pending" });
    verifyGst.mutate({ gstNumber: gst, ownerName: formData.owner_name }, {
      onSuccess: (res) => {
        const d = res.data;
        updateFormData({
          gst_status: d.valid ? "verified" : "failed",
          gst_business_name: null,
          gst_business_address: d.business_address || null,
        });
        setErrors((e) => {
          const copy = { ...e };
          delete copy.gst_number;
          return copy;
        });
      },
      onError: () => {
        // Non-blocking: API failure doesn't block onboarding
        updateFormData({ gst_status: "api_error" });
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
    verifyPan.mutate(
      { panNumber: pan, ownerName: formData.owner_name },
      {
        onSuccess: (res) => {
          const d = res.data;
          updateFormData({
            pan_status: d.valid ? "verified" : "failed",
            pan_holder_name: null,
          });
          setErrors((e) => {
            const copy = { ...e };
            delete copy.pan_number;
            return copy;
          });
        },
        onError: () => {
          updateFormData({ pan_status: "api_error" });
        },
      },
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      not_started: { label: "", cls: "" },
      pending: { label: "Verifying...", cls: "text-info" },
      verified: { label: "✓ Verified", cls: "text-success" },
      failed: { label: "✗ Failed", cls: "text-error" },
      api_error: { label: "⚠ Will verify later", cls: "text-warning" },
    };
    const m = map[status] || map.not_started;
    if (!m.label) return null;
    return <span className={`text-xs font-medium ${m.cls}`}>{m.label}</span>;
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // GST is optional but must be valid if provided
    if (
      formData.gst_number &&
      !VALIDATION_RULES.gst_number.pattern.test(formData.gst_number.toUpperCase())
    ) {
      e.gst_number = "Invalid GST format (15 chars: 29ABCDE1234F1Z5).";
    }

    // PAN is optional but must be valid if provided
    if (
      formData.pan_number &&
      !VALIDATION_RULES.pan_number.pattern.test(formData.pan_number.toUpperCase())
    ) {
      e.pan_number = "Invalid PAN format (10 chars: ABCDE1234F).";
    }

    // Aadhaar is optional but must be 12 digits if provided
    if (
      formData.aadhaar_number &&
      !VALIDATION_RULES.aadhaar_number.pattern.test(formData.aadhaar_number)
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
          Provide your business identity documents. Verification failures will
          NOT block your onboarding — they will be reviewed manually.
        </p>
      </div>

      {/* API failure notice */}
      {(formData.gst_status === "api_error" ||
        formData.pan_status === "api_error") && (
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning">
            {formData.gst_status === "api_error"
              ? ONBOARDING_STRINGS.API_FAIL_GST
              : ONBOARDING_STRINGS.API_FAIL_PAN}
          </p>
        </div>
      )}

      {/* GST Number */}
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
          {statusBadge(formData.gst_status)}
        </div>
        {formData.gst_business_address && (
          <p className="text-xs text-muted-foreground">
            Address: {formData.gst_business_address}
          </p>
        )}
      </FieldWithInfo>

      {/* GST Document Photo */}
      <PhotoCapture
        label="GST Certificate Photo"
        value={formData.gst_doc_photo_url}
        onChange={(url) => updateFormData({ gst_doc_photo_url: url })}
        required={false}
        error={errors.gst_doc_photo}
        hint="Take a clear photo of the GST registration certificate or printout."
      />

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
          {statusBadge(formData.pan_status)}
        </div>
      </FieldWithInfo>

      {/* PAN Document Photo */}
      <PhotoCapture
        label="PAN Card Photo"
        value={formData.pan_doc_photo_url}
        onChange={(url) => updateFormData({ pan_doc_photo_url: url })}
        required={false}
        error={errors.pan_doc_photo}
        hint="Take a clear photo of the PAN card (front side). Ensure all text is legible."
      />

      {/* Aadhaar */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.aadhaar_number}
        error={errors.aadhaar_number}
      >
        <Input
          placeholder="XXXX XXXX 1234"
          value={formData.aadhaar_number}
          onChange={(e) =>
            updateFormData({
              aadhaar_number: e.target.value.replace(/\D/g, "").slice(0, 12),
            })
          }
          maxLength={14}
          inputMode="numeric"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Optional. Only last 4 digits are stored.
        </p>
      </FieldWithInfo>

      {/* Aadhaar Document Photo */}
      <PhotoCapture
        label="Aadhaar Card Photo"
        value={formData.aadhaar_doc_photo_url}
        onChange={(url) => updateFormData({ aadhaar_doc_photo_url: url })}
        required={false}
        error={errors.aadhaar_doc_photo}
        hint="Take a clear photo of the Aadhaar card (front side). Mask the first 8 digits if visible."
      />

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
