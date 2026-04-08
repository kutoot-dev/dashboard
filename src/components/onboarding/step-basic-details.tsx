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
import {
  ONBOARDING_FIELDS,
  SECTOR_OPTIONS,
  INDIAN_STATES,
  VALIDATION_RULES,
} from "@/lib/constants/onboarding";
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

    if (!VALIDATION_RULES.phone.pattern.test(formData.phone)) {
      e.phone = "Enter a valid 10-digit Indian mobile number starting with 6-9.";
    }
    if (
      formData.owner_name.length < 2 ||
      !VALIDATION_RULES.owner_name.pattern.test(formData.owner_name)
    ) {
      e.owner_name = "Enter a valid name (letters and spaces only, min 2 chars).";
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
    if (!formData.storefront_photo_url) {
      e.storefront_photo = "Shop storefront photo is mandatory.";
    }
    if (phoneCheckResult?.exists && phoneCheckResult.status !== "existing_lead") {
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

  const isPhoneBlocked =
    phoneCheckResult?.exists &&
    (phoneCheckResult.status === "active_merchant" ||
      phoneCheckResult.status === "already_submitted");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Basic Details</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your shop and business. All fields marked with * are mandatory.
        </p>
      </div>

      {/* Phone Number */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.phone} required error={errors.phone}>
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
          status={phoneCheckResult.status as "active_merchant" | "existing_lead" | "already_submitted"}
          applicationId={phoneCheckResult.application_id}
          applicationStatus={phoneCheckResult.status as ApplicationStatus}
          message={phoneCheckResult.message}
        />
      )}

      {/* Owner Name */}
      <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.owner_name} required error={errors.owner_name}>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        <FieldWithInfo fieldInfo={ONBOARDING_FIELDS.state} required error={errors.state}>
          <Select
            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            value={formData.state}
            onChange={(v) => updateFormData({ state: v })}
            placeholder="Select state..."
          />
        </FieldWithInfo>
      </div>

      {/* Storefront Photo */}
      <PhotoCapture
        label="Shop Storefront Photo"
        value={formData.storefront_photo_url}
        onChange={(url) =>
          updateFormData({
            storefront_photo_url: url,
            storefront_photo_status: "uploaded",
          })
        }
        required
        error={errors.storefront_photo}
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
