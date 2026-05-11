"use client";

import {
  Area,
  AreaChart as ReAreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface AreaPoint {
  time: string;
  value: number;
}

interface AreaChartProps {
  data: AreaPoint[];
  height?: number;
  color?: string;
}

export function AreaChart({ data, height = 220, color = "var(--accent)" }: AreaChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-55 w-full" />;
  }

  return (
    <div style={{ width: "100%", height, minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <ReAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--chart-text)" }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} tickLine={false} axisLine={false} width={36} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.24} strokeWidth={2.2} />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
