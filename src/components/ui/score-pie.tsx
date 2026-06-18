"use client";

import { useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { cn } from "@/lib/utils/cn";
import { formatScore } from "@/lib/utils/format";

interface ScorePieDatum {
  /** Identifier for the sub-score (e.g. "gmv_score"). */
  key: string;
  /** Display label shown in the legend and tooltip. */
  label: string;
  /** 0..100 value for this parameter. */
  value: number;
  /** Normalised 0..1 weight this parameter contributes to the composite. */
  weight: number;
}

export interface ScorePieProps {
  data: ScorePieDatum[];
  size?: number;
  className?: string;
  /** Total composite score (0..100) to show in the centre. */
  composite?: number;
  /** Optional rank to show under the composite for quick glance. */
  rank?: number | null;
  /** Compact mode removes the legend (for small cards). */
  compact?: boolean;
  /** Controlled active segment key for syncing with external UI. */
  activeKey?: string | null;
  /** Callback fired when active segment changes due to hover/focus. */
  onActiveKeyChange?: (key: string | null) => void;
}

const PALETTE = [
  "#22c55e", // gain
  "#fbbf24", // amber
  "#60a5fa", // blue
  "#a78bfa", // violet
  "#f472b6", // pink
  "#f97316", // orange
  "#2dd4bf", // teal
  "#facc15", // yellow
];

/**
 * ScorePie — a radial representation of the composite score that replaces the
 * old parameter-meter grid. The outer ring is weighted by each parameter's
 * contribution to the composite, and each slice's fill intensity reflects the
 * parameter's current 0..100 score.
 *
 * The centre shows the composite score and (optionally) the rank.
 */
export function ScorePie({
  data,
  size = 240,
  className,
  composite,
  rank,
  compact = false,
  activeKey: controlledActiveKey,
  onActiveKeyChange,
}: ScorePieProps) {
  const [internalActiveKey, setInternalActiveKey] = useState<string | null>(null);
  const activeKey = controlledActiveKey ?? internalActiveKey;

  const setActiveKey = (key: string | null) => {
    if (controlledActiveKey === undefined) {
      setInternalActiveKey(key);
    }
    onActiveKeyChange?.(key);
  };

  const slices = useMemo(
    () =>
      data.map((d, i) => {
        const color = PALETTE[i % PALETTE.length];
        return {
          ...d,
          fill: color,
          accent: color,
          contribution: d.value * d.weight,
        };
      }),
    [data],
  );

  const computedComposite = useMemo(() => {
    if (typeof composite === "number") return composite;
    if (slices.length === 0) return 0;
    return slices.reduce((acc, s) => acc + s.contribution, 0);
  }, [composite, slices]);

  const active = activeKey ? slices.find((s) => s.key === activeKey) : null;

  if (slices.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-2xl border border-dashed border-border/40 bg-card/20 text-xs text-muted-foreground",
          className,
        )}
        style={{ height: size }}
      >
        No score breakdown yet
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="weight"
              innerRadius={size * 0.32}
              outerRadius={size * 0.46}
              paddingAngle={2}
              stroke="transparent"
              isAnimationActive
              onMouseEnter={(_, i) => setActiveKey(slices[i]?.key ?? null)}
              onMouseLeave={() => setActiveKey(null)}
              onClick={(_, i) => setActiveKey(slices[i]?.key ?? null)}
            >
              {slices.map((s, idx) => (
                <Cell
                  key={s.key}
                  fill={s.fill}
                  opacity={activeKey && activeKey !== s.key ? 0.35 : 1}
                  stroke={s.accent}
                  strokeWidth={idx === 0 ? 1 : 0.5}
                />
              ))}
            </Pie>
            <Pie
              data={slices}
              dataKey="value"
              innerRadius={size * 0.2}
              outerRadius={size * 0.3}
              paddingAngle={1}
              stroke="transparent"
            >
              {slices.map((s) => (
                <Cell
                  key={s.key + "-inner"}
                  fill={s.accent}
                  opacity={0.35}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active: isActive, payload }) => {
                if (!isActive || !payload?.length) return null;
                const row = payload[0].payload as (typeof slices)[number];
                return (
                  <div className="rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-lg">
                    <div className="font-semibold text-foreground">{row.label}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {formatScore(row.value)} / 100
                    </div>
                    <div className="font-mono text-[10px] text-accent">
                      weight {Math.round(row.weight * 100)}% · contribution {formatScore(row.contribution)}
                    </div>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Centre overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {active ? active.label : "Composite"}
          </span>
          <span className="font-mono text-3xl font-bold text-foreground leading-tight">
            {active ? formatScore(active.value) : formatScore(computedComposite)}
          </span>
          {!active && typeof rank === "number" && rank > 0 && (
            <span className="font-mono text-[10px] text-accent">
              Rank #{rank}
            </span>
          )}
          {active && <span className="font-mono text-[10px] text-accent">{formatScore(active.contribution)}</span>}
        </div>
      </div>

      {!compact && (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          {slices.map((s) => (
            <button
              key={s.key}
              type="button"
              onMouseEnter={() => setActiveKey(s.key)}
              onMouseLeave={() => setActiveKey(null)}
              onFocus={() => setActiveKey(s.key)}
              onBlur={() => setActiveKey(null)}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-left transition-colors",
                activeKey === s.key ? "bg-accent/10" : "hover:bg-accent/5",
              )}
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: s.fill, boxShadow: `0 0 0 1px ${s.accent}` }}
              />
              <span className="truncate font-medium text-foreground">{s.label}</span>
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                {formatScore(s.value)}
                <span className="text-accent"> · {Math.round(s.weight * 100)}%</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
