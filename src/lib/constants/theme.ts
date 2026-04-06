/**
 * Constants: Theme configuration for TradingView charts
 *
 * Defines chart color schemes for dark and light modes.
 * These are passed to TradingView chart components via props.
 */

import type { ChartThemeColors } from "@/lib/types/trading";

export const CHART_THEME_DARK: ChartThemeColors = {
  background: "#0a0e17",
  text: "#94a3b8",
  grid: "#1e293b",
  crosshair: "#475569",
  gain: "#22c55e",
  loss: "#ef4444",
  accent: "#3b82f6",
  volume_up: "rgba(34, 197, 94, 0.5)",
  volume_down: "rgba(239, 68, 68, 0.5)",
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

/** Rank tier thresholds (percentile boundaries) and display config */
export const RANK_TIERS = {
  platinum: { maxPercentile: 1, label: "Platinum", color: "text-platinum", bg: "bg-platinum/10", border: "border-platinum/30" },
  gold: { maxPercentile: 5, label: "Gold", color: "text-gold", bg: "bg-gold/10", border: "border-gold/30" },
  silver: { maxPercentile: 15, label: "Silver", color: "text-silver", bg: "bg-silver/10", border: "border-silver/30" },
  bronze: { maxPercentile: 30, label: "Bronze", color: "text-bronze", bg: "bg-bronze/10", border: "border-bronze/30" },
  none: { maxPercentile: 100, label: "", color: "text-muted-foreground", bg: "", border: "" },
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
