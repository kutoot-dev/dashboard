"use client";

import { createChart, HistogramSeries, type IChartApi } from "lightweight-charts";
import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";
import type { VolumeBar } from "@/lib/types";

interface VolumeChartProps {
  data: VolumeBar[];
  height?: number;
}

export function VolumeChart({ data, height = 120 }: VolumeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = resolvedTheme === "dark" ? CHART_THEME_DARK : CHART_THEME_LIGHT;

    const chart = createChart(container, {
      height,
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
        fontFamily: "var(--font-geist-mono), monospace",
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: colors.crosshair },
        horzLine: { color: colors.crosshair },
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(HistogramSeries);
    series.setData(data);
    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        chart.applyOptions({ width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height, resolvedTheme]);

  return <div ref={containerRef} className="w-full" />;
}
