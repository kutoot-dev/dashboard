"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { faPlus, faTrash } from "@/lib/icons";
import type {
  DiscountProgramBand,
  SaveDiscountProgramPayload,
} from "@/lib/api/services/merchant.service";

export type EditableNumber = number | "";

export type DiscountProgramBandForm = Omit<
  DiscountProgramBand,
  | "min_amount"
  | "max_amount"
  | "discount_min_percentage"
  | "discount_max_percentage"
  | "offer_probability"
> & {
  min_amount: EditableNumber;
  max_amount: EditableNumber;
  discount_min_percentage: EditableNumber;
  discount_max_percentage: EditableNumber;
  offer_probability: EditableNumber;
};

export interface DiscountProgramFormState {
  discount_program_enabled: boolean;
  discount_bands: DiscountProgramBandForm[];
}

const BAND_NUMERIC_FIELDS = [
  { key: "min_amount", label: "Min bill" },
  { key: "max_amount", label: "Max bill" },
  { key: "offer_probability", label: "Offer probability" },
  { key: "discount_min_percentage", label: "Min discount" },
  { key: "discount_max_percentage", label: "Max discount" },
] as const;

function isBandComplete(band: DiscountProgramBandForm): boolean {
  return BAND_NUMERIC_FIELDS.every(({ key }) => band[key] !== "");
}

export function emptyDiscountBand(sortOrder = 0): DiscountProgramBandForm {
  return {
    min_amount: "",
    max_amount: "",
    discount_min_percentage: "",
    discount_max_percentage: "",
    offer_probability: 100,
    sort_order: sortOrder,
    is_active: true,
  };
}

function toEditableBand(band: DiscountProgramBand): DiscountProgramBandForm {
  return {
    ...band,
    min_amount: band.min_amount,
    max_amount: band.max_amount,
    discount_min_percentage: band.discount_min_percentage,
    discount_max_percentage: band.discount_max_percentage,
    offer_probability: band.offer_probability,
  };
}

interface EditableNumberInputProps {
  label: string;
  value: EditableNumber;
  onChange: (value: EditableNumber) => void;
  min?: number;
  max?: number;
  step?: string;
}

function EditableNumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: EditableNumberInputProps) {
  const [inputValue, setInputValue] = useState(value === "" ? "" : String(value));

  useEffect(() => {
    setInputValue(value === "" ? "" : String(value));
  }, [value]);

  function handleChange(raw: string) {
    setInputValue(raw);

    if (raw === "" || raw === ".") {
      onChange("");
      return;
    }

    const num = Number(raw);
    if (!Number.isNaN(num)) {
      onChange(num);
    }
  }

  return (
    <Input
      label={label}
      type="number"
      min={min}
      max={max}
      step={step}
      value={inputValue}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
}

type DiscountProgramFormInput = Partial<{
  discount_program_enabled: boolean;
  discount_bands: DiscountProgramBand[];
  bands: DiscountProgramBand[];
}>;

export function toDiscountProgramFormState(
  settings: DiscountProgramFormInput,
): DiscountProgramFormState {
  const bands = settings.discount_bands ?? settings.bands ?? [];

  return {
    discount_program_enabled: Boolean(settings.discount_program_enabled),
    discount_bands: bands.map((band) => toEditableBand(band)),
  };
}

export function validateDiscountProgramForm(state: DiscountProgramFormState): string | null {
  if (!state.discount_program_enabled) {
    return null;
  }

  const hasActiveBand = state.discount_bands.some((band) => band.is_active);
  if (!hasActiveBand) {
    return "Add at least one active discount band, or disable the program.";
  }

  for (let index = 0; index < state.discount_bands.length; index += 1) {
    const band = state.discount_bands[index];
    if (!band.is_active) {
      continue;
    }

    const missingField = BAND_NUMERIC_FIELDS.find(({ key }) => band[key] === "");
    if (missingField) {
      return `${missingField.label} is required for band ${index + 1}.`;
    }
  }

  return null;
}

interface DiscountProgramFieldsProps {
  value: DiscountProgramFormState;
  onChange: (next: DiscountProgramFormState) => void;
  policyCap?: number | null;
  compact?: boolean;
}

export function DiscountProgramFields({
  value,
  onChange,
  policyCap,
  compact = false,
}: DiscountProgramFieldsProps) {
  function updateBand(index: number, patch: Partial<DiscountProgramBandForm>) {
    onChange({
      ...value,
      discount_bands: value.discount_bands.map((band, bandIndex) =>
        bandIndex === index ? { ...band, ...patch } : band,
      ),
    });
  }

  function addBand() {
    onChange({
      ...value,
      discount_bands: [...value.discount_bands, emptyDiscountBand(value.discount_bands.length)],
    });
  }

  function removeBand(index: number) {
    onChange({
      ...value,
      discount_bands: value.discount_bands.filter((_, bandIndex) => bandIndex !== index),
    });
  }

  return (
    <div className="space-y-4">
      <Card className={`space-y-4 ${compact ? "p-3" : "p-4"}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Merchant-funded discounts</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Discounts you offer are deducted from your settlement — Kutoot does not fund them.
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border"
              checked={value.discount_program_enabled}
              onChange={(event) =>
                onChange({ ...value, discount_program_enabled: event.target.checked })
              }
            />
            Enabled
          </label>
        </div>

        {policyCap != null && (
          <p className="text-xs text-muted-foreground">
            Onboarding policy cap: {policyCap}% (applied across all bands)
          </p>
        )}
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Discount bands</h3>
          <p className="text-sm text-muted-foreground">
            Set discount ranges by bill amount.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addBand}>
          <Icon icon={faPlus} className="mr-1.5 h-3.5 w-3.5" />
          Add band
        </Button>
      </div>

      {value.discount_bands.length === 0 ? (
        <Card className={`text-sm text-muted-foreground ${compact ? "p-3" : "p-4"}`}>
          No discount bands configured. Add a band when you want bill-amount-based discounts, or leave
          empty and disable the program.
        </Card>
      ) : (
      <div className="space-y-4">
        {value.discount_bands.map((band, index) => (
          <Card key={band.id ?? `new-${index}`} className={`space-y-4 ${compact ? "p-3" : "p-4"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Band {index + 1}
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={band.is_active}
                    onChange={(event) => updateBand(index, { is_active: event.target.checked })}
                  />
                  Active
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBand(index)}
                  aria-label={`Remove band ${index + 1}`}
                >
                  <Icon icon={faTrash} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <EditableNumberInput
                label="Min bill (₹)"
                min={0}
                step="0.01"
                value={band.min_amount}
                onChange={(min_amount) => updateBand(index, { min_amount })}
              />
              <EditableNumberInput
                label="Max bill (₹)"
                min={0}
                step="0.01"
                value={band.max_amount}
                onChange={(max_amount) => updateBand(index, { max_amount })}
              />
              <EditableNumberInput
                label="Offer probability %"
                min={0}
                max={100}
                value={band.offer_probability}
                onChange={(offer_probability) => updateBand(index, { offer_probability })}
              />
              <EditableNumberInput
                label="Min discount %"
                min={0}
                max={100}
                step="0.01"
                value={band.discount_min_percentage}
                onChange={(discount_min_percentage) =>
                  updateBand(index, { discount_min_percentage })
                }
              />
              <EditableNumberInput
                label="Max discount %"
                min={0}
                max={100}
                step="0.01"
                value={band.discount_max_percentage}
                onChange={(discount_max_percentage) =>
                  updateBand(index, { discount_max_percentage })
                }
              />
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );
}

export function serializeDiscountProgramPayload(
  value: DiscountProgramFormState,
): SaveDiscountProgramPayload {
  return {
    discount_program_enabled: value.discount_program_enabled,
    bands: value.discount_bands.filter(isBandComplete).map((band, index) => ({
      ...band,
      min_amount: Number(band.min_amount),
      max_amount: Number(band.max_amount),
      discount_min_percentage: Number(band.discount_min_percentage),
      discount_max_percentage: Number(band.discount_max_percentage),
      offer_probability: Number(band.offer_probability),
      sort_order: index,
    })),
  };
}
