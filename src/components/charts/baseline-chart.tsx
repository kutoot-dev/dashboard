"use client";

import { createChart, BaselineSeries, type IChartApi } from "lightweight-charts";
import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";

interface BaselineChartProps {
  data: { time: string; value: number }[];
  baseline?: number;
  height?: number;
}

export function BaselineChart({ data, baseline = 50, height = 300 }: BaselineChartProps) {
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
      crosshair: {
        vertLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshair },
        horzLine: { color: colors.crosshair, labelBackgroundColor: colors.crosshair },
      },
      rightPriceScale: {
        borderColor: colors.grid,
      },
      timeScale: {
        borderColor: colors.grid,
        timeVisible: false,
      },
    });

    chartRef.current = chart;

    const series = chart.addSeries(BaselineSeries, {
      baseValue: { type: "price", price: baseline },
      topLineColor: colors.gain,
      topFillColor1: `${colors.gain}40`,
      topFillColor2: `${colors.gain}05`,
      bottomLineColor: colors.loss,
      bottomFillColor1: `${colors.loss}05`,
      bottomFillColor2: `${colors.loss}40`,
      lineWidth: 2,
    });

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
  }, [data, baseline, height, resolvedTheme]);

  return <div ref={containerRef} className="w-full" />;
}
