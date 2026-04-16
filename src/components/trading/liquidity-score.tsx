"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils/cn";
import { useScoreTick } from "@/lib/hooks/use-score-tick";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";

interface LiquidityScoreProps {
  locationId: number;
  className?: string;
}

/**
 * LiquidityScore — measures "market depth" for a branch.
 *
 * Computed as: txn_volume_last_hour / active_users_last_hour
 * Higher = each active user is transacting more (deep market).
 * Shown as a 5-bar depth visualizer.
 */
export function LiquidityScore({ locationId, className }: LiquidityScoreProps) {
  const { ticks, connected } = useScoreTick(locationId, 60);

  // Fetch live metrics for this location
  const { data: metrics } = useQuery({
    queryKey: ["live-metrics", locationId],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: {
          gmv_today: number;
          txn_count_today: number;
          unique_users_today: number;
          live_composite_score: number;
        }
      }>(`/branches/${locationId}/live-metrics`);
      return res.data.data;
    },
    refetchInterval: 30_000,
  });

  const {
    liquidityRatio,
    gmvPerTick,
    avgVolume,
    depthBars,
  } = useMemo(() => {
    const txnCount   = metrics?.txn_count_today   ?? 0;
    const uniqueUsers = metrics?.unique_users_today ?? 1;
    const gmvToday   = metrics?.gmv_today          ?? 0;

    const liquidityRatio = txnCount / Math.max(1, uniqueUsers);
    const avgVolume = ticks.length > 0
      ? ticks.reduce((s, t) => s + t.volume, 0) / ticks.length
      : 0;
    const gmvPerTick = ticks.length > 0
      ? ticks.reduce((s, t) => s + (t.volume ?? 0), 0) / ticks.length
      : 0;

    // Build 5 depth bars from the last 5 ticks (or fewer)
    const recent = ticks.slice(-5);
    const maxV = Math.max(...recent.map((t) => t.volume), 1);
    const depthBars = recent.map((t) => ({
      height: (t.volume / maxV) * 100,
      isGain: t.close >= t.open,
    }));

    return { liquidityRatio, gmvPerTick, avgVolume, depthBars };
  }, [ticks, metrics]);

  // Score 0–100 (capped at ratio=20 = full liquidity)
  const liquidityScore = Math.min(100, (liquidityRatio / 20) * 100);
  const level =
    liquidityScore >= 80 ? { label: "DEEP",     color: "text-gain" } :
    liquidityScore >= 55 ? { label: "ACTIVE",   color: "text-gain" } :
    liquidityScore >= 30 ? { label: "MODERATE", color: "text-yellow-400" } :
    liquidityScore >= 10 ? { label: "THIN",     color: "text-orange-400" } :
                           { label: "DRY",      color: "text-muted-foreground" };

  return (
    <div className={cn("flex flex-col rounded-lg border border-border/40 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Liquidity Depth
        </span>
        {connected && (
          <span className="flex items-center gap-1 text-[9px] font-mono text-gain">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
            </span>
            LIVE
          </span>
        )}
      </div>

      <div className="px-3 py-3 space-y-3">
        {/* Score + level */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-mono font-bold text-foreground">{liquidityScore.toFixed(0)}</p>
            <p className={cn("text-[10px] font-mono font-semibold uppercase tracking-widest", level.color)}>
              {level.label}
            </p>
          </div>
          {/* Mini depth bars */}
          <div className="flex items-end gap-0.5 h-8">
            {depthBars.length > 0 ? depthBars.map((bar, i) => (
              <div
                key={i}
                className={cn("w-2 rounded-sm transition-all duration-300", bar.isGain ? "bg-gain" : "bg-loss")}
                style={{ height: `${Math.max(6, bar.height)}%` }}
              />
            )) : (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-2 rounded-sm bg-muted/30" style={{ height: "20%" }} />
              ))
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              liquidityScore >= 55 ? "bg-gain" : liquidityScore >= 30 ? "bg-yellow-400" : "bg-orange-400"
            )}
            style={{ width: `${liquidityScore}%` }}
          />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[9px] font-mono text-muted-foreground">
          <div className="flex justify-between">
            <span>Txn/User</span>
            <span className="text-foreground">{liquidityRatio.toFixed(1)}×</span>
          </div>
          <div className="flex justify-between">
            <span>Avg Vol/min</span>
            <span className="text-foreground">{avgVolume.toFixed(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>GMV/tick</span>
            <span className="text-foreground">
              {gmvPerTick >= 1000
                ? `₹${(gmvPerTick / 1000).toFixed(1)}k`
                : `₹${gmvPerTick.toFixed(0)}`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ticks</span>
            <span className="text-foreground">{ticks.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
