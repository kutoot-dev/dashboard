/**
 * Mock Data: Branch Scores
 *
 * Generates score records (50 branches × 30 daily periods) with deterministic
 * seeded randomness. Each branch has a "personality" — trending up, down,
 * volatile, or stable — to create realistic candlestick patterns.
 *
 * composite_index_score ranges 0–100.
 * Weighted formula: 0.35*trading + 0.20*margin + 0.20*location + 0.10*txn_quality + 0.10*momentum + 0.05*ecosystem
 */

import type { BranchScore, ScoreBreakdown } from "@/lib/types";
import { MOCK_BRANCHES } from "./branches";
import { MOCK_SCORING_PERIODS } from "./scoring-periods";

// ── Deterministic seeded PRNG (mulberry32) ───────────────────────────

function seedFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

// ── Branch personality archetypes ──────────────────────────────────

type Archetype = "bull" | "bear" | "volatile" | "steady" | "comeback" | "fader";

const ARCHETYPE_CYCLE: Archetype[] = [
  "bull", "steady", "volatile", "bear", "bull", "comeback",
  "steady", "fader", "volatile", "bull", "steady", "bear",
];

function getArchetype(index: number): Archetype {
  return ARCHETYPE_CYCLE[index % ARCHETYPE_CYCLE.length];
}

function getBaseScore(archetype: Archetype, rng: () => number): number {
  switch (archetype) {
    case "bull": return 55 + rng() * 20;
    case "bear": return 30 + rng() * 20;
    case "volatile": return 40 + rng() * 25;
    case "steady": return 50 + rng() * 15;
    case "comeback": return 25 + rng() * 15;
    case "fader": return 65 + rng() * 15;
  }
}

function getDrift(archetype: Archetype): number {
  switch (archetype) {
    case "bull": return 2.0;
    case "bear": return -1.8;
    case "volatile": return 0.0;
    case "steady": return 0.3;
    case "comeback": return 3.0;
    case "fader": return -2.5;
  }
}

function getVolatility(archetype: Archetype): number {
  switch (archetype) {
    case "bull": return 4.0;
    case "bear": return 3.5;
    case "volatile": return 8.0;
    case "steady": return 2.0;
    case "comeback": return 5.0;
    case "fader": return 4.0;
  }
}

// ── Sub-score generation ─────────────────────────────────────────────

function generateBreakdown(composite: number, rng: () => number): ScoreBreakdown {
  // Generate raw sub-scores that weight-sum roughly to composite
  // Weights: 0.35, 0.20, 0.20, 0.10, 0.10, 0.05
  const noise = () => (rng() - 0.5) * 12;
  const trading = clamp(composite + noise(), 0, 100);
  const margin = clamp(composite + noise(), 0, 100);
  const location = clamp(composite + noise(), 0, 100);
  const txnQuality = clamp(composite + noise(), 0, 100);
  const momentum = clamp(composite + noise(), 0, 100);
  const ecosystem = clamp(composite + noise() * 0.5, 0, 100);

  return {
    trading_performance: round2(trading),
    margin_efficiency: round2(margin),
    location_opportunity: round2(location),
    transaction_quality: round2(txnQuality),
    momentum: round2(momentum),
    ecosystem_contribution: round2(ecosystem),
  };
}

// ── Score trajectory generation ──────────────────────────────────────

