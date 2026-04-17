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

export function AreaChart({ data, height = 220, color = "#2dd4bf" }: AreaChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-[220px] w-full" />;
  }

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <ReAreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.18)" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.2} strokeWidth={2} />
        </ReAreaChart>
      </ResponsiveContainer>
    </div>
  );
}
