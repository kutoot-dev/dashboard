"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";

export type ChartType = "candle" | "line" | "area" | "baseline";

interface ChartTypeSwitcherProps {
  value: ChartType;
  onChange: (type: ChartType) => void;
  className?: string;
}

const CHART_TYPES: { type: ChartType; label: string; icon: React.ReactNode }[] = [
  {
    type: "candle",
    label: "Candlestick",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="3" width="2" height="10" rx="0.5" fill="currentColor" />
        <rect x="5" y="5" width="2" height="7" rx="0.5" fill="currentColor" />
        <rect x="8" y="2" width="2" height="9" rx="0.5" fill="currentColor" />
        <rect x="11" y="4" width="2" height="8" rx="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    type: "line",
    label: "Line",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <polyline
          points="1,12 4,6 7,9 10,3 15,7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "area",
    label: "Area",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M1,12 L4,6 L7,9 L10,3 L15,7 L15,14 L1,14 Z"
          fill="currentColor"
          opacity="0.3"
        />
        <polyline
          points="1,12 4,6 7,9 10,3 15,7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
  {
    type: "baseline",
    label: "Baseline",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <line
          x1="1" y1="8" x2="15" y2="8"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 2"
          opacity="0.5"
        />
        <polyline
          points="1,10 4,5 7,9 10,4 13,7 15,6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
];

export function ChartTypeSwitcher({ value, onChange, className }: ChartTypeSwitcherProps) {
  return (
    <div className={cn("inline-flex items-center rounded-md border border-border", className)}>
      {CHART_TYPES.map(({ type, label, icon }) => {
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            title={label}
            onClick={() => onChange(type)}
            className={cn(
              "flex items-center justify-center w-8 h-8 transition-colors border-r last:border-r-0",
              active
                ? "bg-accent/10 text-accent border-accent"
                : "text-muted-foreground border-border hover:text-foreground"
            )}
          >
            {icon}
          </button>
        );
      })}
    </div>
  );
}
