/**
 * Mock Data: Ticker Tape
 *
 * Computes ticker items from the latest finalized period,
 * including score change and rank change from the previous period.
 */

import type { TickerItem } from "@/lib/types";
import { MOCK_MERCHANTS } from "./merchants";
import { MOCK_SCORES } from "./scores";
import { MOCK_SCORING_PERIODS } from "./scoring-periods";

/**
 * Get ticker tape data sorted by absolute score change (biggest movers first).
 * Uses the latest finalized ("closed") period vs the one before it.
 */
export function getTickerData(): TickerItem[] {
  const closedPeriods = MOCK_SCORING_PERIODS
    .filter((p) => p.status === "closed")
    .sort((a, b) => a.period_start.localeCompare(b.period_start));

  if (closedPeriods.length < 2) return [];

  const currentPeriod = closedPeriods[closedPeriods.length - 1];
  const prevPeriod = closedPeriods[closedPeriods.length - 2];

  const currentScores = MOCK_SCORES.filter((s) => s.period_id === currentPeriod.period_id);
  const prevScores = MOCK_SCORES.filter((s) => s.period_id === prevPeriod.period_id);

  const items: TickerItem[] = [];

  for (const score of currentScores) {
    const merchant = MOCK_MERCHANTS.find((m) => m.merchant_id === score.merchant_id);
    if (!merchant || merchant.status === "suspended") continue;

    const prev = prevScores.find((s) => s.merchant_id === score.merchant_id);
    const prevComposite = prev ? prev.composite_index_score : score.composite_index_score;
    const prevRank = prev ? prev.final_rank : score.final_rank;
    const change = score.composite_index_score - prevComposite;
    const changePct = prevComposite !== 0 ? (change / prevComposite) * 100 : 0;

    items.push({
      merchant_id: score.merchant_id,
      business_name: merchant.business_name,
      score: score.composite_index_score,
      change: Math.round(change * 100) / 100,
      change_percent: Math.round(changePct * 100) / 100,
      rank: score.final_rank,
      rank_change: prevRank - score.final_rank,
    });
  }

  // Sort by absolute change descending (biggest movers first)
  items.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  return items;
}
