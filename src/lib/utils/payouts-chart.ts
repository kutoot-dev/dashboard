import type { BranchPayoutHistoryItem, BranchPayoutTodayExpected } from "@/lib/api/services/branches.service";

export interface BonusPayoutChartPoint {
  date: string;
  time: string;
  share: number;
  pool: number;
  rank: number | null;
  isEstimate?: boolean;
}

function formatChartLabel(isoDate: string): string {
  const date = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

/**
 * Chronological daily series for the bonus payout trend chart (oldest → newest).
 */
export function buildBonusPayoutSeries(
  history: BranchPayoutHistoryItem[],
  todayExpected?: BranchPayoutTodayExpected | null,
  maxPoints = 30,
): BonusPayoutChartPoint[] {
  const byDate = new Map<string, BonusPayoutChartPoint>();

  for (const row of history) {
    const date = row.date || row.period_id;
    if (!date) continue;
    byDate.set(date, {
      date,
      time: formatChartLabel(date),
      share: Number(row.your_share ?? 0),
      pool: Number(row.daily_pool ?? 0),
      rank: row.rank ?? null,
    });
  }

  if (todayExpected?.date) {
    byDate.set(todayExpected.date, {
      date: todayExpected.date,
      time: formatChartLabel(todayExpected.date),
      share: Number(todayExpected.your_share ?? 0),
      pool: Number(todayExpected.daily_pool ?? 0),
      rank: todayExpected.rank ?? null,
      isEstimate: todayExpected.is_estimate,
    });
  }

  const sorted = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length <= maxPoints) {
    return sorted;
  }

  return sorted.slice(-maxPoints);
}

export function summarizePayoutSeries(points: BonusPayoutChartPoint[]) {
  if (!points.length) {
    return { totalShare: 0, avgShare: 0, latestShare: 0, previousShare: 0, changePct: null as number | null };
  }

  const settled = points.filter((p) => !p.isEstimate);
  const totalShare = settled.reduce((sum, p) => sum + p.share, 0);
  const avgShare = settled.length ? totalShare / settled.length : 0;
  const latestShare = points[points.length - 1]?.share ?? 0;
  const previousShare = points.length > 1 ? (points[points.length - 2]?.share ?? 0) : 0;
  const changePct =
    previousShare > 0 ? ((latestShare - previousShare) / previousShare) * 100 : null;

  return { totalShare, avgShare, latestShare, previousShare, changePct };
}
