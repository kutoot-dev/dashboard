"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ApplicationStatusScreen } from "@/components/onboarding/application-status-screen";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useToastStore } from "@/lib/stores/toast.store";
import { useCreateApplication, useUpdateApplication } from "@/lib/hooks";
import {
  APPLICATION_STATUS_LABELS,
  ONBOARDING_STRINGS,
  SECTOR_OPTIONS,
  VOLUME_RANGES,
  VISIT_OUTCOME_OPTIONS,
} from "@/lib/constants/onboarding";
import type { WizardStepId, ApplicationStatus, OnboardingApplication } from "@/lib/types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faClipboardList,
  faClock,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";

interface StepReviewProps {
  onBack: () => void;
}

export function StepReview({ onBack }: StepReviewProps) {
  const router = useRouter();
  const { formData, applicationId, completedSteps, setStep } = useOnboardingStore();
  const pushToast = useToastStore((s) => s.push);
  const createApp = useCreateApplication();
  const updateApp = useUpdateApplication();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [duplicatePhoneError, setDuplicatePhoneError] = useState<string | null>(null);

  const isFeVisitOnly =
    formData.channel === "field_executive" &&
    formData.visit_outcome !== "interested" &&
    formData.visit_outcome !== null;
  const visitOutcomeLabel =
    VISIT_OUTCOME_OPTIONS.find((o) => o.value === formData.visit_outcome)?.label ||
    formData.visit_outcome;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    // For visit-only records, no T&C acceptance needed
    if (!isFeVisitOnly) {
      if (!formData.terms_accepted) {
        e.terms = ONBOARDING_STRINGS.TERMS_REQUIRED;
      }
      if (!formData.service_agreement_accepted) {
        e.service_agreement = ONBOARDING_STRINGS.SERVICE_AGREEMENT_REQUIRED;
      }
      if (!formData.privacy_accepted) {
        e.privacy = ONBOARDING_STRINGS.PRIVACY_REQUIRED;
      }
    }

    if (Object.keys(e).length > 0) {
      const firstMessage = Object.values(e)[0] ?? "Please review the highlighted fields.";
      pushToast({
        variant: "error",
        title: "Please fix form errors",
        description: firstMessage,
      });
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload = {
      channel: formData.channel,
      submitted_by: formData.channel,
      exec_id: formData.exec_id,
      exec_employee_code: formData.exec_employee_code,
      referral_code: formData.referral_code || undefined,
      visit_outcome: formData.visit_outcome,
      visit_notes: formData.visit_notes || null,
      follow_up_schedules: formData.follow_up_schedules,
      inventory_handover_items: formData.inventory_handover_items,
      phone: formData.phone || null,
      owner_name: formData.owner_name || null,
      email: formData.owner_email || null,
      email_verified: formData.owner_email ? !!formData.owner_email_verified : false,
      shop_name: formData.shop_name,
      door_no: formData.door_no || null,
      shop_no: formData.shop_no || null,
      year_of_establishment: formData.year_of_establishment || null,
      business_ownership_type: formData.business_ownership_type || null,
      sector_id: formData.sector_id,
      sector_name: formData.sector_name,
      locality: formData.locality,
      city: formData.city,
      state: formData.state,
      pin_code: formData.pin_code,
      storefront_photo_url: formData.storefront_photo_url,
      storefront_photo_urls: formData.storefront_photo_urls,
      gps_lat: formData.gps_lat,
      gps_long: formData.gps_long,
      google_maps_link:
        formData.gps_lat != null && formData.gps_long != null
          ? `https://maps.google.com/?q=${formData.gps_lat},${formData.gps_long}`
          : undefined,
      expected_monthly_volume: formData.expected_monthly_volume || undefined,
      ...(!isFeVisitOnly && {
        commission_rate: formData.commission_rate,
        commission_model: "flat",
        commission_agreed: formData.commission_agreed,
        minimum_commission_percentage: formData.minimum_commission_percentage ?? undefined,
        terms_accepted: formData.terms_accepted,
        privacy_accepted: formData.privacy_accepted,
        service_agreement_accepted: formData.service_agreement_accepted,
        gst_number: formData.gst_number || undefined,
        gst_business_name: formData.gst_business_name || undefined,
        gst_business_address: formData.gst_business_address || undefined,
        gst_registration_status: formData.gst_status || undefined,
        gst_doc_photo_url: formData.gst_doc_photo_url || undefined,
        pan_number: formData.pan_number || undefined,
        pan_doc_photo_url: formData.pan_doc_photo_url || undefined,
        aadhaar_number: formData.aadhaar_number || undefined,
        aadhaar_last4: formData.aadhaar_number ? formData.aadhaar_number.slice(-4) : undefined,
        aadhaar_doc_photo_url: formData.aadhaar_doc_photo_url || undefined,
        bank_account_name: formData.bank_account_name,
        bank_account_number: formData.bank_account_number,
        bank_ifsc: formData.bank_ifsc,
        bank_name: formData.bank_name,
        preferred_settlement_method: formData.preferred_settlement_method || undefined,
        qr_serial: formData.qr_serial || undefined,
        qr_assigned: formData.qr_assigned,
        qr_photo_url: formData.qr_photo_url || undefined,
        operating_hours_start: formData.operating_hours_start || undefined,
        operating_hours_end: formData.operating_hours_end || undefined,
        operating_hours:
          formData.operating_hours_start && formData.operating_hours_end
            ? `${formData.operating_hours_start} - ${formData.operating_hours_end}`
            : undefined,
      }),
      stage: isFeVisitOnly
        ? ((formData.visit_outcome ?? "revisit") as string)
        : "submitted",
      status: (isFeVisitOnly ? "visit_record" : "pending_review") as ApplicationStatus,
      current_step: "review" as WizardStepId,
      website_url: formData.website_url, // honeypot
    };

    if (applicationId) {
      updateApp.mutate(
        { id: applicationId, data: payload as unknown as Partial<OnboardingApplication> },
        {
          onSuccess: () => setSubmitted(true),
          onError: () => {
            pushToast({
              variant: "error",
              title: "Submission failed",
              description: "Could not submit onboarding details. Please retry.",
            });
          },
        },
      );
    } else {
      createApp.mutate(payload as unknown as Partial<OnboardingApplication>, {
        onSuccess: () => setSubmitted(true),
        onError: (error: any) => {
          const errorCode = error?.response?.data?.code;
          const existingAppId = error?.response?.data?.data?.existing_application_id;
          const phone = formData.phone || payload.phone;

          if (errorCode === "DUPLICATE_APPLICATION" && phone) {
            setDuplicatePhoneError(phone);
            pushToast({
              variant: "warning",
              title: "Application already exists",
              description: "An application already exists for this phone number.",
            });
          } else {
            pushToast({
              variant: "error",
              title: "Submission failed",
              description: "Could not submit onboarding details. Please retry.",
            });
          }
        },
      });
    }
  };

  const goToStep = (step: WizardStepId) => setStep(step);

  // Show duplicate application error
  if (duplicatePhoneError) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl text-warning">
              <FontAwesomeIcon icon={faCircleInfo} />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="font-semibold text-foreground">Application Already Exists</h3>
              <p className="text-sm text-muted-foreground">
                An application already exists for +91 {duplicatePhoneError.slice(0, 2)}XXXXXX{duplicatePhoneError.slice(8)}. 
                You can resume your existing application or contact support for assistance.
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="primary"
              onClick={() =>
                router.push(`/onboard/resume?from=duplicate&phone=${duplicatePhoneError}`)
              }
            >
              Resume Existing Application
            </Button>
            <Button
              variant="ghost"
              onClick={() => setDuplicatePhoneError(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    if (isFeVisitOnly) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="text-5xl text-primary">
            <FontAwesomeIcon icon={faClipboardList} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Visit Recorded</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            {`Visit outcome "${visitOutcomeLabel}" has been logged.${formData.visit_notes ? " Notes saved." : ""} This record will be visible in your visit history.`}
          </p>
          {applicationId && (
            <p className="text-sm text-muted-foreground">
              Application ID: <span className="font-mono">{applicationId}</span>
            </p>
          )}
        </div>
      );
    }

    if (!applicationId) {
      return (
        <div className="text-center py-12 space-y-4">
          <div className="text-5xl text-success">
            <FontAwesomeIcon icon={faCircleCheck} />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            {ONBOARDING_STRINGS.SUBMIT_SUCCESS}
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Your application is now under review.
          </p>
        </div>
      );
    }

    return (
      <ApplicationStatusScreen
        applicationId={applicationId}
        phone={formData.phone}
      />
    );
  }

  const sectorLabel =
    formData.sector_name ||
    SECTOR_OPTIONS.find((s) => s.value === String(formData.sector_id))?.label ||
    (formData.sector_id ? String(formData.sector_id) : "");
  const volumeLabel =
    VOLUME_RANGES.find((v) => v.value === formData.expected_monthly_volume)?.label ||
    formData.expected_monthly_volume;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">
          {isFeVisitOnly ? "Review Visit Record" : "Review & Submit"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isFeVisitOnly
            ? "Confirm the visit details before logging this record."
            : "Review all details before submitting. Click section titles to edit."}
        </p>
      </div>

      {/* Submitted-by banner */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-info/10 text-info border border-info/30">
          <FontAwesomeIcon icon={faCircleInfo} />
          {formData.channel === "merchant"
            ? "Submitted by Merchant"
            : "Submitted by Field Executive"}
        </span>
        {isFeVisitOnly && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/30">
            <FontAwesomeIcon icon={faClipboardList} />
            Visit Record - {visitOutcomeLabel}
          </span>
        )}
      </div>

      {/* Identity section — shown first for correct step-order matching */}
      {!isFeVisitOnly && (
        <Section title="Identity" onEdit={() => goToStep("identity")}>
          <Row
            label="Channel"
            value={formData.channel === "merchant" ? "Merchant" : "Field Executive"}
          />
          {formData.exec_name && <Row label="Executive Name" value={formData.exec_name} />}
          {formData.exec_employee_code && (
            <Row label="Employee Code" value={formData.exec_employee_code} />
          )}
        </Section>
      )}

      {/* Visit details section (FE visit-only) */}
      {isFeVisitOnly && (
        <Section title="Visit Details" onEdit={() => goToStep("visit_outcome")}>
          <Row label="Outcome" value={visitOutcomeLabel || ""} />
          {formData.visit_notes && (
            <Row label="Notes" value={formData.visit_notes} />
          )}
          {formData.exec_name && (
            <Row label="Field Executive" value={formData.exec_name} />
          )}
          {formData.follow_up_schedules.length > 0 && (
            <div className="col-span-2 space-y-2 pt-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Follow-up Schedule ({formData.follow_up_schedules.length} slot{formData.follow_up_schedules.length > 1 ? "s" : ""})
              </p>
              {formData.follow_up_schedules.map((slot, idx) => (
                <div key={slot.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      <FontAwesomeIcon icon={faClipboardList} className="mr-2" />
                      {slot.date}
                      <span className="mx-2 text-muted-foreground">|</span>
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      {slot.time}
                    </p>
                    {slot.notes && (
                      <p className="text-xs text-muted-foreground">{slot.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">#{idx + 1}</span>
                </div>
              ))}
            </div>
          )}
        </Section>
      )}

      {/* Basic Details Section */}
      <Section title="Basic Details" onEdit={() => goToStep("basic_details")}>
        {formData.phone && <Row label="Phone" value={`+91 ${formData.phone}`} />}
        {formData.owner_name && <Row label="Owner Name" value={formData.owner_name} />}
        {formData.owner_email && <Row label="Email" value={formData.owner_email} />}
        <Row label="Shop Name" value={formData.shop_name} />
        {formData.door_no && <Row label="Door No" value={formData.door_no} />}
        {formData.shop_no && <Row label="Shop No" value={formData.shop_no} />}
        {formData.branch_name && <Row label="Branch / Outlet" value={formData.branch_name} />}
        {formData.year_of_establishment && <Row label="Year of Establishment" value={formData.year_of_establishment} />}
        {formData.business_ownership_type && <Row label="Business Ownership Type" value={formData.business_ownership_type} />}
        <Row label="Category" value={sectorLabel} />
        <Row label="Locality" value={formData.locality} />
        <Row label="City" value={formData.city} />
        <Row label="State" value={formData.state} />
        <Row label="PIN Code" value={formData.pin_code} />
        <Row label="Location" value={`${formData.locality}, ${formData.city}, ${formData.state} - ${formData.pin_code}`} />
        <Row
          label="Latitude / Longitude"
          value={
            formData.gps_lat != null && formData.gps_long != null
              ? `${formData.gps_lat}, ${formData.gps_long}`
              : "Not captured"
          }
          valueClass={formData.gps_lat != null && formData.gps_long != null ? "" : "text-error"}
        />
        <Row
          label="Google Maps Link"
          value={
            formData.gps_lat != null && formData.gps_long != null
              ? `https://maps.google.com/?q=${formData.gps_lat},${formData.gps_long}`
              : "Not available"
          }
        />
        <Row
          label="Storefront Photos"
          value={
            formData.storefront_photo_urls.length > 0 || formData.storefront_photo_url
              ? `${Math.max(formData.storefront_photo_urls.length, formData.storefront_photo_url ? 1 : 0)} uploaded`
              : isFeVisitOnly
                ? "Skipped"
                : "Missing"
          }
          valueClass={
            formData.storefront_photo_urls.length > 0 || formData.storefront_photo_url
              ? "text-success"
              : isFeVisitOnly
                ? "text-muted-foreground"
                : "text-error"
          }
        />
      </Section>

      {/* Commission / KYC / Bank / QR — only for full onboarding, not visit records */}
      {!isFeVisitOnly && (
        <>
          {/* Commission Section */}
          <Section title="Commission" onEdit={() => goToStep("commission")}>
            <Row label="Model" value="Flat Rate" />
            <Row label="Rate" value={`${formData.commission_rate}%`} />
            {formData.minimum_commission_percentage != null && (
              <Row
                label="Minimum Allowed"
                value={`${formData.minimum_commission_percentage}%`}
              />
            )}
          </Section>

          {/* KYC Section */}
          <Section title="KYC" onEdit={() => goToStep("kyc")}>
            <Row label="GST" value={formData.gst_number || "Not provided"} />
            {/* <Row
              label="GST Business Address"
              value={formData.gst_business_address || "Not provided"}
            />
            <Row
              label="GST Status"
              value={APPLICATION_STATUS_LABELS[formData.gst_status] || formData.gst_status}
            /> */}
            <Row
              label="GST Document"
              value={formData.gst_doc_photo_url ? "Photo uploaded" : "Not captured"}
              valueClass={formData.gst_doc_photo_url ? "text-success" : "text-muted-foreground"}
            />
            <Row label="PAN" value={formData.pan_number || "Not provided"} />
            {/* <Row
              label="PAN Status"
              value={APPLICATION_STATUS_LABELS[formData.pan_status] || formData.pan_status}
            /> */}
            <Row
              label="PAN Document"
              value={formData.pan_doc_photo_url ? "Photo uploaded" : "Not captured"}
              valueClass={formData.pan_doc_photo_url ? "text-success" : "text-muted-foreground"}
            />
            <Row
              label="Aadhaar"
              value={
                formData.aadhaar_number
                  ? formData.aadhaar_number
                  : "Not provided"
              }
            />
            <Row
              label="Aadhaar Document"
              value={formData.aadhaar_doc_photo_url ? "Photo uploaded" : "Not captured"}
              valueClass={formData.aadhaar_doc_photo_url ? "text-success" : "text-muted-foreground"}
            />
          </Section>

          {/* Bank Section */}
          <Section title="Bank Details" onEdit={() => goToStep("bank")}>
            <Row label="Account Name" value={formData.bank_account_name} />
            <Row label="Account Number" value={formData.bank_account_number} />
            <Row label="IFSC" value={formData.bank_ifsc} />
            {formData.bank_name && <Row label="Bank" value={formData.bank_name} />}
            {formData.bank_branch_name && (
              <Row label="Branch" value={formData.bank_branch_name} />
            )}
            <Row
              label="Bank Status"
              value={APPLICATION_STATUS_LABELS[formData.bank_status] || formData.bank_status}
            />
            {/* <Row
              label="Penny Drop"
              value={APPLICATION_STATUS_LABELS[formData.penny_drop_status] || formData.penny_drop_status}
            /> */}
          </Section>

          {formData.channel === "field_executive" && (
            <Section title="Referral" onEdit={() => goToStep("basic_details")}>
              <Row
                label="Referral Code"
                value={formData.referral_code || "Not provided"}
                valueClass={formData.referral_code ? "" : "text-muted-foreground"}
              />
            </Section>
          )}

          <Section title="Operations" onEdit={() => goToStep("bank")}>
            <Row
              label="Operating Hours"
              value={
                formData.operating_hours_start && formData.operating_hours_end
                  ? `${formData.operating_hours_start} - ${formData.operating_hours_end}`
                  : "Not provided"
              }
            />
            <Row
              label="Expected Volume"
              value={volumeLabel || "Not provided"}
              valueClass={volumeLabel ? "" : "text-muted-foreground"}
            />
          </Section>
        </>
      )}

      {/* Terms & Privacy */}
      {/* Terms & Privacy — only for full onboarding applications */}
      {!isFeVisitOnly && (
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.terms_accepted}
              onChange={(e) => {
                const checked = e.target.checked;
                useOnboardingStore.getState().updateFormData({ terms_accepted: checked });
                if (checked) {
                  setErrors((prev) => {
                    if (!prev.terms) return prev;
                    const next = { ...prev };
                    delete next.terms;

                    return next;
                  });
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              I have read and accept the{" "}
              <a
                href="/merchant-terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Terms & Conditions
              </a>
              .
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-error pl-7">{errors.terms}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.service_agreement_accepted}
              onChange={(e) => {
                const checked = e.target.checked;
                useOnboardingStore.getState().updateFormData({
                  service_agreement_accepted: checked,
                });
                if (checked) {
                  setErrors((prev) => {
                    if (!prev.service_agreement) return prev;
                    const next = { ...prev };
                    delete next.service_agreement;

                    return next;
                  });
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              I have read and accept the{" "}
              <a
                href="/merchant-service-agreement"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Merchant Service Agreement
              </a>{" "}
              (commissions, settlements, and platform fees).
            </span>
          </label>
          {errors.service_agreement && (
            <p className="text-xs text-error pl-7">{errors.service_agreement}</p>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.privacy_accepted}
              onChange={(e) => {
                const checked = e.target.checked;
                useOnboardingStore.getState().updateFormData({ privacy_accepted: checked });
                if (checked) {
                  setErrors((prev) => {
                    if (!prev.privacy) return prev;
                    const next = { ...prev };
                    delete next.privacy;

                    return next;
                  });
                }
              }}
              className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-foreground">
              I accept the{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent underline"
              >
                Privacy Policy
              </a>{" "}
              and
              consent to data processing as described.
            </span>
          </label>
          {errors.privacy && (
            <p className="text-xs text-error pl-7">{errors.privacy}</p>
          )}
        </div>
      )}

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
          {isFeVisitOnly ? "Log Visit Record" : "Submit Application"}
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
        <h3 className="text-sm font-semibold text-foreground inline-flex items-center gap-2">
          <FontAwesomeIcon icon={faFileCircleCheck} className="text-primary" />
          {title}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-accent hover:underline"
        >
          Edit
        </button>
      </div>
      <div className="grid grid-cols-1 gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-2">
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
      <span className="text-xs text-muted-foreground wrap-break-word">{label}</span>
      <span className={`text-sm text-foreground wrap-break-word sm:break-all ${valueClass || ""}`}>
        {value}
      </span>
    </>
  );
}
