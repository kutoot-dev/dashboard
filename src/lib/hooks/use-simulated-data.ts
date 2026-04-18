"use client";

import { useMemo } from "react";
import type { TickerItem } from "@/lib/types";

/**
 * Simulated branch data used for ticker, score fallback, and leaderboard
 * when the backend doesn't return data.
 */
const SIMULATED_BRANCHES = [
  { id: "1", name: "Haldiram's Chandni Chowk", city: "Delhi", category: "Restaurant" },
  { id: "2", name: "Haldiram's Connaught Place", city: "Delhi", category: "Restaurant" },
  { id: "3", name: "Haldiram's Nagpur Main", city: "Nagpur", category: "Restaurant" },
  { id: "4", name: "Haldiram's Lajpat Nagar", city: "Delhi", category: "Restaurant" },
  { id: "5", name: "Chai Point Koramangala", city: "Bangalore", category: "Café" },
  { id: "6", name: "Chai Point Indiranagar", city: "Bangalore", category: "Café" },
  { id: "7", name: "Chai Point Cyber Hub", city: "Gurgaon", category: "Café" },
  { id: "8", name: "Chai Point HSR Layout", city: "Bangalore", category: "Café" },
  { id: "9", name: "Saravana Bhavan T Nagar", city: "Chennai", category: "Restaurant" },
  { id: "10", name: "Saravana Bhavan Janpath", city: "Delhi", category: "Restaurant" },
  { id: "11", name: "Saravana Bhavan HITEC City", city: "Hyderabad", category: "Restaurant" },
  { id: "12", name: "Saravana Bhavan Andheri", city: "Mumbai", category: "Restaurant" },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function useSimulatedTicker(): TickerItem[] {
  return useMemo(() => {
    const rand = seededRandom(Date.now() % 10000);
    return SIMULATED_BRANCHES.map((b, i) => {
      const baseScore = 40 + rand() * 45;
      const change = (rand() - 0.45) * 8;
      return {
        branch_id: b.id,
        business_name: b.name,
        score: Math.round(baseScore * 10) / 10,
        change: Math.round(change * 10) / 10,
        change_percent: Math.round((change / baseScore) * 1000) / 10,
        rank: i + 1,
        rank_change: Math.floor((rand() - 0.45) * 4),
      };
    }).sort((a, b) => b.score - a.score)
      .map((item, i) => ({ ...item, rank: i + 1 }));
  }, []);
}

export function useSimulatedScore() {
  return useMemo(() => {
    const rand = seededRandom(42);
    return {
      composite_index_score: 62.4 + rand() * 5,
      final_rank: 4,
      rank_movement: 2,
      payout_amount: 1250,
      fatigue_dampener_applied: false,
      fatigue_dampener_value: 0,
      raw_transaction_volume: 18450,
      raw_revenue: 245600,
      sector_percentile_rank: 0.15,
      location_opportunity_multiplier: 1.12,
      momentum_score: 71.2,
      ecosystem_contribution_score: 45.8,
      score_breakdown: {
        gmv_score: 58.3 + rand() * 10,
        commission_score: 72.1 + rand() * 8,
        platform_capture_score: 45.6 + rand() * 12,
        user_growth_score: 67.8 + rand() * 6,
        repeat_rate_score: 81.2 + rand() * 5,
        discount_aggression_score: 39.4 + rand() * 15,
        referral_score: 28.7 + rand() * 20,
        fairness_score: 55.9 + rand() * 10,
      } as Record<string, number>,
    };
  }, []);
}

export function useSimulatedCandlesticks() {
  return useMemo(() => {
    const rand = seededRandom(123);
    const data = [];
    const now = new Date();
    let close = 55;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const open = close;
      const change = (rand() - 0.45) * 6;
      close = Math.max(20, Math.min(95, open + change));
      const high = Math.max(open, close) + rand() * 3;
      const low = Math.min(open, close) - rand() * 3;

      data.push({
        time: dateStr,
        open: Math.round(open * 100) / 100,
        high: Math.round(high * 100) / 100,
        low: Math.round(Math.max(0, low) * 100) / 100,
        close: Math.round(close * 100) / 100,
      });
    }
    return data;
  }, []);
}

export function useSimulatedVolume() {
  return useMemo(() => {
    const rand = seededRandom(456);
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      data.push({
        time: dateStr,
        value: Math.floor(50 + rand() * 200),
      });
    }
    return data;
  }, []);
}

export { SIMULATED_BRANCHES };
