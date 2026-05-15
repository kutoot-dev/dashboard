"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FieldWithInfo } from "./field-with-info";
import { PhotoCapture } from "./photo-capture";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import type { HandoverInventoryItem } from "@/lib/types";
import {
  ONBOARDING_FIELDS,
  VOLUME_RANGES,
} from "@/lib/constants/onboarding";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxesStacked,
  faCheckCircle,
  faClock,
  faPlus,
  faQrcode,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

interface StepQrActivationProps {
  onNext: () => void;
  onBack: () => void;
}

const DEFAULT_INVENTORY_ASSIGNMENT: Array<
  Pick<HandoverInventoryItem, "name" | "assigned_quantity" | "used_quantity">
> = [
  { name: "Static QR Sticker", assigned_quantity: 20, used_quantity: 1 },
  { name: "QR Stand", assigned_quantity: 8, used_quantity: 1 },
  { name: "Welcome Tent Card", assigned_quantity: 15, used_quantity: 0 },
];

function makeInventoryItem(
  item?: Partial<HandoverInventoryItem>,
): HandoverInventoryItem {
  return {
    id:
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`,
    name: item?.name?.trim() || "",
    assigned_quantity: item?.assigned_quantity ?? 0,
    used_quantity: item?.used_quantity ?? 0,
  };
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
        <p className="font-bold text-sm text-foreground truncate max-w-50">
          {shopName || "Your Shop Name"}
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-50">
          {ownerName || "Owner Name"}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground tracking-wide mt-1">
          {serial}
        </p>
        <p className="font-mono text-[9px] text-accent/70 uppercase tracking-widest mt-0.5">
          Powered by Kutoot Business
        </p>
      </div>
    </div>
  );
}

// ── Step Component ─────────────────────────────────────────────────
export function StepQrActivation({ onNext, onBack }: StepQrActivationProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const inventoryRows = Array.isArray(formData.inventory_handover_items)
    ? formData.inventory_handover_items
    : [];

  useEffect(() => {
    if (formData.qr_serial.trim()) {
      setErrors((prev) => {
        if (!prev.qr_serial) return prev;
        const next = { ...prev };
        delete next.qr_serial;
        return next;
      });
    }
  }, [formData.qr_serial]);

  useEffect(() => {
    if (formData.qr_photo_url) {
      setErrors((prev) => {
        if (!prev.qr_photo) return prev;
        const next = { ...prev };
        delete next.qr_photo;
        return next;
      });
    }
  }, [formData.qr_photo_url]);

  useEffect(() => {
    if (
      formData.channel === "field_executive" &&
      inventoryRows.length === 0
    ) {
      updateFormData({
        inventory_handover_items: DEFAULT_INVENTORY_ASSIGNMENT.map((item) =>
          makeInventoryItem(item),
        ),
      });
    }
  }, [
    formData.channel,
    inventoryRows.length,
    updateFormData,
  ]);

  const updateInventoryItem = (
    itemId: string,
    patch: Partial<HandoverInventoryItem>,
  ) => {
    updateFormData({
      inventory_handover_items: inventoryRows.map((item) =>
        item.id === itemId ? { ...item, ...patch } : item,
      ),
    });
  };

  const addInventoryItem = () => {
    updateFormData({
      inventory_handover_items: [...inventoryRows, makeInventoryItem()],
    });
  };

  const removeInventoryItem = (itemId: string) => {
    updateFormData({
      inventory_handover_items: inventoryRows.filter((item) => item.id !== itemId),
    });
  };

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
    if (formData.channel === "field_executive") {
      for (const [index, item] of inventoryRows.entries()) {
        if (!item.name.trim()) {
          e.inventory = `Inventory item #${index + 1} name is required.`;
          break;
        }
        if (item.used_quantity < 0) {
          e.inventory = `Issued quantity cannot be negative for item #${index + 1}.`;
          break;
        }
      }
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
        <h2 className="text-xl font-bold text-foreground">Field Handover</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Capture QR handover details and inventory usage for this merchant onboarding.
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
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            updateFormData({
              qr_serial: value,
              qr_assigned: value.trim().length > 0,
            });
          }}
          maxLength={20}
        />
        {formData.qr_assigned && (
          <p className="mt-1 text-xs text-success">
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
            QR code linked
          </p>
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
        hideUpload
      />

      {formData.channel === "field_executive" && (
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                <FontAwesomeIcon icon={faBoxesStacked} className="mr-2 text-primary" />
                Inventory Handover
              </p>
              <p className="text-xs text-muted-foreground">
                Assigned quantities come from executive stock. Update what was actually handed over.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 px-3 text-xs rounded-md self-start sm:self-auto"
              onClick={addInventoryItem}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Item
            </Button>
          </div>

          {inventoryRows.length === 0 ? (
            <p className="text-xs text-muted-foreground">No inventory assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {inventoryRows.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_120px_auto] gap-2 rounded-md border border-border p-3"
                >
                  <Input
                    placeholder={`Inventory item ${index + 1}`}
                    value={item.name}
                    onChange={(event) =>
                      updateInventoryItem(item.id, { name: event.target.value })
                    }
                  />
                  <Input
                    type="number"
                    min="0"
                    placeholder="Issued qty"
                    value={item.used_quantity}
                    onChange={(event) =>
                      updateInventoryItem(item.id, {
                        used_quantity: Number(event.target.value || 0),
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInventoryItem(item.id)}
                    aria-label={`Remove inventory item ${index + 1}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              ))}
            </div>
          )}
          {errors.inventory && <p className="text-xs text-error">{errors.inventory}</p>}
        </div>
      )}

      {/* Operating Hours */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.operating_hours}
        required
        error={errors.operating_hours}
      >
        <div className="flex flex-wrap items-center gap-2">
          <FontAwesomeIcon icon={faClock} className="text-muted-foreground shrink-0" />
          <Input
            type="time"
            value={formData.operating_hours_start}
            onChange={(e) =>
              updateFormData({ operating_hours_start: e.target.value })
            }
            className="w-full sm:w-36"
          />
          <span className="text-sm text-muted-foreground shrink-0">to</span>
          <Input
            type="time"
            value={formData.operating_hours_end}
            onChange={(e) =>
              updateFormData({ operating_hours_end: e.target.value })
            }
            className="w-full sm:w-36"
          />
        </div>
      </FieldWithInfo>

      {/* Expected Monthly Volume */}
      <FieldWithInfo
        fieldInfo={ONBOARDING_FIELDS.expected_volume}
        required
        error={errors.expected_volume}
      >
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faQrcode} className="text-muted-foreground" />
          <Select
            options={VOLUME_RANGES}
            value={formData.expected_monthly_volume}
            onChange={(v) => updateFormData({ expected_monthly_volume: v })}
            placeholder="Select range..."
          />
        </div>
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

