"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { PhotoCapture } from "./photo-capture";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import {
  ONBOARDING_FIELDS,
  VOLUME_RANGES,
} from "@/lib/constants/onboarding";

interface StepQrActivationProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepQrActivation({ onNext, onBack }: StepQrActivationProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!formData.qr_serial.trim()) {
      e.qr_serial = "QR serial number is required.";
    }
    if (!formData.qr_photo_url) {
      e.qr_photo = "QR placement photo is required.";
    }
    if (!formData.operating_hours_start || !formData.operating_hours_end) {
      e.operating_hours = "Operating hours are required.";
    }
    if (!formData.expected_monthly_volume) {
      e.expected_volume = "Select expected volume range.";
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
        <h2 className="text-xl font-bold text-foreground">QR & Activation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Set up your QR code and provide activation details.
        </p>
      </div>

      {/* QR Serial */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.qr_serial}
        required
        error={errors.qr_serial}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.qr_serial.placeholder}
          value={formData.qr_serial}
          onChange={(e) =>
            updateFormData({ qr_serial: e.target.value.toUpperCase() })
          }
          maxLength={20}
        />
        {formData.qr_assigned && (
          <p className="mt-1 text-xs text-success">✓ QR code linked</p>
        )}
      </FieldWithInfo>

      {/* QR Placement Photo */}
      <PhotoCapture
        label={ONBOARDING_FIELDS.qr_photo.label}
        value={formData.qr_photo_url}
        onChange={(url) => updateFormData({ qr_photo_url: url })}
        required
        error={errors.qr_photo}
      />

      {/* Operating Hours */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.operating_hours}
        required
        error={errors.operating_hours}
      >
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={formData.operating_hours_start}
            onChange={(e) =>
              updateFormData({ operating_hours_start: e.target.value })
            }
            className="w-36"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="time"
            value={formData.operating_hours_end}
            onChange={(e) =>
              updateFormData({ operating_hours_end: e.target.value })
            }
            className="w-36"
          />
        </div>
      </FieldWithInfo>

      {/* Expected Monthly Volume */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.expected_volume}
        required
        error={errors.expected_volume}
      >
        <Select
          options={VOLUME_RANGES}
          value={formData.expected_monthly_volume}
          onChange={(v) => updateFormData({ expected_monthly_volume: v })}
          placeholder="Select range..."
        />
      </FieldWithInfo>

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
