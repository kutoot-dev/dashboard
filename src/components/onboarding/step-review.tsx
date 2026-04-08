"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCreateApplication, useUpdateApplication } from "@/lib/hooks";
import {
  APPLICATION_STATUS_LABELS,
  ONBOARDING_FIELDS,
  ONBOARDING_STRINGS,
  SECTOR_OPTIONS,
  VOLUME_RANGES,
} from "@/lib/constants/onboarding";
import type { WizardStepId, ApplicationStatus, OnboardingApplication } from "@/lib/types";

interface StepReviewProps {
  onBack: () => void;
}

export function StepReview({ onBack }: StepReviewProps) {
  const { formData, applicationId, setStep } = useOnboardingStore();
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!formData.terms_accepted) e.terms = "You must accept the terms.";
    if (!formData.privacy_accepted) e.privacy = "You must accept the privacy policy.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      channel: formData.channel,
      exec_id: formData.exec_id,
      exec_employee_code: formData.exec_employee_code,
      phone: formData.phone,
      owner_name: formData.owner_name,
      shop_name: formData.shop_name,
      sector_id: formData.sector_id,
      sector_name: formData.sector_name,
      locality: formData.locality,
      city: formData.city,
      state: formData.state,
      pin_code: formData.pin_code,
      storefront_photo_url: formData.storefront_photo_url,
      gps_lat: formData.gps_lat,
      gps_long: formData.gps_long,
      commission_rate: formData.commission_rate,
      commission_model: formData.commission_model,
      commission_tiers: formData.commission_tiers,
      gst_number: formData.gst_number || undefined,
      pan_number: formData.pan_number || undefined,
      aadhaar_last4: formData.aadhaar_number ? formData.aadhaar_number.slice(-4) : undefined,
      bank_account_name: formData.bank_account_name,
      bank_account_number: formData.bank_account_number,
      bank_ifsc: formData.bank_ifsc,
      bank_name: formData.bank_name,
      qr_serial: formData.qr_serial,
      qr_photo_url: formData.qr_photo_url,
      operating_hours: `${formData.operating_hours_start} - ${formData.operating_hours_end}`,
      expected_monthly_volume: formData.expected_monthly_volume,
      status: "pending_review" as ApplicationStatus,
      current_step: "review" as WizardStepId,
      website_url: formData.website_url, // honeypot
    };

    if (applicationId) {
      updateApp.mutate(
        { id: applicationId, data: payload as unknown as Partial<OnboardingApplication> },
        {
          onSuccess: () => setSubmitted(true),
        },
      );
    } else {
      createApp.mutate(payload as unknown as Partial<OnboardingApplication>, {
        onSuccess: () => setSubmitted(true),
      });
    }
  };

  const goToStep = (step: WizardStepId) => setStep(step);

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-bold text-foreground">
          {ONBOARDING_STRINGS.SUBMIT_SUCCESS}
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your application is now under review. You will receive an SMS on{" "}
          <span className="font-medium text-foreground">
            +91 {formData.phone}
          </span>{" "}
          once approved.
        </p>
        {applicationId && (
          <p className="text-sm text-muted-foreground">
            Application ID: <span className="font-mono">{applicationId}</span>
          </p>
        )}
      </div>
    );
  }

  const sectorLabel =
    SECTOR_OPTIONS.find((s) => s.value === formData.sector_id)?.label ||
    formData.sector_id;
  const volumeLabel =
    VOLUME_RANGES.find((v) => v.value === formData.expected_monthly_volume)?.label ||
    formData.expected_monthly_volume;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review & Submit</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Review all details before submitting. Click section titles to edit.
        </p>
      </div>

      {/* Basic Details Section */}
      <Section title="Basic Details" onEdit={() => goToStep("basic_details")}>
        <Row label="Phone" value={`+91 ${formData.phone}`} />
        <Row label="Owner Name" value={formData.owner_name} />
        <Row label="Shop Name" value={formData.shop_name} />
        <Row label="Category" value={sectorLabel} />
        <Row label="Location" value={`${formData.locality}, ${formData.city}, ${formData.state} - ${formData.pin_code}`} />
        <Row
          label="Storefront Photo"
          value={formData.storefront_photo_url ? "✓ Uploaded" : "✗ Missing"}
          valueClass={formData.storefront_photo_url ? "text-success" : "text-error"}
        />
      </Section>

      {/* Commission Section */}
      <Section title="Commission" onEdit={() => goToStep("commission")}>
        <Row label="Model" value={formData.commission_model === "flat" ? "Flat Rate" : "Tiered"} />
        {formData.commission_model === "flat" && (
          <Row label="Rate" value={`${formData.commission_rate}%`} />
        )}
        {formData.commission_model === "tiered" && formData.commission_tiers && (
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground mb-1">Slabs:</p>
            {formData.commission_tiers.map((t, i) => (
              <p key={i} className="text-sm text-foreground">
                ₹{t.min_amount?.toLocaleString("en-IN")} – {t.max_amount ? `₹${t.max_amount.toLocaleString("en-IN")}` : "∞"}: {t.rate_percent}%
              </p>
            ))}
          </div>
        )}
      </Section>

      {/* KYC Section */}
      <Section title="KYC" onEdit={() => goToStep("kyc")}>
        <Row label="GST" value={formData.gst_number || "Not provided"} />
        <Row
          label="GST Status"
          value={APPLICATION_STATUS_LABELS[formData.gst_status] || formData.gst_status}
        />
        <Row label="PAN" value={formData.pan_number || "Not provided"} />
        <Row
          label="PAN Status"
          value={APPLICATION_STATUS_LABELS[formData.pan_status] || formData.pan_status}
        />
        <Row
          label="Aadhaar"
          value={formData.aadhaar_number ? `XXXX-XXXX-${formData.aadhaar_number.slice(-4)}` : "Not provided"}
        />
      </Section>

      {/* Bank Section */}
      <Section title="Bank Details" onEdit={() => goToStep("bank")}>
        <Row label="Account Name" value={formData.bank_account_name} />
        <Row label="Account Number" value={`XXXX${formData.bank_account_number.slice(-4)}`} />
        <Row label="IFSC" value={formData.bank_ifsc} />
        {formData.bank_name && <Row label="Bank" value={formData.bank_name} />}
      </Section>

      {/* QR & Activation */}
      <Section title="QR & Activation" onEdit={() => goToStep("qr_activation")}>
        <Row label="QR Serial" value={formData.qr_serial} />
        <Row
          label="QR Photo"
          value={formData.qr_photo_url ? "✓ Uploaded" : "✗ Missing"}
          valueClass={formData.qr_photo_url ? "text-success" : "text-error"}
        />
        <Row label="Operating Hours" value={`${formData.operating_hours_start} - ${formData.operating_hours_end}`} />
        <Row label="Expected Volume" value={volumeLabel} />
      </Section>

      {/* Terms & Privacy */}
      <div className="space-y-3 pt-2">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.terms_accepted}
            onChange={(e) =>
              useOnboardingStore.getState().updateFormData({ terms_accepted: e.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-foreground">
            I accept the{" "}
            <span className="text-accent underline">Terms & Conditions</span>{" "}
            and agree to the commission structure above.
          </span>
        </label>
        {errors.terms && (
          <p className="text-xs text-error pl-7">{errors.terms}</p>
        )}

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.privacy_accepted}
            onChange={(e) =>
              useOnboardingStore.getState().updateFormData({ privacy_accepted: e.target.checked })
            }
            className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <span className="text-sm text-foreground">
            I accept the{" "}
            <span className="text-accent underline">Privacy Policy</span> and
            consent to data processing as described.
          </span>
        </label>
        {errors.privacy && (
          <p className="text-xs text-error pl-7">{errors.privacy}</p>
        )}
      </div>

      {/* Hidden honeypot field */}
      <div style={{ position: "absolute", left: "-9999px", opacity: 0 }} aria-hidden="true">
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website_url}
          onChange={(e) =>
            useOnboardingStore.getState().updateFormData({ website_url: e.target.value })
          }
        />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={createApp.isPending || updateApp.isPending}
        >
          Submit Application
        </Button>
      </div>
    </div>
  );
}

// ── Helper Components ──────────────────────────────────────────────

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-accent hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <>
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${valueClass || ""}`}>
        {value}
      </span>
    </>
  );
}
