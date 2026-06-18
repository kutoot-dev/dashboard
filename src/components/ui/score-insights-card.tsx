"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { formatPercent, formatScorePercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface ScoreInsightSegment {
  key: string;
  value: number;
  weight: number;
  weightPercent: number;
  contribution: number;
  isTopPerformer: boolean;
  isLeastPerformer: boolean;
  label: string;
  description: string;
}

interface ScoreInsightsCardProps {
  segments: ScoreInsightSegment[];
  /** @deprecated Pie chart removed; kept for call-site compatibility. */
  pieData?: Array<{ key: string; label: string; value: number; weight: number }>;
  compositeScore: number;
  compositeRank: number | null;
  onImproveClick: (key: string, label: string) => void;
}

export function ScoreInsightsCard({
  segments,
  compositeScore,
  compositeRank,
  onImproveClick,
}: ScoreInsightsCardProps) {
  const { summedContribution, behaviorAdjustment } = useMemo(() => {
    const summed = segments.reduce((total, segment) => total + segment.contribution, 0);
    return {
      summedContribution: summed,
      behaviorAdjustment: compositeScore - summed,
    };
  }, [segments, compositeScore]);

  return (
    <Card className="space-y-4 border border-primary/28 bg-card/72 p-4 sm:space-y-5 sm:p-5">
      <header className="space-y-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
            Your performance today
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            How you scored on each area, its weightage, and your total composite score.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
          <div className="rounded-xl border border-primary/30 bg-primary/8 px-3 py-3 text-center">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Composite score
            </p>
            <p className="font-tabular text-2xl font-semibold text-foreground sm:text-3xl">
              {formatScorePercent(compositeScore)}
            </p>
          </div>
          {typeof compositeRank === "number" && (
            <div className="rounded-xl border border-accent/30 bg-accent/8 px-3 py-3 text-center">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Rank
              </p>
              <p className="font-tabular text-2xl font-semibold text-accent sm:text-3xl">
                #{compositeRank}
              </p>
            </div>
          )}
        </div>
      </header>

      {segments.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
          Performance breakdown will appear after your first scored activity today.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-1 border-b border-border/70 bg-muted/30 px-2 py-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem] sm:gap-2 sm:px-4">
            <span>Area</span>
            <span className="text-right">Perf.</span>
            <span className="text-right">Weight</span>
            <span className="text-right">Adds</span>
          </div>
          <ul className="divide-y divide-border/60">
            {segments.map((segment) => (
              <li key={segment.key}>
                <button
                  type="button"
                  onClick={() => onImproveClick(segment.key, segment.label)}
                  className="grid w-full grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_4.5rem] gap-1 px-2 py-3 text-left transition-colors touch-manipulation hover:bg-muted/20 active:bg-muted/30 sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem_5.5rem] sm:gap-2 sm:px-4"
                >
                  <span className="min-w-0 truncate text-sm font-medium text-foreground">
                    {segment.label}
                  </span>
                  <span
                    className={cn(
                      "font-tabular text-right text-sm font-semibold",
                      segment.isTopPerformer ? "text-gain" : "text-foreground",
                    )}
                  >
                    {formatScorePercent(segment.value)}
                  </span>
                  <span className="font-tabular text-right text-sm text-muted-foreground">
                    {formatPercent(segment.weightPercent)}
                  </span>
                  <span className="font-tabular text-right text-sm font-medium text-accent">
                    {formatScorePercent(segment.contribution)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {segments.length > 0 && (
        <section className="space-y-3 rounded-xl border border-primary/22 bg-primary/5 p-3 sm:p-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground">How composite is calculated</h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Each row adds{" "}
              <span className="font-medium text-foreground">performance × weightage</span> to your
              total. The backend may apply small behaviour adjustments (inactivity, etc.) before the
              final score.
            </p>
          </div>

          <div className="space-y-2 font-mono text-[11px] sm:text-xs">
            {segments.map((segment) => (
              <div
                key={segment.key}
                className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-muted-foreground"
              >
                <span className="min-w-0 truncate text-foreground/90">{segment.label}</span>
                <span className="shrink-0 tabular-nums">
                  {formatScorePercent(segment.value)} × {formatPercent(segment.weightPercent)} ={" "}
                  <span className="font-semibold text-accent">
                    {formatScorePercent(segment.contribution)}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <dl className="space-y-2 border-t border-border/60 pt-3 text-sm">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Sum of all areas</dt>
              <dd className="font-tabular font-semibold text-foreground">
                {formatScorePercent(summedContribution)}
              </dd>
            </div>
            {Math.abs(behaviorAdjustment) >= 0.0005 && (
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Behaviour adjustment</dt>
                <dd
                  className={cn(
                    "font-tabular font-semibold",
                    behaviorAdjustment >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {behaviorAdjustment >= 0 ? "+" : ""}
                  {formatScorePercent(behaviorAdjustment)}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-2">
              <dt className="font-medium text-foreground">Composite score</dt>
              <dd className="font-tabular text-base font-semibold text-primary sm:text-lg">
                {formatScorePercent(compositeScore)}
              </dd>
            </div>
          </dl>

          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Formula: composite ≈ Σ (performance × weightage) + adjustments, minimum score 5%.
          </p>
        </section>
      )}

      {segments.length > 0 && (
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Tap a row for improvement tips. Perf. = performance today, Weight = share of total score,
          Adds = points contributed to composite.
        </p>
      )}
    </Card>
  );
}