function generateScoreTrajectory(
  branchId: string,
  branchIndex: number,
): BranchScore[] {
  const rng = mulberry32(seedFromString(branchId + "-scores"));
  const archetype = getArchetype(branchIndex);
  const drift = getDrift(archetype);
  const vol = getVolatility(archetype);

  let currentScore = getBaseScore(archetype, rng);
  const scores: BranchScore[] = [];

  for (let p = 0; p < MOCK_SCORING_PERIODS.length; p++) {
    const period = MOCK_SCORING_PERIODS[p];
    const change = drift + (rng() - 0.5) * vol * 2;
    currentScore = clamp(currentScore + change, 5, 98);

    const composite = round2(currentScore);
    const breakdown = generateBreakdown(composite, rng);

    // Derived intermediate values
    const rawVolume = Math.round(200 + rng() * 5000);
    const rawRevenue = Math.round(rawVolume * (100 + rng() * 500));
    const logVol = round2(Math.log(rawVolume + 1));
    const logRev = round2(Math.log(rawRevenue + 1));
    const percentileScore = round2(composite);
    const sectorZ = round2((composite - 50) / 15);
    const sectorPercentile = round2(clamp(50 + sectorZ * 20, 1, 99));
    const marginRatio = round2(0.05 + rng() * 0.45);
    const marginNeutralised = round2(composite * (0.8 + marginRatio * 0.4));
    const locMultiplier = round2(1.0 + rng() * 1.5);
    const locAdjusted = round2(composite * locMultiplier);
    const oppNormalized = round2(clamp(locAdjusted / 2.5, 0, 100));
    const txnPQScore = round2(breakdown.transaction_quality);
    const momScore = round2(breakdown.momentum);
    const ecoScore = round2(breakdown.ecosystem_contribution);

    // Fatigue: top performers in consecutive periods (3+ weeks = 21+ daily periods)
    const isFatigued = branchIndex < 5 && p > 20;
    const fatigueValue = isFatigued ? round2(0.03 + rng() * 0.10) : 0;

    // Payout: top-half get payouts
    const payout = composite > 55 ? Math.round(100 + (composite - 55) * 50) : 0;

    scores.push({
      score_id: `sc-${branchId}-${period.period_id}`,
      branch_id: branchId,
      period_id: period.period_id,
      raw_transaction_volume: rawVolume,
      raw_revenue: rawRevenue,
      log_normalized_volume: logVol,
      log_normalized_revenue: logRev,
      percentile_scale_score: percentileScore,
      sector_zscore: sectorZ,
      sector_percentile_rank: sectorPercentile,
      margin_efficiency_ratio: marginRatio,
      margin_neutralized_score: marginNeutralised,
      location_opportunity_multiplier: locMultiplier,
      location_adjusted_score: locAdjusted,
      opportunity_normalized_score: oppNormalized,
      transaction_pattern_quality_score: txnPQScore,
      momentum_score: momScore,
      ecosystem_contribution_score: ecoScore,
      composite_index_score: composite,
      final_rank: 0, // computed below
      rank_movement: 0, // computed below
      fatigue_dampener_applied: isFatigued,
      fatigue_dampener_value: fatigueValue,
      payout_amount: payout,
      score_breakdown: breakdown,
      created_at: period.period_start,
    });
  }

  return scores;
}

// ── Generate all scores ──────────────────────────────────────────────

function generateAllScores(): BranchScore[] {
  const allScores: BranchScore[] = [];

  for (let i = 0; i < MOCK_BRANCHES.length; i++) {
    const trajectory = generateScoreTrajectory(MOCK_BRANCHES[i].branch_id, i);
    allScores.push(...trajectory);
  }

  // Compute ranks per period
  for (const period of MOCK_SCORING_PERIODS) {
    const periodScores = allScores
      .filter((s) => s.period_id === period.period_id)
      .sort((a, b) => b.composite_index_score - a.composite_index_score);

    periodScores.forEach((score, idx) => {
      score.final_rank = idx + 1;
    });
  }

  // Compute rank movement (compared to previous period)
  for (let p = 1; p < MOCK_SCORING_PERIODS.length; p++) {
    const currPeriod = MOCK_SCORING_PERIODS[p].period_id;
    const prevPeriod = MOCK_SCORING_PERIODS[p - 1].period_id;

    for (const score of allScores) {
      if (score.period_id !== currPeriod) continue;
      const prev = allScores.find(
        (s) => s.branch_id === score.branch_id && s.period_id === prevPeriod,
      );
      if (prev) {
        score.rank_movement = prev.final_rank - score.final_rank; // positive = moved up
      }
    }
  }

  return allScores;
}

export const MOCK_SCORES: BranchScore[] = generateAllScores();

// ── Query helpers ────────────────────────────────────────────────────

/** Get scores for a specific branch across all periods */
export function getBranchScores(branchId: string): BranchScore[] {
  return MOCK_SCORES.filter((s) => s.branch_id === branchId);
}

/** Get all scores for a specific period */
export function getPeriodScores(periodId: string): BranchScore[] {
  return MOCK_SCORES.filter((s) => s.period_id === periodId);
}

/** Get the latest finalized period's scores */
export function getLatestScores(): BranchScore[] {
  const finalized = MOCK_SCORING_PERIODS.filter((p) => p.status === "closed");
  const latest = finalized[finalized.length - 1];
  return latest ? getPeriodScores(latest.period_id) : [];
}
