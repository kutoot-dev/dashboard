"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ScoreCandlestick } from "@/lib/types";

interface CandlestickChartProps {
  data: ScoreCandlestick[];
  height?: number;
}

export function CandlestickChart({ data, height = 260 }: CandlestickChartProps) {
  const transformed = data.map((d) => ({ time: d.time, value: d.close }));

  if (transformed.length === 0) {
    return <div style={{ width: "100%", height }} />;
  }

  return (
    <div style={{ width: "100%", height, minWidth: 0, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={transformed}>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={20} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
