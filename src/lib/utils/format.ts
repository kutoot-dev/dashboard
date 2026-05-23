/**
 * Utility: Formatting helpers for financial data display
 * - INR currency formatting (Indian number system: lakhs/crores)
 * - Score display with +/- sign and color hints
 * - Percentage formatting
 * - Date formatting for scoring periods
 */

/** Format number as INR currency (Indian locale with ₹ symbol) */
export function formatINR(amount?: number | null): string {
  if (typeof amount !== "number" || Number.isNaN(amount) || !Number.isFinite(amount)) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format number as INR with decimals */
export function formatINRDecimal(amount?: number | null): string {
  if (typeof amount !== "number" || Number.isNaN(amount) || !Number.isFinite(amount)) {
    return "₹0.00";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format score with +/- sign (e.g., "+3.24" or "-1.50") */
export function formatScoreChange(change?: number | null): string {
  if (typeof change !== "number" || Number.isNaN(change)) return "--";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(2)}`;
}

/** Format percentage with +/- sign (e.g., "+4.6%") */
export function formatPercentChange(change?: number | null): string {
  if (typeof change !== "number" || Number.isNaN(change)) return "--";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

/** Format a score as a fixed 2-decimal number (e.g., "72.54") */
export function formatScore(score?: number | null): string {
  if (typeof score !== "number" || Number.isNaN(score) || !Number.isFinite(score)) {
    return "--";
  }
  return score.toFixed(2);
}

/** Format large numbers compactly (e.g., "1.2L", "50K") */
export function formatCompact(num?: number | null): string {
  if (typeof num !== "number" || Number.isNaN(num)) return "--";
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/** Relative time for feeds (e.g., "2h ago", "just now") */
export function formatTimeAgo(ts: string | Date): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d ago`;
  return formatDate(ts);
}

/** Format date as "DD MMM YYYY" (e.g., "15 Mar 2026") */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Format date range for scoring period display */
export function formatPeriodRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const startStr = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(s);
  const endStr = new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(e);
  return `${startStr} – ${endStr}`;
}

/** Determine color class based on score change direction */
export function getChangeColor(change: number): string {
  if (change > 0) return "text-gain";
  if (change < 0) return "text-loss";
  return "text-muted-foreground";
}

/** Get rank tier based on percentile position */
export function getRankTier(rank: number, totalBranches: number): "platinum" | "gold" | "silver" | "bronze" | "none" {
  const percentile = (rank / totalBranches) * 100;
  if (percentile <= 1) return "platinum";
  if (percentile <= 5) return "gold";
  if (percentile <= 15) return "silver";
  if (percentile <= 30) return "bronze";
  return "none";
}
