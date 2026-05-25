"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINR } from "@/lib/utils/format";
import type { BonusPayoutChartPoint } from "@/lib/utils/payouts-chart";

export type BonusPayoutChartView = "share" | "pool" | "both";

interface BonusPayoutTrendChartProps {
  data: BonusPayoutChartPoint[];
  view?: BonusPayoutChartView;
  height?: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: BonusPayoutChartPoint }[];
}) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-border/80 bg-card/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur-md">
      <p className="font-medium text-foreground">
        {new Date(`${point.date}T12:00:00`).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
        {point.isEstimate ? (
          <span className="ml-2 rounded-md bg-gold/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
            Estimate
          </span>
        ) : null}
      </p>
      <p className="mt-1.5 text-muted-foreground">
        Your share{" "}
        <span className="font-mono font-semibold text-gold">{formatINR(point.share)}</span>
      </p>
      <p className="text-muted-foreground">
        Bonus pool{" "}
        <span className="font-mono text-foreground">{formatINR(point.pool)}</span>
      </p>
      {typeof point.rank === "number" ? (
        <p className="mt-1 text-muted-foreground">
          Rank <span className="font-mono font-semibold text-accent">#{point.rank}</span>
        </p>
      ) : null}
    </div>
  );
}

function compactInr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

export function BonusPayoutTrendChart({
  data,
  view = "both",
  height = 280,
}: BonusPayoutTrendChartProps) {
  if (!data.length) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gold/25 bg-gold/5 text-center text-sm text-muted-foreground"
        style={{ height }}
      >
        <span className="text-2xl opacity-60" aria-hidden>
          📈
        </span>
        <p>No payout history yet — your trend will appear after the first bonus day closes.</p>
      </div>
    );
  }

  const showShare = view === "share" || view === "both";
  const showPool = view === "pool" || view === "both";

  return (
    <div style={{ width: "100%", height, minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: showPool && showShare ? 48 : 12, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="bonusShareGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--gold)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--gold)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "var(--chart-text)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          {showShare ? (
            <YAxis
              yAxisId="share"
              orientation="left"
              tick={{ fontSize: 10, fill: "var(--chart-text)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={compactInr}
            />
          ) : null}
          {showPool ? (
            <YAxis
              yAxisId="pool"
              orientation={showShare ? "right" : "left"}
              tick={{ fontSize: 10, fill: "var(--chart-text)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={compactInr}
            />
          ) : null}
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--gold)", strokeOpacity: 0.35 }} />
          {showShare ? (
            <Area
              yAxisId="share"
              type="monotone"
              dataKey="share"
              stroke="var(--gold)"
              fill="url(#bonusShareGradient)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--gold)", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "var(--gold)", stroke: "var(--card-solid)", strokeWidth: 2 }}
            />
          ) : null}
          {showPool ? (
            <Line
              yAxisId="pool"
              type="monotone"
              dataKey="pool"
              stroke="var(--accent)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              activeDot={{ r: 4, fill: "var(--accent)" }}
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
