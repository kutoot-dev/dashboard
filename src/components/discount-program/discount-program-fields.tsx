"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { faPlus, faTrash } from "@/lib/icons";
import type {
  DiscountProgramBand,
  SaveDiscountProgramPayload,
} from "@/lib/api/services/merchant.service";

export interface DiscountProgramFormState {
  discount_program_enabled: boolean;
  discount_program_max_percentage: number | string;
  minimum_bill_amount_for_discount: number | string;
  discount_bands: DiscountProgramBand[];
}

export function emptyDiscountBand(sortOrder = 0): DiscountProgramBand {
  return {
    min_amount: 0,
    max_amount: 0,
    discount_min_percentage: 5,
    discount_max_percentage: 10,
    offer_probability: 100,
    sort_order: sortOrder,
    is_active: true,
  };
}

type DiscountProgramFormInput = Partial<{
  discount_program_enabled: boolean;
  discount_program_max_percentage: number | string | null;
  minimum_bill_amount_for_discount: number | string | null;
  discount_bands: DiscountProgramBand[];
  bands: DiscountProgramBand[];
}>;

export function toDiscountProgramFormState(
  settings: DiscountProgramFormInput,
): DiscountProgramFormState {
  const bands = settings.discount_bands ?? settings.bands ?? [];

  return {
    discount_program_enabled: Boolean(settings.discount_program_enabled),
    discount_program_max_percentage: settings.discount_program_max_percentage ?? "",
    minimum_bill_amount_for_discount: settings.minimum_bill_amount_for_discount ?? "",
    discount_bands: bands.length > 0 ? bands : [emptyDiscountBand(0)],
  };
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
  function updateBand(index: number, patch: Partial<DiscountProgramBand>) {
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
    const bands = value.discount_bands.filter((_, bandIndex) => bandIndex !== index);
    onChange({
      ...value,
      discount_bands: bands.length > 0 ? bands : [emptyDiscountBand(0)],
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

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Minimum bill for discount (₹)"
            type="number"
            min={0}
            step="0.01"
            value={value.minimum_bill_amount_for_discount}
            onChange={(event) =>
              onChange({ ...value, minimum_bill_amount_for_discount: event.target.value })
            }
          />
          <Input
            label="Max discount % (optional cap)"
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={value.discount_program_max_percentage}
            onChange={(event) =>
              onChange({ ...value, discount_program_max_percentage: event.target.value })
            }
          />
        </div>

        {policyCap != null && (
          <p className="text-xs text-muted-foreground">
            Onboarding policy cap: {policyCap}%
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
                  disabled={value.discount_bands.length === 1}
                >
                  <Icon icon={faTrash} className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Min bill (₹)"
                type="number"
                min={0}
                step="0.01"
                value={band.min_amount}
                onChange={(event) => updateBand(index, { min_amount: Number(event.target.value) })}
              />
              <Input
                label="Max bill (₹)"
                type="number"
                min={0}
                step="0.01"
                value={band.max_amount}
                onChange={(event) => updateBand(index, { max_amount: Number(event.target.value) })}
              />
              <Input
                label="Offer probability %"
                type="number"
                min={0}
                max={100}
                value={band.offer_probability}
                onChange={(event) =>
                  updateBand(index, { offer_probability: Number(event.target.value) })
                }
              />
              <Input
                label="Min discount %"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={band.discount_min_percentage}
                onChange={(event) =>
                  updateBand(index, { discount_min_percentage: Number(event.target.value) })
                }
              />
              <Input
                label="Max discount %"
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={band.discount_max_percentage}
                onChange={(event) =>
                  updateBand(index, { discount_max_percentage: Number(event.target.value) })
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function serializeDiscountProgramPayload(
  value: DiscountProgramFormState,
): SaveDiscountProgramPayload {
  return {
    discount_program_enabled: value.discount_program_enabled,
    discount_program_max_percentage:
      value.discount_program_max_percentage === ""
        ? null
        : Number(value.discount_program_max_percentage),
    minimum_bill_amount_for_discount:
      value.minimum_bill_amount_for_discount === ""
        ? null
        : Number(value.minimum_bill_amount_for_discount),
    bands: value.discount_bands.map((band, index) => ({
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
