"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  createChart,
  CandlestickSeries,
  HistogramSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type HistogramData,
  type Time,
} from "lightweight-charts";
import { CHART_THEME_DARK, CHART_THEME_LIGHT } from "@/lib/constants/theme";
import { fetchChartHistory, type Resolution, type ChartMetric } from "@/lib/api/services/chart-data.service";
import { useScoreTick } from "@/lib/hooks/use-score-tick";
import { cn } from "@/lib/utils/cn";

const RESOLUTIONS: { label: string; value: Resolution }[] = [
  { label: "1m",  value: "1"  },
  { label: "5m",  value: "5"  },
  { label: "15m", value: "15" },
  { label: "30m", value: "30" },
  { label: "1H",  value: "60" },
  { label: "D",   value: "D"  },
  { label: "W",   value: "W"  },
];

interface OhlcDisplay {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingViewChartProps {
  /** Merchant location ID (branch). Used to build the symbol LOC_{id}. */
  locationId: number;
  height?: number;
  className?: string;
  /** Show the resolution toolbar */
  showToolbar?: boolean;
  /** Show the live-tick OHLC overlay */
  showOhlcOverlay?: boolean;
  /** Initial resolution */
  defaultResolution?: Resolution;
  /** Initial metric — 'score' shows composite score OHLC, 'rank' shows rank OHLC (lower is better, axis inverted). */
  defaultMetric?: ChartMetric;
  /** Hide the metric toggle (Score | Rank). */
  hideMetricToggle?: boolean;
}

/**
 * TradingViewChart — full OHLCV candlestick chart powered by lightweight-charts v5
 * with:
 *  - Candlestick + volume dual-pane layout
 *  - Resolution switcher (1m, 5m, 15m, 30m, 1H, D, W)
 *  - Real-time tick updates via Laravel Reverb (useScoreTick)
 *  - OHLCV overlay panel
 *  - Dark / light theme from next-themes
 *  - Auto-resize via ResizeObserver
 */
export function TradingViewChart({
  locationId,
  height = 400,
  className,
  showToolbar = true,
  showOhlcOverlay = true,
  defaultResolution = "5",
  defaultMetric = "score",
  hideMetricToggle = false,
}: TradingViewChartProps) {
  const containerRef       = useRef<HTMLDivElement>(null);
  const chartRef           = useRef<IChartApi | null>(null);
  const candleSeriesRef    = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef    = useRef<ISeriesApi<"Histogram"> | null>(null);
  const { resolvedTheme }  = useTheme();

  const [resolution, setResolution] = useState<Resolution>(defaultResolution);
  const [metric,     setMetric]     = useState<ChartMetric>(defaultMetric);
  const [isLoading,  setIsLoading]  = useState(true);
  const [ohlc,       setOhlc]       = useState<OhlcDisplay | null>(null);
  const [barsLoaded, setBarsLoaded] = useState(0);

  // Real-time ticks from Reverb
  const { latest, connected } = useScoreTick(locationId);

  // ── Chart initialisation ───────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = resolvedTheme === "dark" ? CHART_THEME_DARK : CHART_THEME_LIGHT;

    const chart = createChart(container, {
      height,
      layout: {
        background:  { color: colors.background },
        textColor:   colors.text,
        fontFamily:  "var(--font-geist-mono), 'SF Mono', monospace",
        fontSize:    11,
      },
      grid: {
        vertLines: { color: colors.grid, style: 2 },
        horzLines: { color: colors.grid, style: 2 },
      },
      crosshair: {
        mode: 1,
        vertLine:  { color: colors.crosshair, style: 1, labelBackgroundColor: colors.accent },
        horzLine:  { color: colors.crosshair, style: 1, labelBackgroundColor: colors.accent },
      },
      rightPriceScale: {
        borderColor:  colors.grid,
        scaleMargins: { top: 0.08, bottom: 0.30 },
        invertScale:  metric === "rank",
      },
      timeScale: {
        borderColor:     colors.grid,
        timeVisible:     true,
        secondsVisible:  resolution === "1",
        tickMarkFormatter: (time: Time) => {
          const d = new Date(Number(time) * 1000);
          if (resolution === "D" || resolution === "W" || resolution === "M") {
            return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
          }
          return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
        },
      },
      handleScroll:  { mouseWheel: true, pressedMouseMove: true },
      handleScale:   { mouseWheel: true, axisPressedMouseMove: true },
    });

    chartRef.current = chart;

    // Candlestick series — when showing rank, lower close = better, so the up/down
    // colour mapping must be inverted (close < open is actually a *gain* of rank).
    const upColor   = metric === "rank" ? colors.loss : colors.gain;
    const downColor = metric === "rank" ? colors.gain : colors.loss;
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor:          upColor,
      downColor:        downColor,
      borderUpColor:    upColor,
      borderDownColor:  downColor,
      wickUpColor:      upColor,
      wickDownColor:    downColor,
    });
    candleSeriesRef.current = candleSeries;

    // Volume histogram (overlaid in lower 25% of pane)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat:      { type: "volume" },
      priceScaleId:     "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.80, bottom: 0.00 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Crosshair hover → update OHLC overlay
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !candleSeriesRef.current) return;
      const bar = param.seriesData.get(candleSeriesRef.current) as CandlestickData | undefined;
      const vol = param.seriesData.get(volumeSeriesRef.current!) as HistogramData | undefined;
      if (bar) {
        setOhlc({ open: bar.open, high: bar.high, low: bar.low, close: bar.close, volume: vol?.value ?? 0 });
      }
    });

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(container);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current       = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, [resolvedTheme, height, resolution, metric]);

  // ── Load historical bars whenever resolution changes ────────────────────────
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    setIsLoading(true);

    const to   = Math.floor(Date.now() / 1000);
    const fromMap: Record<string, number> = {
      "1": 60 * 60 * 4,          // 4h
      "5": 60 * 60 * 12,         // 12h
      "15": 60 * 60 * 24,        // 1d
      "30": 60 * 60 * 48,        // 2d
      "60": 60 * 60 * 72,        // 3d
      "D": 86400 * 60,           // 60d
      "W": 86400 * 365,          // 1y
      "M": 86400 * 365 * 2,      // 2y
    };
    const from = to - (fromMap[resolution] ?? 86400);

    fetchChartHistory(locationId, resolution, from, to, undefined, metric)
      .then((bars) => {
        if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
        if (bars.length === 0) {
          setBarsLoaded(0);
          setOhlc(null);
          setIsLoading(false);
          return;
        }
        const candles: CandlestickData[] = bars.map((b) => ({
          time:  b.time as Time,
          open:  b.open,
          high:  b.high,
          low:   b.low,
          close: b.close,
        }));
        const volumes: HistogramData[] = bars.map((b, i) => ({
          time:  b.time as Time,
          value: b.volume,
          color: b.close >= b.open
            ? (resolvedTheme === "dark" ? "rgba(0,255,136,0.35)" : "rgba(22,163,74,0.45)")
            : (resolvedTheme === "dark" ? "rgba(255,51,102,0.35)" : "rgba(220,38,38,0.45)"),
        }));

        candleSeriesRef.current.setData(candles);
        volumeSeriesRef.current.setData(volumes);
        chartRef.current?.timeScale().fitContent();
        setBarsLoaded(bars.length);

        const last = bars[bars.length - 1];
        setOhlc({ open: last.open, high: last.high, low: last.low, close: last.close, volume: last.volume });
      })
      .catch(() => {
        // Missing or unavailable chart history should not crash the dashboard.
        setBarsLoaded(0);
        setOhlc(null);
      })
      .finally(() => setIsLoading(false));
  }, [locationId, resolution, resolvedTheme, metric]);

  // ── Real-time tick streaming ───────────────────────────────────────────────
  useEffect(() => {
    if (!latest || !candleSeriesRef.current || !volumeSeriesRef.current) return;
    // Only apply 1-min/5-min resolution ticks in real time, and only for the
    // score metric (rank ticks are computed separately by the backend).
    if (metric !== "score") return;
    if (resolution !== "1" && resolution !== "5") return;

    const tick = latest.tick;
    const candle: CandlestickData = {
      time:  tick.time as Time,
      open:  tick.open,
      high:  tick.high,
      low:   tick.low,
      close: tick.close,
    };
    const vol: HistogramData = {
      time:  tick.time as Time,
      value: tick.volume,
      color: tick.close >= tick.open
        ? (resolvedTheme === "dark" ? "rgba(0,255,136,0.35)" : "rgba(22,163,74,0.45)")
        : (resolvedTheme === "dark" ? "rgba(255,51,102,0.35)" : "rgba(220,38,38,0.45)"),
    };

    candleSeriesRef.current.update(candle);
    volumeSeriesRef.current.update(vol);
    setOhlc({ open: tick.open, high: tick.high, low: tick.low, close: tick.close, volume: tick.volume });
  }, [latest, resolution, resolvedTheme, metric]);

  const handleResolutionChange = useCallback((r: Resolution) => {
    setResolution(r);
    setBarsLoaded(0);
  }, []);

  const isUp = (ohlc?.close ?? 0) >= (ohlc?.open ?? 0);
  // When displaying rank, "close < open" means rank improved → treat as gain.
  const isGain = metric === "rank" ? !isUp : isUp;
  const colors  = resolvedTheme === "dark" ? CHART_THEME_DARK : CHART_THEME_LIGHT;

  return (
    <div className={cn("relative flex flex-col rounded-lg overflow-hidden border border-border/40", className)}>
      {/* ── Top toolbar ────────────────────────────────────────────────────── */}
      {showToolbar && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-background/80 border-b border-border/30 gap-4">
          {/* OHLCV overlay */}
          {showOhlcOverlay && ohlc && (
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-muted-foreground">O</span>
              <span className={isGain ? "text-gain" : "text-loss"}>
                {metric === "rank" ? `#${ohlc.open.toFixed(0)}` : ohlc.open.toFixed(4)}
              </span>
              <span className="text-muted-foreground">H</span>
              <span className={isGain ? "text-gain" : "text-loss"}>
                {metric === "rank" ? `#${ohlc.high.toFixed(0)}` : ohlc.high.toFixed(4)}
              </span>
              <span className="text-muted-foreground">L</span>
              <span className={isGain ? "text-gain" : "text-loss"}>
                {metric === "rank" ? `#${ohlc.low.toFixed(0)}` : ohlc.low.toFixed(4)}
              </span>
              <span className="text-muted-foreground">C</span>
              <span className={cn("font-semibold", isGain ? "text-gain" : "text-loss")}>
                {metric === "rank" ? `#${ohlc.close.toFixed(0)}` : ohlc.close.toFixed(4)}
              </span>
              {metric === "score" && (
                <>
                  <span className="text-muted-foreground ml-1">V</span>
                  <span className="text-foreground/70">
                    {ohlc.volume >= 1000
                      ? `₹${(ohlc.volume / 1000).toFixed(1)}k`
                      : `₹${ohlc.volume.toFixed(0)}`}
                  </span>
                </>
              )}
            </div>
          )}

          {/* Right side: metric toggle + resolution + live badge */}
          <div className="flex items-center gap-1 ml-auto">
            {!hideMetricToggle && (
              <div className="flex items-center gap-1 rounded-md border border-border/40 bg-card/60 p-0.5 mr-2">
                {(["score", "rank"] as ChartMetric[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMetric(m)}
                    className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider transition-colors",
                      metric === m
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
            {connected && metric === "score" && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-gain mr-2 uppercase tracking-wider">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
                </span>
                LIVE
              </span>
            )}
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => handleResolutionChange(r.value)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors",
                  resolution === r.value
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Chart container ─────────────────────────────────────────────────── */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              Loading chart…
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full" />
      </div>

      {/* ── Bottom status bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 py-1 bg-background/60 border-t border-border/20 text-[9px] text-muted-foreground font-mono">
        <span>LOC_{locationId} · {resolution} · {metric}</span>
        <span>{barsLoaded > 0 ? `${barsLoaded} bars` : "—"}</span>
      </div>
    </div>
  );
}
