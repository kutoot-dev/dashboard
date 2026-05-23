"use client";

import { cn } from "@/lib/utils/cn";

export type FilterChipTone =
  | "accent"
  | "gain"
  | "warning"
  | "neutral"
  | "loss"
  | "gold";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  onSelect: () => void;
  /** Theme color when selected; defaults to accent */
  tone?: FilterChipTone;
}

const selectedToneClasses: Record<FilterChipTone, string> = {
  accent: "bg-accent/18 font-semibold text-accent shadow-sm ring-1 ring-accent/45",
  gain: "bg-gain/18 font-semibold text-gain shadow-sm ring-1 ring-gain/45",
  warning: "bg-warning/18 font-semibold text-warning shadow-sm ring-1 ring-warning/45",
  neutral: "bg-muted font-semibold text-foreground shadow-sm ring-1 ring-border",
  loss: "bg-loss/18 font-semibold text-loss shadow-sm ring-1 ring-loss/45",
  gold: "bg-gold/18 font-semibold text-gold shadow-sm ring-1 ring-gold/45",
};

const unselectedToneClasses: Record<FilterChipTone, string> = {
  accent: "hover:bg-accent/8 hover:ring-accent/35",
  gain: "hover:bg-gain/8 hover:ring-gain/35",
  warning: "hover:bg-warning/8 hover:ring-warning/35",
  neutral: "hover:bg-muted/60 hover:ring-border",
  loss: "hover:bg-loss/8 hover:ring-loss/35",
  gold: "hover:bg-gold/8 hover:ring-gold/35",
};

export function FilterChip({
  label,
  selected = false,
  onSelect,
  tone = "accent",
}: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "inline-flex shrink-0 max-w-[11rem] truncate rounded-lg px-3 py-2 text-left text-xs font-medium leading-snug transition-all sm:max-w-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/50",
        selected
          ? selectedToneClasses[tone]
          : cn(
              "bg-card text-foreground ring-1 ring-border/80 hover:bg-card-hover",
              unselectedToneClasses[tone],
            ),
      )}
    >
      {label}
    </button>
  );
}
