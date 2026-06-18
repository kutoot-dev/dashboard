"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { ScorePie } from "@/components/ui/score-pie";
import { IMPROVEMENT_TIPS } from "@/lib/constants/scoring";
import { formatPercent, formatScorePercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Matches ScorePie slice colours for cross-reference. */
const SLICE_COLORS = [
  "#22c55e",
  "#fbbf24",
  "#60a5fa",
  "#a78bfa",
  "#f472b6",
  "#f97316",
  "#2dd4bf",
  "#facc15",
];

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
  pieData: Array<{ key: string; label: string; value: number; weight: number }>;
  compositeScore: number;
  compositeRank: number | null;
  onImproveClick: (key: string, label: string) => void;
}

/** API sub-scores are 0–1; tone bands match 0–100 display scale. */
function scoreTonePercent(valuePercent: number) {
  if (valuePercent >= 75) {
    return {
      text: "text-gain",
      bar: "bg-gain",
      bg: "bg-gain/10",
      label: "Strong",
    };
  }
  if (valuePercent >= 50) {
    return {
      text: "text-accent",
      bar: "bg-accent",
      bg: "bg-accent/10",
      label: "Good",
    };
  }
  if (valuePercent >= 25) {
    return {
      text: "text-warning",
      bar: "bg-warning",
      bg: "bg-warning/10",
      label: "Needs work",
    };
  }
  return {
    text: "text-loss",
    bar: "bg-loss",
    bg: "bg-loss/10",
    label: "Priority",
  };
}

function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHasFinePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return hasFinePointer;
}

function usePieSize(fallback = 220) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(fallback);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const update = () => {
      const width = node.getBoundingClientRect().width;
      setSize(Math.min(260, Math.max(176, Math.floor(width))));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { containerRef, size };
}

