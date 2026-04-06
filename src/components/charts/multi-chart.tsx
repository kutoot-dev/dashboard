"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  CandlestickSeries,
  AreaSeries,
  LineSeries,
  BaselineSeries,
  type IChartApi,
} from "lightweight-charts";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";
import type { ScoreCandlestick } from "@/lib/types";

export type ChartType = "candle" | "line" | "area" | "baseline";

interface MultiChartProps {
  type: ChartType;
  candleData?: ScoreCandlestick[];
  lineData?: { time: string; value: number }[];
  baseline?: number;
  height?: number;
}

export function MultiChart({
  type,
  candleData,
  lineData,
  baseline = 50,
  height = 400,
}: MultiChartProps) {
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
      rightPriceScale: { borderColor: colors.grid },
      timeScale: { borderColor: colors.grid, timeVisible: false },
    });

    chartRef.current = chart;

    // Derive lineData from candleData closes if needed
    const resolvedLineData =
      lineData ??
      candleData?.map((c) => ({ time: c.time, value: c.close })) ??
      [];

    if (type === "candle" && candleData) {
      const series = chart.addSeries(CandlestickSeries, {
        upColor: colors.gain,
        downColor: colors.loss,
        borderUpColor: colors.gain,
        borderDownColor: colors.loss,
        wickUpColor: colors.gain,
        wickDownColor: colors.loss,
      });
      series.setData(candleData);
    } else if (type === "line") {
      const series = chart.addSeries(LineSeries, {
        color: colors.accent,
        lineWidth: 2,
      });
      series.setData(resolvedLineData);
    } else if (type === "area") {
      const series = chart.addSeries(AreaSeries, {
        lineColor: colors.accent,
        topColor: `${colors.accent}80`,
        bottomColor: `${colors.accent}05`,
        lineWidth: 2,
      });
      series.setData(resolvedLineData);
    } else if (type === "baseline") {
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
      series.setData(resolvedLineData);
    }

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [type, candleData, lineData, baseline, height, resolvedTheme]);

  return <div ref={containerRef} className="w-full" />;
}
