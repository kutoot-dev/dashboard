"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  date: string;
  count?: number;
  amount?: number;
}

interface TransactionChartProps {
  data: DataPoint[];
  dataKey?: "count" | "amount";
  color?: string;
  height?: number;
  label?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-glass-border bg-card px-3 py-2 shadow-lg">
      <p className="font-mono text-[10px] text-muted-foreground">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} className="font-mono text-xs font-semibold" style={{ color: p.color }}>
          {p.name === "amount" ? `₹${p.value.toLocaleString("en-IN")}` : p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export function TransactionChart({
  data,
  dataKey = "count",
  color = "var(--accent)",
  height = 200,
  label,
}: TransactionChartProps) {
  const chartData = useMemo(() => {
    return data.map((d) => ({
      ...d,
      date: new Date(d.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      }),
    }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div>
      {label && (
        <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id={`fill-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#fill-${dataKey})`}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