export function ScoreInsightsCard({
  segments,
  pieData,
  compositeScore,
  compositeRank,
  onImproveClick,
}: ScoreInsightsCardProps) {
  const hasFinePointer = useFinePointer();
  const { containerRef: pieContainerRef, size: pieSize } = usePieSize(220);
  const [activeSegmentKey, setActiveSegmentKey] = useState<string | null>(null);

  const activeSegment =
    segments.find((segment) => segment.key === activeSegmentKey) ?? segments[0] ?? null;

  const highlightedKey = activeSegmentKey ?? activeSegment?.key ?? null;

  const colorByKey = useMemo(() => {
    const map: Record<string, string> = {};
    segments.forEach((segment, index) => {
      map[segment.key] = SLICE_COLORS[index % SLICE_COLORS.length];
    });
    return map;
  }, [segments]);

  const focusAreas = useMemo(
    () =>
      [...segments]
        .filter((segment) => segment.value < 0.5)
        .sort((a, b) => a.value - b.value)
        .slice(0, 2),
    [segments],
  );

  function selectSegment(key: string) {
    setActiveSegmentKey(key);
  }

  function clearActiveSegment() {
    if (hasFinePointer) setActiveSegmentKey(null);
  }

  const activeTips =
    activeSegment &&
    (IMPROVEMENT_TIPS[activeSegment.key] ?? [
      "Focus on steady, repeatable actions rather than one-off spikes.",
      "Check back after your next busy period to see movement.",
    ]);

  return (
    <Card className="space-y-4 border border-primary/28 bg-card/72 p-4 sm:space-y-5 sm:p-5">
      <header className="space-y-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">
              Score insights
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Tap the chart or a signal below to see how to improve it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0 sm:flex-wrap">
            <div className="rounded-xl border border-primary/30 bg-primary/8 px-3 py-2.5 text-center sm:min-w-[88px]">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Total score
              </p>
              <p className="font-tabular text-xl font-semibold text-foreground sm:text-2xl">
                {formatScorePercent(compositeScore)}
              </p>
            </div>
            {typeof compositeRank === "number" && (
              <div className="rounded-xl border border-accent/30 bg-accent/8 px-3 py-2.5 text-center sm:min-w-[88px]">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Rank
                </p>
                <p className="font-tabular text-xl font-semibold text-accent sm:text-2xl">
                  #{compositeRank}
                </p>
              </div>
            )}
          </div>
        </div>

        {focusAreas.length > 0 && (
          <div className="rounded-xl border border-warning/25 bg-warning/6 px-3 py-3 sm:py-2.5">
            <p className="text-xs font-medium text-foreground">Quick wins to try first</p>
            <div className="mt-2 -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {focusAreas.map((segment) => (
                <button
                  key={segment.key}
                  type="button"
                  onClick={() => {
                    selectSegment(segment.key);
                    onImproveClick(segment.key, segment.label);
                  }}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/35 bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors touch-manipulation hover:bg-warning/12 active:bg-warning/16"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: colorByKey[segment.key] }}
                    aria-hidden
                  />
                  {segment.label}
                  <span className="font-tabular text-warning">{formatScorePercent(segment.value)}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {segments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {segments.map((segment) => {
            const isSelected = highlightedKey === segment.key;
            return (
              <button
                key={segment.key}
                type="button"
                onClick={() => selectSegment(segment.key)}
                onMouseEnter={() => setActiveSegmentKey(segment.key)}
                onMouseLeave={clearActiveSegment}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors touch-manipulation",
                  isSelected
                    ? "border-accent/50 bg-accent/12 text-foreground"
                    : "border-border/70 bg-card/60 text-muted-foreground",
                )}
                aria-pressed={isSelected}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: colorByKey[segment.key] }}
                  aria-hidden
                />
                <span className="max-w-[7rem] truncate">{segment.label}</span>
                <span className="font-tabular">{formatScorePercent(segment.value)}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12 lg:items-start lg:gap-5">
        <section className="flex flex-col space-y-3 rounded-xl border border-accent/28 bg-card/70 p-3 sm:p-4 lg:col-span-5">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Score breakdown</h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap a slice to focus one signal.
            </p>
          </div>
          <div ref={pieContainerRef} className="mx-auto w-full max-w-[260px]">
            <ScorePie
              data={pieData}
              composite={compositeScore}
              rank={compositeRank}
              size={pieSize}
              compact
              activeKey={highlightedKey}
              onActiveKeyChange={setActiveSegmentKey}
            />
          </div>
        </section>

        <section className="flex flex-col space-y-4 lg:col-span-7">
          {activeSegment ? (
            <>
              <div
                className="rounded-xl border px-3 py-3 sm:py-4"
                style={{
                  borderColor: `${colorByKey[activeSegment.key]}55`,
                  backgroundColor: `${colorByKey[activeSegment.key]}14`,
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{activeSegment.label}</h4>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      scoreTonePercent(activeSegment.value * 100).bg,
                      scoreTonePercent(activeSegment.value * 100).text,
                    )}
                  >
                    {scoreTonePercent(activeSegment.value * 100).label}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-background/50 px-3 py-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">Scored</p>
                    <p
                      className={cn(
                        "font-tabular text-2xl font-semibold sm:text-3xl",
                        scoreTonePercent(activeSegment.value * 100).text,
                      )}
                    >
                      {formatScorePercent(activeSegment.value)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-background/50 px-3 py-2.5 text-center">
                    <p className="text-[10px] text-muted-foreground">Weight</p>
                    <p className="font-tabular text-2xl font-semibold text-foreground sm:text-3xl">
                      {formatPercent(activeSegment.weightPercent)}
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  {activeSegment.description}
                </p>

                <button
                  type="button"
                  onClick={() => onImproveClick(activeSegment.key, activeSegment.label)}
                  className="mt-3 flex min-h-10 w-full items-center justify-center rounded-lg border border-warning/35 bg-warning/12 text-sm font-medium text-warning transition-colors touch-manipulation hover:bg-warning/20 active:bg-warning/25 sm:min-h-9 sm:text-xs"
                >
                  Improve {activeSegment.label}
                </button>
              </div>

              {activeTips && (
                <div className="rounded-xl border border-border/70 bg-background/40 px-3 py-3 sm:px-4 sm:py-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    How to improve
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    You are at {formatScorePercent(activeSegment.value)} on this signal.
                  </p>
                  <ul className="mt-3 space-y-2">
                    {activeTips.map((tip) => (
                      <li
                        key={tip}
                        className="flex gap-2 text-sm leading-snug text-muted-foreground"
                      >
                        <span className="mt-0.5 shrink-0 text-accent" aria-hidden>
                          →
                        </span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-border/70 bg-card/50 px-4 py-8 text-center text-sm text-muted-foreground">
              Select a slice in the chart to see how to improve that signal.
            </div>
          )}
        </section>
      </div>
    </Card>
  );
}
