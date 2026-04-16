"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { PhotoCapture } from "./photo-capture";
import { DuplicateAlert } from "./duplicate-alert";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { useCheckPhone } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import {
  ONBOARDING_FIELDS,
  SECTOR_OPTIONS,
  INDIAN_STATES,
  VALIDATION_RULES,
} from "@/lib/constants/onboarding";
import { getHeadOffices } from "@/lib/api/services/onboarding.service";
import type { ApplicationStatus } from "@/lib/types";

interface StepBasicDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepBasicDetails({ onNext, onBack }: StepBasicDetailsProps) {
  const { formData, updateFormData, phoneCheckResult, setPhoneCheckResult } =
    useOnboardingStore();
  const checkPhone = useCheckPhone();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // FE visiting a non-interested (or any non-onboarding) merchant → relaxed rules
  const isFeVisitOnly =
    formData.channel === "field_executive" &&
    formData.visit_outcome !== "interested" &&
    formData.visit_outcome !== null;

  // Debounced phone check
  const handlePhoneChange = useCallback(
    (value: string) => {
      const clean = value.replace(/\D/g, "").slice(0, 10);
      updateFormData({ phone: clean });

      if (clean.length === 10) {
        checkPhone.mutate(clean, {
          onSuccess: (res) => {
            setPhoneCheckResult(
              res.data.exists
                ? {
                    exists: true,
                    status: res.data.status,
                    application_id: res.data.application_id,
                    visiting_exec_name: res.data.visiting_exec_name ?? null,
                    message: res.data.message,
                  }
                : null,
            );
          },
        });
      } else {
        setPhoneCheckResult(null);
      }
    },
    [checkPhone, setPhoneCheckResult, updateFormData],
  );

  // Auto-fill city/state from PIN code (mock)
  useEffect(() => {
    const pin = formData.pin_code;
    if (pin.length === 6) {
      const pinMap: Record<string, { city: string; state: string }> = {
        "560034": { city: "Bengaluru", state: "Karnataka" },
        "110024": { city: "New Delhi", state: "Delhi" },
        "400058": { city: "Mumbai", state: "Maharashtra" },
        "400050": { city: "Mumbai", state: "Maharashtra" },
        "110006": { city: "New Delhi", state: "Delhi" },
        "302001": { city: "Jaipur", state: "Rajasthan" },
        "600001": { city: "Chennai", state: "Tamil Nadu" },
      };
      const match = pinMap[pin];
      if (match) {
        updateFormData({ city: match.city, state: match.state });
      }
    }
  }, [formData.pin_code, updateFormData]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    // Phone: required for merchant / FE-interested; optional for FE visit-only flows
    if (!isFeVisitOnly) {
      if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
        e.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
      }
    } else if (formData.phone && !VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      e.phone = "If entered, must be a valid 10-digit number starting with 6-9.";
    }

    // Owner name: required for merchant / FE-interested; optional for FE visit-only flows
    if (!isFeVisitOnly) {
      if (
        formData.owner_name.length < 2 ||
        !VALIDATION_RULES.owner_name.pattern.test(formData.owner_name)
      ) {
        e.owner_name = "Enter a valid name (letters and spaces only, min 2 chars).";
      }
    } else if (
      formData.owner_name &&
      !VALIDATION_RULES.owner_name.pattern.test(formData.owner_name)
    ) {
      e.owner_name = "If entered, must contain only letters and spaces.";
    }

