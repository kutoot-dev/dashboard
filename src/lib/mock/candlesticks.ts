/**
 * Mock Data: Candlesticks & Volume
 *
 * Transforms merchant score trajectories into OHLC candlestick format
 * and volume histogram bars for TradingView-style chart consumption.
 *
 * OHLC logic:
 *   open  = previous period's close (or first score for period 1)
 *   close = current period composite_index_score
 *   high  = max(open, close) + random variance
 *   low   = min(open, close) - random variance
 */

import type { ScoreCandlestick, VolumeBar } from "@/lib/types";
import { MOCK_SCORES } from "./scores";
import { MOCK_SCORING_PERIODS } from "./scoring-periods";

// Seeded PRNG for consistent high/low wicks
function seedHash(str: string): number {
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

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Transform daily scores into OHLC candlestick format for a given merchant.
 * Returns one candlestick per scoring period.
 */
export function getMerchantCandlesticks(merchantId: string): ScoreCandlestick[] {
  const rng = mulberry32(seedHash(merchantId + "-candle"));
  const merchantScores = MOCK_SCORES
    .filter((s) => s.merchant_id === merchantId)
    .sort((a, b) => {
      const aIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === a.period_id);
      const bIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === b.period_id);
      return aIdx - bIdx;
    });

  const candles: ScoreCandlestick[] = [];

  for (let i = 0; i < merchantScores.length; i++) {
    const score = merchantScores[i];
    const period = MOCK_SCORING_PERIODS.find((p) => p.period_id === score.period_id);
    if (!period) continue;

    const close = score.composite_index_score;
    const open = i === 0 ? close - (rng() - 0.5) * 4 : candles[i - 1].close;

    const wickUp = rng() * 5;
    const wickDown = rng() * 5;
    const high = round2(clamp(Math.max(open, close) + wickUp, 0, 100));
    const low = round2(clamp(Math.min(open, close) - wickDown, 0, 100));

    candles.push({
      time: period.period_start.split("T")[0],
      open: round2(open),
      high,
      low,
      close: round2(close),
    });
  }

  return candles;
}

/**
 * Generate volume bars (raw transaction volume per period) for a merchant.
 * Green bars = score went up, Red bars = score went down.
 */
export function getMerchantVolume(merchantId: string): VolumeBar[] {
  const merchantScores = MOCK_SCORES
    .filter((s) => s.merchant_id === merchantId)
    .sort((a, b) => {
      const aIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === a.period_id);
      const bIdx = MOCK_SCORING_PERIODS.findIndex((p) => p.period_id === b.period_id);
      return aIdx - bIdx;
    });

  return merchantScores.map((score, i) => {
    const period = MOCK_SCORING_PERIODS.find((p) => p.period_id === score.period_id);
    const prevScore = i > 0 ? merchantScores[i - 1].composite_index_score : score.composite_index_score;
    const isUp = score.composite_index_score >= prevScore;

    return {
      time: period ? period.period_start.split("T")[0] : "",
      value: score.raw_transaction_volume,
      color: isUp ? "rgba(38, 166, 91, 0.6)" : "rgba(239, 83, 80, 0.6)",
    };
  });
}
