"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useScoreTick, type ScoreTick } from "@/lib/hooks/use-score-tick";

interface VolatilityIndexProps {
  locationId: number;
  className?: string;
}

type VolatilityLevel = "extreme" | "high" | "medium" | "low" | "calm";

function getLevel(score: number): { level: VolatilityLevel; label: string; color: string } {
  if (score >= 0.8) return { level: "extreme", label: "EXTREME",  color: "text-red-500" };
  if (score >= 0.6) return { level: "high",    label: "HIGH",     color: "text-orange-400" };
  if (score >= 0.4) return { level: "medium",  label: "MODERATE", color: "text-yellow-400" };
  if (score >= 0.2) return { level: "low",     label: "LOW",      color: "text-gain" };
  return              { level: "calm",    label: "CALM",     color: "text-muted-foreground" };
}

/**
 * VolatilityIndex — shows how much the branch score is fluctuating.
 *
 * Computed from the spread (high – low) across the last N ticks.
 * Inspired by the VIX / crypto fear-and-greed index.
 */
export function VolatilityIndex({ locationId, className }: VolatilityIndexProps) {
  const { ticks, connected } = useScoreTick(locationId, 60);

  const { volatility, spread, gauge } = useMemo(() => {
    if (ticks.length < 2) {
      return { volatility: 0, spread: 0, gauge: 0 };
    }
    const highs  = ticks.map((t) => t.high);
    const lows   = ticks.map((t) => t.low);
    const closes = ticks.map((t) => t.close);

    const maxHigh = Math.max(...highs);
    const minLow  = Math.min(...lows);
    const spread  = maxHigh - minLow;

    // Standard deviation of close prices
    const mean   = closes.reduce((a, b) => a + b, 0) / closes.length;
    const stdDev = Math.sqrt(closes.reduce((s, c) => s + (c - mean) ** 2, 0) / closes.length);

    // Normalise stdDev to 0–1 (cap at 0.05 spread = "extreme")
    const gauge = Math.min(1, stdDev / 0.05);

    return { volatility: stdDev, spread, gauge };
  }, [ticks]);

  const { label, color } = getLevel(gauge);

  // Arc SVG parameters
  const radius = 40;
  const circumference = Math.PI * radius; // half circle
  const arcLength = circumference * gauge;

  return (
    <div className={cn("flex flex-col rounded-lg border border-border/40 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Volatility Index
        </span>
        {connected && (
          <span className="flex items-center gap-1 text-[9px] font-mono text-gain">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
            </span>
            LIVE
          </span>
        )}
      </div>

      {/* Gauge */}
      <div className="flex flex-col items-center py-4 px-3 gap-2">
        <svg width="100" height="56" viewBox="0 0 100 56">
          {/* Background arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-muted/30"
          />
          {/* Value arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(gauge * Math.PI * 45).toFixed(1)} ${Math.PI * 45}`}
            className={cn(
              gauge >= 0.8 ? "text-red-500" :
              gauge >= 0.6 ? "text-orange-400" :
              gauge >= 0.4 ? "text-yellow-400" :
              gauge >= 0.2 ? "text-gain" :
              "text-muted-foreground"
            )}
          />
          {/* Centre text */}
          <text x="50" y="44" textAnchor="middle" fontSize="14" fontFamily="monospace" fontWeight="bold"
                className="fill-current text-foreground" fill="currentColor">
            {(gauge * 100).toFixed(0)}
          </text>
        </svg>

        <span className={cn("text-sm font-mono font-bold uppercase tracking-widest", color)}>
          {label}
        </span>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[9px] font-mono text-muted-foreground w-full mt-1">
          <div className="flex justify-between">
            <span>Spread</span>
            <span className="text-foreground">{(spread * 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>StdDev</span>
            <span className="text-foreground">{(volatility * 100).toFixed(3)}</span>
          </div>
          <div className="flex justify-between">
            <span>Ticks</span>
            <span className="text-foreground">{ticks.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Window</span>
            <span className="text-foreground">60m</span>
          </div>
        </div>
      </div>
    </div>
  );
}
