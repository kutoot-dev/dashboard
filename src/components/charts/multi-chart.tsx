"use client";

import type { ChartType } from "@/components/ui/chart-type-switcher";
import type { ScoreCandlestick } from "@/lib/types";
import { AreaChart } from "./area-chart";
import { BaselineChart } from "./baseline-chart";
import { CandlestickChart } from "./candlestick-chart";

interface LinePoint {
  time: string;
  value: number;
}

interface MultiChartProps {
  type: ChartType;
  candleData: ScoreCandlestick[];
  lineData: LinePoint[];
  baseline?: number;
  height?: number;
}

export function MultiChart({ type, candleData, lineData, baseline = 50, height = 260 }: MultiChartProps) {
  if (type === "candle") {
    return <CandlestickChart data={candleData} height={height} />;
  }

  if (type === "baseline") {
    return <BaselineChart data={lineData} baseline={baseline} height={height} />;
  }

  return <AreaChart data={lineData} height={height} />;
}
