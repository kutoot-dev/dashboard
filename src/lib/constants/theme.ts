/**
 * Constants: Theme configuration for TradingView charts
 *
 * Defines chart color schemes for dark and light modes.
 * These are passed to TradingView chart components via props.
 */

import type { ChartThemeColors } from "@/lib/types/trading";

export const CHART_THEME_DARK: ChartThemeColors = {
  background: "#050810",
  text: "#94a3b8",
  grid: "#162035",
  crosshair: "#475569",
  gain: "#00ff88",
  loss: "#ff3366",
  accent: "#3b82f6",
  volume_up: "rgba(0, 255, 136, 0.4)",
  volume_down: "rgba(255, 51, 102, 0.4)",
};

export const CHART_THEME_LIGHT: ChartThemeColors = {
  background: "#ffffff",
  text: "#64748b",
  grid: "#e2e8f0",
  crosshair: "#94a3b8",
  gain: "#16a34a",
  loss: "#dc2626",
  accent: "#3b82f6",
  volume_up: "rgba(22, 163, 74, 0.5)",
  volume_down: "rgba(220, 38, 38, 0.5)",
};

/** Rank tier thresholds (percentile boundaries) and gamified display config */
export const RANK_TIERS = {
  platinum: { maxPercentile: 1, label: "Legend", levelLabel: "Lv.5", color: "text-platinum", bg: "bg-platinum/10", border: "border-platinum/30", neonClass: "animate-neon-pulse" },
  gold: { maxPercentile: 5, label: "Elite", levelLabel: "Lv.4", color: "text-gold", bg: "bg-gold/10", border: "border-gold/30", neonClass: "" },
  silver: { maxPercentile: 15, label: "Pro", levelLabel: "Lv.3", color: "text-silver", bg: "bg-silver/10", border: "border-silver/30", neonClass: "" },
  bronze: { maxPercentile: 30, label: "Rising", levelLabel: "Lv.2", color: "text-bronze", bg: "bg-bronze/10", border: "border-bronze/30", neonClass: "" },
  none: { maxPercentile: 100, label: "Rookie", levelLabel: "Lv.1", color: "text-muted-foreground", bg: "bg-muted/20", border: "border-muted-foreground/20", neonClass: "" },
} as const;

/** Score range color coding (for progress bars and badges) */
export const SCORE_RANGES = {
  excellent: { min: 15, max: 20, color: "bg-gain", label: "Excellent" },
  good: { min: 9, max: 14.99, color: "bg-warning", label: "Good" },
  needs_work: { min: 0, max: 8.99, color: "bg-loss", label: "Needs Work" },
} as const;

/** Pagination defaults */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  LEADERBOARD_LIMIT: 20,
} as const;

/** Time range options for chart views */
export const TIME_RANGES = [
  { label: "4W", periods: 4 },
  { label: "8W", periods: 8 },
  { label: "12W", periods: 12 },
  { label: "All", periods: -1 },
] as const;
