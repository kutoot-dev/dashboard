"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { getEcho } from "@/lib/echo";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";

interface LiveTrade {
  id: string;
  merchant_location_id: number;
  branch_name: string;
  amount: number;
  coupon_code: string | null;
  discount_amount: number;
  payment_status: string;
  created_at: string;
}

interface LiveTradesFeedProps {
  locationId?: number;   // restrict to a single branch (optional)
  maxItems?: number;
  className?: string;
}

/**
 * LiveTradesFeed — scrolling feed of real-time transactions.
 *
 * Polls the API for recent trades and supplements with WebSocket events.
 * Green = successful, Red = failed.
 * Coupon redemptions shown in amber.
 */
export function LiveTradesFeed({ locationId, maxItems = 20, className }: LiveTradesFeedProps) {
  const [trades, setTrades]   = useState<LiveTrade[]>([]);
  const listRef               = useRef<HTMLDivElement>(null);

  // Initial load + polling
  const { data } = useQuery({
    queryKey: ["live-trades", locationId],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: maxItems };
      if (locationId) params.location_id = locationId;
      const res = await apiClient.get<{ data: LiveTrade[] }>("/transactions/recent", { params });
      return res.data.data ?? [];
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (data) setTrades(data);
  }, [data]);

  // Real-time updates via Reverb
  useEffect(() => {
    const channel = locationId ? `exchange.branch.${locationId}` : "exchange.ticks";
    try {
      const echo = getEcho();
      const ch = echo.channel(channel);
      ch.listen(".transaction.created", (payload: { trade: LiveTrade }) => {
        setTrades((prev) => {
          const next = [payload.trade, ...prev];
          return next.slice(0, maxItems);
        });
        // Scroll to top
        if (listRef.current) listRef.current.scrollTop = 0;
      });
    } catch {
      // Echo not available
    }
    return () => {
      try { getEcho().leaveChannel(channel); } catch { /* noop */ }
    };
  }, [locationId, maxItems]);

  const now = Date.now();

  return (
    <div className={cn("flex flex-col rounded-lg border border-border/40 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Live Trades
        </span>
        <span className="flex items-center gap-1 text-[9px] font-mono text-gain">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
          </span>
          LIVE
        </span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider border-b border-border/20">
        <span>Branch</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Time</span>
      </div>

      {/* Trade list */}
      <div ref={listRef} className="flex-1 overflow-y-auto max-h-64">
        {trades.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[10px] text-muted-foreground font-mono">
            Waiting for trades…
          </div>
        ) : (
          trades.map((trade) => {
            const isSuccess = ["paid", "completed"].includes(trade.payment_status.toLowerCase());
            const hasCoupon = !!trade.coupon_code;
            const age = Math.floor((now - new Date(trade.created_at).getTime()) / 1000);
            const ageStr = age < 60 ? `${age}s` : age < 3600 ? `${Math.floor(age / 60)}m` : `${Math.floor(age / 3600)}h`;

            return (
              <div
                key={trade.id}
                className={cn(
                  "grid grid-cols-[1fr_auto_auto] gap-2 px-3 py-1.5 text-[10px] font-mono hover:bg-muted/30 transition-colors",
                  hasCoupon && "bg-amber-500/5"
                )}
              >
                <div className="min-w-0">
                  <span className="text-foreground truncate block">{trade.branch_name}</span>
                  {hasCoupon && (
                    <span className="text-[9px] text-amber-400 truncate block">🏷 {trade.coupon_code}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className={cn("font-semibold", isSuccess ? "text-gain" : "text-loss")}>
                    {formatINR(trade.amount)}
                  </span>
                  {trade.discount_amount > 0 && (
                    <span className="text-[9px] text-amber-400 block">
                      -{formatINR(trade.discount_amount)}
                    </span>
                  )}
                </div>
                <span className="text-right text-muted-foreground self-center">{ageStr}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
