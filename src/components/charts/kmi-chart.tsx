"use client";

import { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { createChart, AreaSeries, type IChartApi } from "lightweight-charts";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";
import { useKMI } from "@/lib/hooks/use-kmi";
import { cn } from "@/lib/utils/cn";

interface KMIChartProps {
  height?: number;
  className?: string;
}

export function KMIChart({ height = 200, className }: KMIChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { resolvedTheme } = useTheme();
  const { value, change, changePercent, history, isPositive } = useKMI();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || history.length === 0) return;

    const colors = resolvedTheme === "dark" ? CHART_THEME_DARK : CHART_THEME_LIGHT;

    const chart = createChart(container, {
      height,
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
        fontFamily: "var(--font-geist-mono), monospace",
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { color: colors.grid },
      },
      crosshair: { mode: 0 },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      handleScroll: false,
      handleScale: false,
    });

    chartRef.current = chart;

    const series = chart.addSeries(AreaSeries, {
      lineColor: colors.accent,
      topColor: `${colors.accent}60`,
      bottomColor: `${colors.accent}05`,
      lineWidth: 2,
    });

    series.setData(history);
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
  }, [history, height, resolvedTheme]);

  return (
    <div className={cn("relative rounded-lg overflow-hidden", className)}>
      {/* Overlay label */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            KMI
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold text-gain uppercase tracking-wider">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
            </span>
            LIVE
          </span>
        </div>
        <span className="text-lg font-bold font-mono text-foreground">
          {value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <span
          className={cn(
            "text-xs font-mono font-semibold",
            isPositive ? "text-gain" : "text-loss"
          )}
        >
          {isPositive ? "+" : ""}
          {change.toFixed(2)} ({isPositive ? "+" : ""}
          {changePercent.toFixed(2)}%)
        </span>
      </div>

      <div ref={containerRef} className="w-full" />
    </div>
  );
}
