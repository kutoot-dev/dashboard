/**
 * Types: Trading terminal UI-specific types
 *
 * These types power the TradingView chart components and gamification elements.
 * They are derived from the scoring data but formatted for chart consumption.
 */

/** OHLC candlestick data point for TradingView charts */
export interface ScoreCandlestick {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

/** Volume histogram data point (transaction count per period) */
export interface VolumeBar {
  time: string;
  value: number;
  color: string;
}

/** Ticker tape item showing top movers */
export interface TickerItem {
  branch_id: string;
  business_name: string;
  score: number;
  change: number;
  change_percent: number;
  rank: number;
  rank_change: number;
}

/** Rank tier classifications for gamification badges */
export type RankTier = "platinum" | "gold" | "silver" | "bronze" | "none";

/** Mini sparkline data for leaderboard rows and stat cards */
export type SparklineData = number[];

/** Chart theme configuration for TradingView charts */
export interface ChartThemeColors {
  background: string;
  text: string;
  grid: string;
  crosshair: string;
  gain: string;
  loss: string;
  accent: string;
  volume_up: string;
  volume_down: string;
}
