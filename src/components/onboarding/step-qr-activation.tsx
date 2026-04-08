"use client";

import { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils/cn";

interface StepQrActivationProps {
  onNext: () => void;
  onBack: () => void;
}

// ── QR module-level grid generator ────────────────────────────────
// Produces a deterministic 21×21 bool grid from a serial string,
// with correct finder patterns (corner squares) like a real QR.
function buildQrGrid(serial: string): boolean[][] {
  const SIZE = 21;
  const grid: boolean[][] = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(false),
  );

  // Draw 7×7 finder pattern at (r0, c0)
  const drawFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const on =
          r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
        if (r0 + r < SIZE && c0 + c < SIZE) grid[r0 + r][c0 + c] = on;
      }
    }
  };
  drawFinder(0, 0);   // top-left
  drawFinder(0, 14);  // top-right
  drawFinder(14, 0);  // bottom-left

  // Timing patterns (row 6 & col 6)
  for (let i = 8; i <= 12; i++) {
    grid[6][i] = i % 2 === 0;
    grid[i][6] = i % 2 === 0;
  }

  // Data area: deterministic pseudo-random from serial
  let h = 0x811c9dc5;
  for (let i = 0; i < serial.length; i++) {
    h ^= serial.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const inTL = r < 9 && c < 9;
      const inTR = r < 9 && c > 12;
      const inBL = r > 12 && c < 9;
      const timing = r === 6 || c === 6;
      if (!inTL && !inTR && !inBL && !timing) {
        h = (h ^ ((r * 31 + c) * 0x9e3779b9)) >>> 0;
        h = ((h << 13) | (h >>> 19)) >>> 0;
        grid[r][c] = h % 100 < 55;
      }
    }
  }
  return grid;
}

// ── QR Preview Card ────────────────────────────────────────────────
function QrPreviewCard({
  serial,
  shopName,
  ownerName,
}: {
  serial: string;
  shopName: string;
  ownerName: string;
}) {
  const grid = useMemo(() => buildQrGrid(serial), [serial]);
  const MODULE = 9; // px per module

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        QR Preview
      </p>

      {/* QR art */}
      <div
        className="rounded-lg border border-border bg-white p-3 shadow-inner"
        style={{ lineHeight: 0 }}
      >
        <svg
          width={MODULE * 21}
          height={MODULE * 21}
          viewBox={`0 0 ${MODULE * 21} ${MODULE * 21}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {grid.map((row, r) =>
            row.map((on, c) =>
              on ? (
                <rect
                  key={`${r}-${c}`}
                  x={c * MODULE}
                  y={r * MODULE}
                  width={MODULE}
                  height={MODULE}
                  fill="#111"
                  rx={1}
                />
              ) : null,
            ),
          )}
        </svg>
      </div>

      {/* Merchant info below QR */}
      <div className="text-center space-y-0.5">
        <p className="font-bold text-sm text-foreground truncate max-w-[200px]">
          {shopName || "Your Shop Name"}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
          {ownerName || "Owner Name"}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground tracking-wide mt-1">
          {serial}
        </p>
        <p className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mt-0.5">
          Powered by Kutoot
        </p>
      </div>
    </div>
  );
}

// ── Step Component ─────────────────────────────────────────────────
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

  const serialFilled = formData.qr_serial.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">QR & Activation</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the QR code serial from the physical sticker and set the merchant&apos;s shop hours.
        </p>
      </div>

      {/* QR Serial input — FE enters manually from the physical sticker */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.qr_serial}
        required
        error={errors.qr_serial}
      >
        <Input
          placeholder={ONBOARDING_FIELDS.qr_serial.placeholder}
          value={formData.qr_serial}
          onChange={(e) =>
            updateFormData({
              qr_serial: e.target.value.toUpperCase(),
              qr_assigned: e.target.value.trim().length > 0,
            })
          }
          maxLength={20}
        />
        {formData.qr_assigned && (
          <p className="mt-1 text-xs text-success">✓ QR code linked</p>
        )}
      </FieldWithInfo>

      {/* QR Preview — shown as soon as a serial is typed */}
      {serialFilled && (
        <QrPreviewCard
          serial={formData.qr_serial}
          shopName={formData.shop_name}
          ownerName={formData.owner_name}
        />
      )}

      {/* QR Placement Photo */}
      <PhotoCapture
        label={ONBOARDING_FIELDS.qr_photo.label}
        value={formData.qr_photo_url}
        onChange={(url) => updateFormData({ qr_photo_url: url })}
        required
        error={errors.qr_photo}
        hint="Take a photo of the QR sticker placed at the merchant's counter."
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

