"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SUB_SCORE_LABELS, SUB_SCORE_ORDER } from "@/lib/constants/scoring";
import {
  getCompositeScoreHistory,
  type CompositeScoreHistoryPoint,
} from "@/lib/api/services/merchant.service";
import type { ScoreBreakdown } from "@/lib/types";
import { getScoringWeight, type ScoringWeights } from "@/lib/utils/scoring-weights";

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
const X_AXIS_TICKS = [0, 180, 360, 540, 720, 900, 1080, 1260, 1439];

interface CompositePoint {
  /** Minute of day in IST, 0..1439. Used as the x-axis value. */
  minuteOfDay: number;
  composite: number;
}

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

/**
 * ScoreTrendCard — plots today's composite-score line on a fixed 24-hour
 * IST window (00:00 → 23:59). The line moves up and down with each
 * 5-minute snapshot persisted in `composite_score_history`, and the
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
  const chartData = useMemo(
    () => {
      if (scoreInsights?.length) {
        return scoreInsights.map((segment) => ({
          key: segment.key,
          label: SUB_SCORE_LABELS[segment.key] ?? segment.key,
          score: Number(segment.score.toFixed(2)),
          weight: segment.weight,
          weightPercent: segment.weight * 100,
          contribution: Number(segment.contribution.toFixed(2)),
        }));
      }

      return SUB_SCORE_ORDER.map((key) => {
        const score = Number(scoreBreakdown[key] ?? 0);
        const weight = getScoringWeight(key, SUB_SCORE_ORDER, weights);
        const contribution = score * weight;
        return {
          key,
          label: SUB_SCORE_LABELS[key] ?? key,
          score: Number(score.toFixed(2)),
          weight,
          weightPercent: Math.round(weight * 100),
          contribution: Number(contribution.toFixed(2)),
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

  const windowDelta = Number((headerComposite - openComposite).toFixed(2));
  const isUp = windowDelta >= 0;
  const lineStroke = isUp ? "var(--gain)" : "var(--loss)";

  const yMin = Math.max(0, Math.floor(dayLow - 4));
  const yMax = Math.min(100, Math.ceil(dayHigh + 4));

  const topDriver = chartData.reduce((top, current) =>
    current.contribution > top.contribution ? current : top,
  );

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Composite Score · Today (24h, IST)
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Same composite as the breakdown card. The line traces every 5-minute change recorded today
            from 00:00 to 23:59 IST.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="neutral">Now {headerComposite.toFixed(2)}</Badge>
          <Badge variant={isUp ? "gain" : "loss"}>
            {isUp ? "+" : ""}
            {windowDelta.toFixed(2)} today
          </Badge>
        </div>
      </div>

      <div style={{ width: "100%", height: 260, minWidth: 0, minHeight: 0 }}>
        {isLoading && series.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
            Loading composite score history…
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
              <XAxis
                dataKey="minuteOfDay"
                type="number"
                domain={[0, MINUTES_PER_DAY - 1]}
                ticks={X_AXIS_TICKS}
                tickFormatter={(value) => formatMinuteLabel(Number(value))}
                tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--chart-text)" }}
                tickLine={false}
                axisLine={false}
                width={48}
                domain={[yMin, yMax]}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (name === "composite") {
                    return [Number(value).toFixed(2), "Composite"];
                  }
                  return [String(value), String(name)];
                }}
                labelFormatter={(value) => `IST ${formatMinuteLabel(Number(value))}`}
              />
              <ReferenceLine y={openComposite} stroke="var(--chart-crosshair)" strokeDasharray="4 4" />
              <ReferenceLine x={currentMinute} stroke="var(--accent)" strokeDasharray="2 4" />
              <Line
                type="monotone"
                dataKey="composite"
                stroke={lineStroke}
                strokeWidth={2}
                dot={false}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
        <div className="rounded-md border border-accent/35 bg-accent/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Open (00:00)</p>
          <p className="font-tabular text-sm font-semibold text-accent">{openComposite.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-gain/35 bg-gain/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Day High</p>
          <p className="font-tabular text-sm font-semibold text-gain">{dayHigh.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-loss/35 bg-loss/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Day Low</p>
          <p className="font-tabular text-sm font-semibold text-loss">{dayLow.toFixed(2)}</p>
        </div>
        <div className="rounded-md border border-primary/35 bg-primary/10 px-2.5 py-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Top Driver</p>
          <p className="truncate text-sm font-semibold text-primary" title={topDriver.label}>
            {topDriver.label}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-md border border-accent/35 bg-muted/45 p-3 text-xs text-muted-foreground">
        <p>
          Each plotted point is a 5-minute snapshot of your live composite score — the exact same value the
          breakdown card shows. The line rises when the composite grows and falls when it drops.
        </p>
        <p>
          Today’s top driver: <span className="font-semibold text-foreground">{topDriver.label}</span>{" "}
          ({topDriver.contribution.toFixed(2)} pts). Today’s transaction count:{" "}
          <span className="font-semibold text-foreground">{todayTransactions}</span>.
        </p>
      </div>
    </Card>
  );
}
