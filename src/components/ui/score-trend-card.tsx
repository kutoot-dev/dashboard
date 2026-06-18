"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import {
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUB_SCORE_LABELS, SUB_SCORE_ORDER } from "@/lib/constants/scoring";
import {
  getCompositeScoreHistory,
  type CompositeScoreHistoryPoint,
} from "@/lib/api/services/merchant.service";
import type { ScoreBreakdown } from "@/lib/types";
import { getScoringWeight, type ScoringWeights } from "@/lib/utils/scoring-weights";
import { formatScorePercent, formatScorePercentDelta } from "@/lib/utils/format";

type ScoreInsight = {
  key: string;
  score: number;
  weight: number;
  weight_percent: number;
  contribution: number;
  is_top_performer: boolean;
  is_least_performer: boolean;
};

interface ScoreTrendCardProps {
  scoreBreakdown: ScoreBreakdown;
  weights?: ScoringWeights;
  scoreInsights?: ScoreInsight[];
  /**
   * The same composite score shown above the breakdown card. The chart's
   * rightmost point is pinned to this value so the breakdown header and
   * the line graph can never disagree.
   */
  compositeScore?: number;
  todayTransactions?: number;
}

const IST_TIME_ZONE = "Asia/Kolkata";
const MINUTES_PER_DAY = 24 * 60;

interface CompositePoint {
  /** Minute of day in IST, 0..1439. Used as the x-axis value. */
  minuteOfDay: number;
  composite: number;
}

ChartJS.register(LinearScale, PointElement, LineElement, ChartTooltip, Legend, Filler, zoomPlugin);

const istPartsFormatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: IST_TIME_ZONE,
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getIstParts(date: Date) {
  const parts = istPartsFormatter.formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function getIstMinuteOfDay(date = new Date()): number {
  const { hour, minute } = getIstParts(date);
  return hour * 60 + minute;
}

function getIstYmd(date = new Date()): string {
  const { year, month, day } = getIstParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMinuteLabel(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Read a CSS custom property from :root as a resolved string. SSR-safe. */
function resolveCssVar(name: string, fallback = "#888"): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

interface ChartColors {
  gain: string;
  loss: string;
  accent: string;
  grid: string;
  text: string;
}

/**
 * ScoreTrendCard — plots today's composite-score line on a fixed 24-hour
 * IST window (00:00 → 23:59). The line moves up and down with each
 * 1-minute snapshot persisted in `composite_score_history`, and the
 * rightmost point is pinned to the live composite score that the
 * breakdown card displays — so the two values are always identical.
 */
export function ScoreTrendCard({
  scoreBreakdown,
  weights,
  scoreInsights,
  compositeScore,
  todayTransactions = 0,
}: ScoreTrendCardProps) {
  const chartRef = useRef<ChartJS<"line"> | null>(null);
  const [xWindow, setXWindow] = useState({ start: 0, end: MINUTES_PER_DAY - 1 });

  // Resolve CSS custom properties to real colors whenever the theme switches.
  // Chart.js cannot parse CSS variables itself — we must pass concrete values.
  const { resolvedTheme } = useTheme();
  const colors = useMemo<ChartColors>(
    () => {
      const isDark = resolvedTheme === "dark";
      return {
        gain: resolveCssVar("--gain") || (isDark ? "#2dd4bf" : "#14b8a6"),
        loss: resolveCssVar("--loss") || "#fb7185",
        accent: resolveCssVar("--accent") || (isDark ? "#38bdf8" : "#22d3ee"),
        grid: resolveCssVar("--chart-grid") || (isDark ? "rgba(126,148,228,0.22)" : "rgba(127,136,190,0.28)"),
        text: resolveCssVar("--chart-text") || (isDark ? "#9fafd9" : "#60709f"),
      };
    },
    [resolvedTheme],
  );

  useEffect(() => {
    chartRef.current?.update();
  }, [colors]);

  const chartData = useMemo(
    () => {
      if (scoreInsights?.length) {
        return scoreInsights.map((segment) => ({
          key: segment.key,
          label: SUB_SCORE_LABELS[segment.key] ?? segment.key,
          score: Number(segment.score.toFixed(3)),
          weight: segment.weight,
          weightPercent: segment.weight * 100,
          contribution: Number(segment.contribution.toFixed(4)),
        }));
      }

      return SUB_SCORE_ORDER.map((key) => {
        const score = Number(scoreBreakdown[key] ?? 0);
        const weight = getScoringWeight(key, SUB_SCORE_ORDER, weights);
        const contribution = score * weight;
        return {
          key,
          label: SUB_SCORE_LABELS[key] ?? key,
          score: Number(score.toFixed(3)),
          weight,
          weightPercent: Math.round(weight * 100),
          contribution: Number(contribution.toFixed(4)),
        };
      });
    },
    [scoreBreakdown, scoreInsights, weights],
  );

  const headerComposite =
    typeof compositeScore === "number" && Number.isFinite(compositeScore) ? compositeScore : 0;

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-composite-score-history", 24],
    queryFn: () => getCompositeScoreHistory(24),
    refetchInterval: 60_000,
    retry: false,
  });

  const history = data?.success ? data.data : null;

  // ── Build today's series, pinned to the dashboard composite ──────────────
  const { series, currentMinute, dayHigh, dayLow, openComposite } = useMemo(() => {
    const todayYmd = getIstYmd();
    const minuteNow = getIstMinuteOfDay();

    const todaysPoints: CompositePoint[] = (history?.series ?? [])
      .filter((point: CompositeScoreHistoryPoint) => {
        const date = new Date(point.recorded_at);
        return getIstYmd(date) === todayYmd;
      })
      .map((point: CompositeScoreHistoryPoint) => ({
        minuteOfDay: getIstMinuteOfDay(new Date(point.recorded_at)),
        composite: Number(point.composite_score) || 0,
      }))
      .sort((a, b) => a.minuteOfDay - b.minuteOfDay);

    // Always pin the latest point to the breakdown's composite at "now",
    // so the chart tip and the breakdown header are guaranteed to match.
    const livePoint: CompositePoint = {
      minuteOfDay: minuteNow,
      composite: headerComposite,
    };

    // Drop any historical bucket whose minute equals "now" so we don't
    // overwrite the pinned live value with a slightly stale snapshot.
    const merged = todaysPoints.filter((p) => p.minuteOfDay < minuteNow);
    merged.push(livePoint);

    const composites = merged.map((p) => p.composite);
    const high = composites.length > 0 ? Math.max(...composites) : headerComposite;
    const low = composites.length > 0 ? Math.min(...composites) : headerComposite;
    const open = composites.length > 0 ? composites[0] : headerComposite;

    return {
      series: merged,
      currentMinute: minuteNow,
      dayHigh: high,
      dayLow: low,
      openComposite: open,
    };
  }, [history, headerComposite]);

  const windowDelta = Number((headerComposite - openComposite).toFixed(3));
  const isUp = windowDelta >= 0;
  const lineStroke = isUp ? colors.gain : colors.loss;

  const visibleSeries = useMemo(
    () =>
      series.filter(
        (point) => point.minuteOfDay >= xWindow.start && point.minuteOfDay <= xWindow.end,
      ),
    [series, xWindow],
  );

  // Keep y-domain tight for the currently visible x-range so minute-level
  // changes remain obvious when zoomed in.
  const yRangeSource = visibleSeries.length > 0 ? visibleSeries : series;
  const visibleHigh =
    yRangeSource.length > 0
      ? Math.max(...yRangeSource.map((point) => point.composite))
      : headerComposite;
  const visibleLow =
    yRangeSource.length > 0
      ? Math.min(...yRangeSource.map((point) => point.composite))
      : headerComposite;
  const visibleRange = Math.abs(visibleHigh - visibleLow);
  const yPadding = Math.max(visibleRange * 0.35, 0.03);
  const yMin = Math.max(0, Number((visibleLow - yPadding).toFixed(4)));
  const yMax = Math.min(100, Number((visibleHigh + yPadding).toFixed(4)));

  const compositeLineData = useMemo<ChartData<"line">>(
    () => ({
      datasets: [
        {
          label: "Composite",
          data: series.map((point) => ({ x: point.minuteOfDay, y: point.composite })),
          borderColor: lineStroke,
          borderWidth: 2,
          pointRadius: 0,
          pointHitRadius: 10,
          tension: 0.2,
        },
      ],
    }),
    [lineStroke, series],
  );

  const chartOptions = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      parsing: false,
      animation: {
        duration: 220,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(15,23,42,0.88)",
          titleColor: colors.text,
          bodyColor: colors.gain,
          borderColor: colors.grid,
          borderWidth: 1,
          callbacks: {
            title: (items) => {
              if (!items.length) {
                return "";
              }
              const minute = Number(items[0].parsed.x);
              return `IST ${formatMinuteLabel(minute)}`;
            },
            label: (item) => `Composite ${formatScorePercent(Number(item.parsed.y))}`,
          },
        },
        zoom: {
          pan: {
            enabled: true,
            mode: "x",
            onPanComplete: ({ chart }) => {
              const xScale = chart.scales.x;
              setXWindow({
                start: Math.max(0, Math.floor(xScale.min)),
                end: Math.min(MINUTES_PER_DAY - 1, Math.ceil(xScale.max)),
              });
            },
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            drag: {
              enabled: true,
              borderColor: colors.accent,
              borderWidth: 1,
              backgroundColor: `${colors.accent}26`,
            },
            mode: "x",
            onZoomComplete: ({ chart }) => {
              const xScale = chart.scales.x;
              setXWindow({
                start: Math.max(0, Math.floor(xScale.min)),
                end: Math.min(MINUTES_PER_DAY - 1, Math.ceil(xScale.max)),
              });
            },
          },
          limits: {
            x: {
              min: 0,
              max: MINUTES_PER_DAY - 1,
              minRange: 5,
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          min: xWindow.start,
          max: xWindow.end,
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            maxTicksLimit: 9,
            callback: (value) => formatMinuteLabel(Number(value)),
          },
        },
        y: {
          min: yMin,
          max: yMax,
          grid: {
            color: colors.grid,
          },
          ticks: {
            color: colors.text,
            callback: (value) => formatScorePercent(Number(value)),
          },
        },
      },
    }),
    [xWindow, yMin, yMax, colors],
  );

  const applyZoomWindow = (minutes: number) => {
    const end = currentMinute;
    const start = Math.max(0, end - minutes);

    setXWindow({ start, end });

    const chart = chartRef.current;
    if (chart) {
      chart.zoomScale("x", { min: start, max: end }, "default");
      chart.update("none");
    }
  };

  const resetZoom = () => {
    setXWindow({ start: 0, end: MINUTES_PER_DAY - 1 });
    const chart = chartRef.current as ChartJS<"line"> & { resetZoom?: () => void };
    chart?.resetZoom?.();
  };

  const topDriver = chartData.reduce((top, current) =>
    current.contribution > top.contribution ? current : top,
  );

  return (
    <Card className="space-y-4 border border-primary/22 bg-card/72 p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Composite score · Today (24h, IST)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Same composite as the breakdown card. Traces minute-by-minute changes from 00:00 to
            23:59 IST.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Badge variant="neutral">Now {formatScorePercent(headerComposite)}</Badge>
          <Badge variant={isUp ? "gain" : "loss"}>
            {formatScorePercentDelta(windowDelta)} today
          </Badge>
        </div>
      </div>

      <div className="h-[200px] w-full min-w-0 sm:h-[260px]">
        {isLoading && series.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading composite score history…
          </div>
        ) : (
          <Line ref={chartRef} data={compositeLineData} options={chartOptions} />
        )}
      </div>

      <div className="flex flex-col gap-2 text-xs sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
          <span className="shrink-0 text-muted-foreground">Zoom</span>
          {(
            [
              { label: "15m", minutes: 15 },
              { label: "1h", minutes: 60 },
              { label: "6h", minutes: 360 },
            ] as const
          ).map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyZoomWindow(preset.minutes)}
              className="shrink-0 min-h-9 rounded-lg border border-border bg-background px-3 py-1.5 touch-manipulation hover:bg-muted active:bg-muted/80"
            >
              {preset.label}
            </button>
          ))}
          <button
            type="button"
            onClick={resetZoom}
            className="shrink-0 min-h-9 rounded-lg border border-border bg-background px-3 py-1.5 touch-manipulation hover:bg-muted active:bg-muted/80"
          >
            24h
          </button>
        </div>
        <span className="text-muted-foreground sm:ml-auto sm:text-right">
          <span className="hidden sm:inline">
            Drag to zoom, wheel or pinch to zoom, drag horizontally to pan.
          </span>
          <span className="sm:hidden">Pinch or drag the chart to explore.</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div className="rounded-md border border-accent/35 bg-accent/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Open (00:00)</p>
          <p className="font-tabular text-sm font-semibold text-accent">{formatScorePercent(openComposite)}</p>
        </div>
        <div className="rounded-md border border-gain/35 bg-gain/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Day High</p>
          <p className="font-tabular text-sm font-semibold text-gain">{formatScorePercent(dayHigh)}</p>
        </div>
        <div className="rounded-md border border-loss/35 bg-loss/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Day Low</p>
          <p className="font-tabular text-sm font-semibold text-loss">{formatScorePercent(dayLow)}</p>
        </div>
        
      </div>

      
    </Card>
  );
}