    if (formData.shop_name.length < 2) {
      e.shop_name = "Shop name must be at least 2 characters.";
    }
    if (!formData.sector_id) {
      e.sector = "Select a business category.";
    }
    if (!formData.locality) {
      e.locality = "Enter your shop locality.";
    }
    if (!VALIDATION_RULES.pin_code.pattern.test(formData.pin_code)) {
      e.pin_code = "Enter a valid 6-digit PIN code.";
    }
    if (!formData.city) {
      e.city = "City is required.";
    }
    if (!formData.state) {
      e.state = "State is required.";
    }
    if (formData.has_ho === null) {
      e.has_ho = "Please confirm whether this branch is linked to an HO.";
    }
    if (formData.has_ho) {
      if (formData.ho_selection_mode === "existing" && !formData.ho_id) {
        e.ho_id = "Select the existing HO.";
      }
      if (formData.ho_selection_mode === "other") {
        if (!formData.branch_name.trim()) {
          e.branch_name = "Branch name is required.";
        }
        if (!formData.new_ho_request.name.trim()) {
          e.new_ho_name = "Enter HO name.";
        }
        if (!formData.new_ho_request.contact_person.trim()) {
          e.new_ho_contact = "Enter contact person name.";
        }
        if (!VALIDATION_RULES.phone.pattern.test(formData.new_ho_request.phone)) {
          e.new_ho_phone = "Enter a valid 10-digit contact number.";
        }
        const email = formData.new_ho_request.email.trim();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          e.new_ho_email = "Enter a valid HO email.";
        }
      }
    }
    // Storefront photo: required only for interested / merchant flows
    if (!isFeVisitOnly && !formData.storefront_photo_url) {
      e.storefront_photo = "Shop storefront photo is mandatory.";
    }
    if (phoneCheckResult?.exists) {
      e.phone = "This number is already registered.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  const isPhoneBlocked = !!phoneCheckResult?.exists;

  const { data: headOfficesRes } = useQuery({
    queryKey: ["onboardingHeadOffices"],
    queryFn: async () => {
      const res = await getHeadOffices();
      return res.data ?? [];
    },
  });

  const hoOptions = (headOfficesRes ?? []).map((ho) => ({
    value: ho.ho_id,
    label: `${ho.name} (${ho.ho_id})`,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Basic Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isFeVisitOnly
            ? "Capture basic shop details for the visit record. Phone and owner name are optional."
            : "Tell us about your shop and business. All fields marked with * are mandatory."}
        </p>
      </div>

      {/* Phone Number */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.phone}
        required={!isFeVisitOnly}
        error={errors.phone}
      >
        <div className="flex gap-2">
          <div className="flex items-center px-3 bg-card border border-border rounded-md text-sm text-muted-foreground">
            +91
          </div>
          <Input
            placeholder="9876543210"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            maxLength={10}
            inputMode="numeric"
            disabled={formData.merchant_phone_verified}
          />
          {checkPhone.isPending && (
            <div className="flex items-center px-2 text-xs text-muted-foreground">
              Checking...
            </div>
          )}
        </div>
      </FieldWithInfo>

      {/* Duplicate alert */}
      {phoneCheckResult?.exists && (
        <DuplicateAlert
          status={phoneCheckResult.status as "active_merchant" | "existing_lead" | "already_submitted" | "existing_fe_visit"}
          applicationId={phoneCheckResult.application_id}
          applicationStatus={phoneCheckResult.status as ApplicationStatus}
          message={phoneCheckResult.message}
        />
      )}

      {/* FE duplicate visit warning */}
      {formData.channel === "field_executive" &&
        phoneCheckResult?.status === "existing_fe_visit" && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
            <div className="flex gap-3">
              <svg
                className="h-5 w-5 shrink-0 text-warning mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Another field executive already visited this store
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phoneCheckResult.visiting_exec_name
                    ? `This merchant was visited by ${phoneCheckResult.visiting_exec_name}.`
                    : "A previous visit record exists for this number."}{" "}
                  A new application cannot be created for this mobile number.
                </p>
              </div>
            </div>
          </div>
        )}

      {/* Owner Name */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.owner_name}
        required={!isFeVisitOnly}
        error={errors.owner_name}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.owner_name.placeholder}
          value={formData.owner_name}
          onChange={(e) => updateFormData({ owner_name: e.target.value })}
          maxLength={100}
        />
      </FieldWithInfo>

      {/* Shop Name */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.shop_name} required error={errors.shop_name}>
        <Input
          placeholder={ONBOARDING_FIELDS.shop_name.placeholder}
          value={formData.shop_name}
          onChange={(e) => updateFormData({ shop_name: e.target.value })}
          maxLength={150}
        />
      </FieldWithInfo>

      {/* Sector */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.sector} required error={errors.sector}>
        <Select
          options={SECTOR_OPTIONS}
          value={formData.sector_id}
          onChange={(v) => {
            const opt = SECTOR_OPTIONS.find((o) => o.value === v);
            updateFormData({ sector_id: v, sector_name: opt?.label || "" });
          }}
          placeholder="Select category..."
        />
      </FieldWithInfo>

      {/* Locality */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.locality} required error={errors.locality}>
        <Input
          placeholder={ONBOARDING_FIELDS.locality.placeholder}
          value={formData.locality}
          onChange={(e) => updateFormData({ locality: e.target.value })}
        />
      </FieldWithInfo>

      {/* PIN / City / State */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.pin_code} required error={errors.pin_code}>
          <Input
            placeholder="560034"
            value={formData.pin_code}
            onChange={(e) =>
              updateFormData({
                pin_code: e.target.value.replace(/\D/g, "").slice(0, 6),
              })
            }
            maxLength={6}
            inputMode="numeric"
          />
        </FieldWithInfo>
        <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.city} required error={errors.city}>
          <Input
            placeholder="Bengaluru"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
          />
        </FieldWithInfo>
      </div>

      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.state} required error={errors.state}>
        <Select
          options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
          value={formData.state}
          onChange={(v) => updateFormData({ state: v })}
          placeholder="Select state..."
        />
      </FieldWithInfo>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Is this branch linked to an HO? *</label>
        <Select
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={formData.has_ho === null ? "" : formData.has_ho ? "yes" : "no"}
          onChange={(value) => {
            const hasHo = value === "yes";
            updateFormData({
              has_ho: hasHo,
              ho_selection_mode: hasHo ? "existing" : "none",
              ho_id: hasHo ? formData.ho_id : "",
              new_ho_request: hasHo
                ? formData.new_ho_request
                : { name: "", contact_person: "", phone: "", email: "" },
            });
          }}
          placeholder="Select one..."
        />
        {errors.has_ho && <p className="text-xs text-error">{errors.has_ho}</p>}
      </div>

      {formData.has_ho && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Branch Name *</label>
            <Input
              placeholder="Koramangala Branch"
              value={formData.branch_name}
              onChange={(e) => updateFormData({ branch_name: e.target.value })}
            />
            {errors.branch_name && (
              <p className="text-xs text-error">{errors.branch_name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">HO Selection</label>
            <Select
              options={[
                { value: "existing", label: "Select Existing HO" },
                { value: "other", label: "Other (Create HO Request)" },
              ]}
              value={formData.ho_selection_mode}
              onChange={(value) =>
                updateFormData({
                  ho_selection_mode: value as "existing" | "other",
                  ho_id: value === "existing" ? formData.ho_id : "",
                  new_ho_request:
                    value === "other"
                      ? formData.new_ho_request
                      : { name: "", contact_person: "", phone: "", email: "" },
                })
              }
            />
          </div>

          {formData.ho_selection_mode === "existing" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Select Existing HO *</label>
              <Select
                options={hoOptions}
                value={formData.ho_id}
                onChange={(value) => updateFormData({ ho_id: value })}
                placeholder="Select HO..."
              />
              {errors.ho_id && <p className="text-xs text-error">{errors.ho_id}</p>}
            </div>
          )}

          {formData.ho_selection_mode === "other" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">HO Name *</label>
                <Input
                  placeholder="ABC Retail Holdings"
                  value={formData.new_ho_request.name}
                  onChange={(e) =>
                    updateFormData({
                      new_ho_request: {
                        ...formData.new_ho_request,
                        name: e.target.value,
                      },
                    })
                  }
                />
                {errors.new_ho_name && <p className="text-xs text-error">{errors.new_ho_name}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Person *</label>
                <Input
                  placeholder="Rohan Gupta"
                  value={formData.new_ho_request.contact_person}
                  onChange={(e) =>
                    updateFormData({
                      new_ho_request: {
                        ...formData.new_ho_request,
                        contact_person: e.target.value,
                      },
                    })
                  }
                />
                {errors.new_ho_contact && <p className="text-xs text-error">{errors.new_ho_contact}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Phone *</label>
                <Input
                  placeholder="9876543210"
                  inputMode="numeric"
                  maxLength={10}
                  value={formData.new_ho_request.phone}
                  onChange={(e) =>
                    updateFormData({
                      new_ho_request: {
                        ...formData.new_ho_request,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      },
                    })
                  }
                />
                {errors.new_ho_phone && <p className="text-xs text-error">{errors.new_ho_phone}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Email *</label>
                <Input
                  placeholder="ops@abcho.com"
                  type="email"
                  value={formData.new_ho_request.email}
                  onChange={(e) =>
                    updateFormData({
                      new_ho_request: {
                        ...formData.new_ho_request,
                        email: e.target.value,
                      },
                    })
                  }
                />
                {errors.new_ho_email && <p className="text-xs text-error">{errors.new_ho_email}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Storefront Photo — optional for FE visit-only, required otherwise */}
      <PhotoCapture
        label="Shop Storefront Photo"
        value={formData.storefront_photo_url}
        onChange={(url) =>
          updateFormData({
            storefront_photo_url: url,
            storefront_photo_status: "uploaded",
          })
        }
        required={!isFeVisitOnly}
        error={errors.storefront_photo}
        hint={
          isFeVisitOnly
            ? "Optional for visit records. Take a photo if possible."
            : undefined
        }
      />

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={isPhoneBlocked}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
}
