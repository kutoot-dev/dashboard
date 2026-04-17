"use client";

import { createChart, AreaSeries, type IChartApi } from "lightweight-charts";
import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";

interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparklineChart({ data, width = 100, height = 32, color }: SparklineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !Array.isArray(data) || data.length === 0) return;

    const colors = resolvedTheme === "dark" ? CHART_THEME_DARK : CHART_THEME_LIGHT;
    const trend = data[data.length - 1] > data[0];
    const lineColor = color ?? (trend ? colors.gain : colors.loss);

    const chart = createChart(container, {
      width,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "transparent",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
      },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor,
      topColor: `${lineColor}33`,
      bottomColor: `${lineColor}05`,
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });

    const seriesData = data.map((value, index) => ({
      time: `2025-01-${String(index + 1).padStart(2, "0")}` as string,
      value,
    }));

    series.setData(seriesData);
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data, width, height, color, resolvedTheme]);

  return <div ref={containerRef} style={{ width, height }} />;
}
