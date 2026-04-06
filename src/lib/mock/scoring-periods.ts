/**
 * Mock Data: Scoring Periods
 *
 * 30 daily scoring periods. Period 30 is the current active day,
 * period 29 is provisional (scores being calculated), periods 1-28 are finalized.
 * Date range: 2026-03-08 through 2026-04-06 (one day each).
 */

import type { ScoringPeriod } from "@/lib/types";

function generateDailyPeriods(): ScoringPeriod[] {
  const periods: ScoringPeriod[] = [];
  const startDate = new Date("2026-03-08T00:00:00Z");

  for (let i = 0; i < 30; i++) {
    const dayStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);
    const id = String(i + 1).padStart(3, "0");

    let status: "open" | "calculating" | "closed" = "closed";
    if (i === 29) status = "open";
    else if (i === 28) status = "calculating";

    const pool = i < 10 ? 50000 : i < 20 ? 55000 : 60000;

    periods.push({
      period_id: `sp-${id}`,
      period_start: dayStart.toISOString(),
      period_end: dayEnd.toISOString(),
      period_type: "daily",
      pool_amount: pool,
      status,
      created_at: dayStart.toISOString(),
    });
  }

  return periods;
}

export const MOCK_SCORING_PERIODS: ScoringPeriod[] = generateDailyPeriods();
