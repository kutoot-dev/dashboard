"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { VolumeBar } from "@/lib/types";

interface VolumeChartProps {
  data: VolumeBar[];
  height?: number;
}

export function VolumeChart({ data, height = 120 }: VolumeChartProps) {
  if (!data || data.length === 0) {
    return <div style={{ width: "100%", height }} />;
  }

  return (
    <div style={{ width: "100%", height, minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--chart-text)" }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10, fill: "var(--chart-text)" }} tickLine={false} axisLine={false} width={36} />
          <Tooltip />
          <Bar dataKey="value" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
