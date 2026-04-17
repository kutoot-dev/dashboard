"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BaselinePoint {
  time: string;
  value: number;
}

interface BaselineChartProps {
  data: BaselinePoint[];
  baseline: number;
  height?: number;
}

export function BaselineChart({ data, baseline, height = 220 }: BaselineChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-[220px] w-full" />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip />
          <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
