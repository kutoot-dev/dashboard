"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";

interface Deal {
  id: string;
  coupon_code: string;
  discount_depth: number;    // 0–1
  impression_count: number;
  redemption_count: number;
  conversion_rate: number;   // virtual column
  is_flash_deal: boolean;
  expires_at: string | null;
  merchant_name: string;
  branch_name: string;
  gmv_generated: number;
}

interface DealBookProps {
  locationId?: number;
  limit?: number;
  className?: string;
}

/**
 * DealBook — live table of the most active discount deals.
 *
 * Shows top deals ranked by conversion rate (redemption / impression).
 * Flash deals are highlighted in amber.
 * Mirrors the Binance order-book aesthetic.
 */
export function DealBook({ locationId, limit = 12, className }: DealBookProps) {
  const [filter, setFilter] = useState<"all" | "flash">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["deal-book", locationId, limit],
    queryFn: async () => {
      const params: Record<string, string | number> = { limit };
      if (locationId) params.location_id = locationId;
      const res = await apiClient.get<{ data: Deal[] }>("/deals/active", { params });
      return res.data.data ?? [];
    },
    refetchInterval: 15_000,
  });

  const deals = (data ?? []).filter((d) => filter === "all" || d.is_flash_deal);
  const maxConv = Math.max(...deals.map((d) => d.conversion_rate), 0.001);

  return (
    <div className={cn("flex flex-col rounded-lg border border-border/40 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/80">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
          Deal Book
        </span>
        <div className="flex items-center gap-1">
          {(["all", "flash"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors",
                filter === f
                  ? f === "flash" ? "bg-amber-500/20 text-amber-400" : "bg-accent/20 text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "flash" ? "⚡ Flash" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider border-b border-border/20">
        <span>Deal / Branch</span>
        <span className="text-right">Depth</span>
        <span className="text-right">Conv%</span>
        <span className="text-right">GMV</span>
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto max-h-64">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-[10px] text-muted-foreground font-mono">
            Loading deals…
          </div>
        ) : deals.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-[10px] text-muted-foreground font-mono">
            No active deals
          </div>
        ) : (
          deals.map((deal) => {
            const convPct = deal.conversion_rate * 100;
            const barWidth = (deal.conversion_rate / maxConv) * 100;
            const isPositive = convPct >= 30;

            return (
              <div
                key={deal.id}
                className={cn(
                  "relative grid grid-cols-[1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-[10px] font-mono",
                  "hover:bg-muted/30 transition-colors",
                  deal.is_flash_deal && "bg-amber-500/5"
                )}
              >
                {/* Bar fill */}
                <div
                  className={cn(
                    "absolute inset-y-0 right-0 opacity-10 pointer-events-none",
                    isPositive ? "bg-gain" : "bg-loss"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
                <div className="min-w-0 relative z-10">
                  <div className="flex items-center gap-1">
                    {deal.is_flash_deal && <span className="text-amber-400">⚡</span>}
                    <span className="text-foreground truncate">{deal.coupon_code}</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground truncate block">{deal.branch_name}</span>
                </div>
                <span className="relative z-10 text-right text-muted-foreground">
                  -{(deal.discount_depth * 100).toFixed(0)}%
                </span>
                <span className={cn("relative z-10 text-right font-semibold", isPositive ? "text-gain" : "text-loss")}>
                  {convPct.toFixed(1)}%
                </span>
                <span className="relative z-10 text-right text-foreground/70">
                  {deal.gmv_generated >= 1000
                    ? `${(deal.gmv_generated / 1000).toFixed(1)}k`
                    : deal.gmv_generated.toFixed(0)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
