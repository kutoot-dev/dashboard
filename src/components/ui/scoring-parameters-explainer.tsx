"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import {
  SUB_SCORE_DESCRIPTIONS,
  SUB_SCORE_LABELS,
  SUB_SCORE_ORDER,
  IMPROVEMENT_TIPS,
} from "@/lib/constants/scoring";
import { useScoringWeights } from "@/lib/hooks/use-scoring-weights";
import { getScoringWeight } from "@/lib/utils/scoring-weights";

/** Same palette used by ScorePie so slice colour = row colour. */
const PALETTE = [
  "#22c55e",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#f97316",
  "#2dd4bf",
  "#facc15",
];

export interface ScoringParametersExplainerProps {
  className?: string;
  /** Current sub-score values keyed by SUB_SCORE_ORDER keys. */
  values?: Record<string, number>;
  /** When true, render with no outer card chrome / heading (host card supplies them). */
  inline?: boolean;
  /** When true and `inline` is false, render as a default-collapsed accordion. */
  collapsible?: boolean;
  /** Initial open state when `collapsible`. */
  defaultOpen?: boolean;
}

/**
 * Explains every parameter that drives the merchant's composite score.
 * Colour strip matches the pie slice so readers can visually cross-reference
 * the two cards at a glance. Can stand alone (`inline=false`), be embedded
 * inside another card without chrome (`inline=true`), or behave as a
 * default-collapsed accordion (`collapsible=true`).
 */
export function ScoringParametersExplainer({
  className,
  values,
  inline = false,
  collapsible = false,
  defaultOpen = false,
}: ScoringParametersExplainerProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { weights } = useScoringWeights(SUB_SCORE_ORDER);

  const list = (
    <ul className="max-h-[340px] space-y-1.5 overflow-y-auto pr-1 scrollbar-hide">
        {SUB_SCORE_ORDER.map((key, i) => {
          const label = SUB_SCORE_LABELS[key] ?? key;
          const desc = SUB_SCORE_DESCRIPTIONS[key] ?? "";
          const tip = IMPROVEMENT_TIPS[key]?.[0];
          const weight = getScoringWeight(key, SUB_SCORE_ORDER, weights);
          const color = PALETTE[i % PALETTE.length];
          const value = values?.[key];

          return (
            <li
              key={key}
              className="relative rounded-md border border-glass-border bg-glass-bg/40 px-3 py-2"
            >
              <span
                aria-hidden
                className="absolute left-0 top-0 h-full w-1 rounded-l-md"
                style={{ backgroundColor: color }}
              />
              <div className="flex items-center justify-between gap-2 pl-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">
                    {label}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground">
                    {desc}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {typeof value === "number" && (
                    <p className="font-mono text-sm font-bold text-foreground">
                      {value.toFixed(0)}
                    </p>
                  )}
                  <p className="font-mono text-[10px] text-accent">
                    {Math.round(weight * 100)}%
                  </p>
                </div>
              </div>
              {tip && (
                <p className="mt-1 pl-2 text-[10px] text-muted-foreground">
                  <span className="text-gain">Tip:</span> {tip}
                </p>
              )}
            </li>
          );
        })}
      </ul>
  );

  if (inline) {
    return <div className={cn("space-y-2", className)}>{list}</div>;
  }

  if (collapsible) {
    return (
      <div className={cn("space-y-2", className)}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-md border border-glass-border bg-glass-bg/40 px-3 py-2 text-left transition-colors hover:bg-glass-bg/60"
          aria-expanded={open}
        >
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Scoring Parameters Explained
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
            8 metrics · 100%
            <span aria-hidden className={cn("transition-transform", open ? "rotate-180" : "")}>
              ▾
            </span>
          </span>
        </button>
        {open && list}
      </div>
    );
  }

  return (
    <div className={cn("glass-card p-3 space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Scoring Parameters Explained
        </h2>
        <span className="font-mono text-[9px] text-muted-foreground">
          8 metrics · 100% weight
        </span>
      </div>
      {list}
    </div>
  );
}
