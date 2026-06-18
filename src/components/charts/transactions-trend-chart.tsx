"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINRDecimal } from "@/lib/utils/format";
import type { TransactionChartPoint } from "@/lib/utils/transactions-chart";

export type TransactionChartMetric = "count" | "amount";

interface TransactionsTrendChartProps {
  data: TransactionChartPoint[];
  metric: TransactionChartMetric;
  height?: number;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: TransactionChartPoint }[];
}) {
  if (!active || !payload?.[0]?.payload) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-lg border border-border/80 bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-foreground">
        {new Date(`${point.date}T12:00:00`).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>
      <p className="mt-1 text-muted-foreground">
        <span className="text-foreground">{point.count}</span> transaction{point.count === 1 ? "" : "s"}
      </p>
      <p className="text-muted-foreground">
        Gross bill <span className="font-mono text-foreground">{formatINRDecimal(point.amount)}</span>
      </p>
    </div>
  );
}

export function TransactionsTrendChart({
  data,
  metric,
  height = 240,
}: TransactionsTrendChartProps) {
  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-border/70 text-sm text-muted-foreground"
        style={{ height }}
      >
        No transaction data for this date range.
      </div>
    );
  }

  const isCount = metric === "count";

  return (
    <div style={{ width: "100%", height, minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "var(--chart-text)" }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            yAxisId="main"
            tick={{ fontSize: 10, fill: "var(--chart-text)" }}
            tickLine={false}
            axisLine={false}
            width={isCount ? 28 : 52}
            allowDecimals={!isCount}
            tickFormatter={(value: number) =>
              isCount
                ? String(Math.round(value))
                : new Intl.NumberFormat("en-IN", {
                    notation: "compact",
                    maximumFractionDigits: 1,
                  }).format(value)
            }
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--primary)", fillOpacity: 0.06 }} />
          {isCount ? (
            <Bar
              yAxisId="main"
              dataKey="count"
              fill="var(--secondary)"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          ) : (
            <Area
              yAxisId="main"
              type="monotone"
              dataKey="amount"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
