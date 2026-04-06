"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import type { LeaderboardFilters, LeaderboardEntry } from "@/lib/types";

/**
 * useLiveScore — simulates live score fluctuations around a base score
 */
export function useLiveScore(baseScore: number): { current: number; change: number } {
  const [current, setCurrent] = useState(baseScore);

  useEffect(() => {
    setCurrent(baseScore);
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const delta = (Math.random() - 0.5) * 1.0; // ±0.5
        const next = prev + delta;
        // Keep within reasonable bounds of the base
        return Math.max(baseScore - 3, Math.min(baseScore + 3, next));
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [baseScore]);

  return { current, change: current - baseScore };
}

/**
 * useLiveLeaderboard — wraps useLeaderboard with periodic score jitter
 */
export function useLiveLeaderboard(filters: LeaderboardFilters = {}): {
  data: LeaderboardEntry[] | undefined;
  isLoading: boolean;
} {
  const { data, isLoading } = useLeaderboard(filters);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const jitteredData = useMemo(() => {
    if (!data?.items) return undefined;
    // Use tick to force recomputation
    void tick;
    return data.items.map((entry) => ({
      ...entry,
      composite_score:
        entry.composite_score + (Math.random() - 0.5) * 0.4,
      score_change:
        entry.score_change + (Math.random() - 0.5) * 0.2,
    }));
  }, [data, tick]);

  return { data: jitteredData, isLoading };
}

/**
 * useCountdown — countdown to a specific hour in IST (UTC+5:30)
 */
export function useCountdown(targetHour: number): {
  formatted: string;
  secondsRemaining: number;
  isPastTarget: boolean;
} {
  const [mounted, setMounted] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const getSecondsToTarget = useCallback(() => {
    const now = new Date();
    // Convert to IST: UTC + 5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istNow = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);

    const target = new Date(istNow);
    target.setHours(targetHour, 0, 0, 0);

    if (istNow >= target) {
      // Past target, aim for next day
      target.setDate(target.getDate() + 1);
    }

    return Math.floor((target.getTime() - istNow.getTime()) / 1000);
  }, [targetHour]);

  useEffect(() => {
    setMounted(true);
    setSecondsRemaining(getSecondsToTarget());
    
    const interval = setInterval(() => {
      setSecondsRemaining(getSecondsToTarget());
    }, 1000);
    return () => clearInterval(interval);
  }, [getSecondsToTarget]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  return {
    formatted: mounted ? `${hours}h ${minutes}m ${seconds}s` : "calculating...",
    secondsRemaining,
    isPastTarget: secondsRemaining <= 0,
  };
}
