"use client";

import { useState, useEffect, useCallback } from "react";
import { getEcho } from "@/lib/echo";

/** Shape of a single OHLCV tick broadcast from the backend. */
export interface ScoreTick {
  time: number;   // Unix timestamp (seconds)
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number; // gmv_tick value
}

export interface ScoreTickPayload {
  location_id: number;
  tick: ScoreTick;
  rank: number | null;
  rank_delta: number;
}

/**
 * useScoreTick — subscribes to per-minute OHLCV score ticks via Laravel Reverb.
 *
 * Pass `locationId` to receive only that branch's ticks (exchange.ticks.{id}).
 * Omit `locationId` (or pass null) to receive the global aggregated feed (exchange.ticks).
 *
 * @param locationId  Branch location ID, or null for the global feed
 * @param maxBars     Maximum number of ticks to keep in memory (default 300 = 5 hours)
 */
export function useScoreTick(
  locationId: number | null,
  maxBars = 300,
): {
  ticks: ScoreTick[];
  latest: ScoreTickPayload | null;
  connected: boolean;
} {
  const [ticks, setTicks] = useState<ScoreTick[]>([]);
  const [latest, setLatest] = useState<ScoreTickPayload | null>(null);
  const [connected, setConnected] = useState(false);

  const channel = locationId !== null
    ? `exchange.ticks.${locationId}`
    : "exchange.ticks";

  const handleTick = useCallback((payload: ScoreTickPayload) => {
    setLatest(payload);
    setTicks((prev) => {
      const next = [...prev, payload.tick];
      return next.length > maxBars ? next.slice(-maxBars) : next;
    });
  }, [maxBars]);

  useEffect(() => {
    let ch: ReturnType<typeof getEcho>["channel"] extends (name: string) => infer C ? C : never;

    try {
      const echo = getEcho();
      ch = echo.channel(channel);
      ch.listen(".score.tick", handleTick);
      setConnected(true);
    } catch {
      // Server-side or Echo unavailable — graceful degradation
      setConnected(false);
    }

    return () => {
      try {
        getEcho().leaveChannel(channel);
      } catch {
        // noop
      }
    };
  }, [channel, handleTick]);

  return { ticks, latest, connected };
}

/**
 * useLiveScore — tracks the latest close price for a location in real-time.
 * Falls back to `initialScore` until the first tick arrives.
 */
export function useLiveScore(
  locationId: number,
  initialScore: number,
): { score: number; delta: number; rank: number | null } {
  const { latest } = useScoreTick(locationId);

  const score = latest?.tick.close ?? initialScore;
  const delta = score - initialScore;

  return { score, delta, rank: latest?.rank ?? null };
}
