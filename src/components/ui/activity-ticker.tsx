"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMerchantNewsFeed } from "@/lib/api/services/merchant.service";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { newsFeedIcon } from "@/lib/icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";

export interface ActivityItem {
  id: string;
  icon: IconDefinition;
  event: string;
  message: string;
  date: string;
  rank: number;
  branchName: string;
  payoutAmount: number;
  poolAmount: number;
  isViewer: boolean;
}

const EVENT_COLOR_MAP: Record<string, string> = {
  daily_ranker: "text-warning",
};

const RANK_COLOR_MAP: Record<number, string> = {
  1: "text-warning",
  2: "text-muted-foreground",
  3: "text-accent",
};

function formatDateLabel(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ActivityTicker({ className }: { className?: string }) {
  const [days, setDays] = useState(7);

  const feedQuery = useQuery({
    queryKey: ["merchant-news-feed", days],
    queryFn: async () => {
      const res = await getMerchantNewsFeed({ days, limit: 10 });
      return res.success ? res.data : null;
    },
    refetchInterval: 60_000,
    retry: false,
  });

  const data = feedQuery.data;
  const showSkeleton = useQuerySkeleton(feedQuery);
  const effectiveDays = data?.days_count ?? days;
  const perDay = data?.per_day ?? 10;

  const items: ActivityItem[] = useMemo(
    () =>
      (data?.rows ?? []).map((item) => ({
        id: item.id,
        icon: newsFeedIcon(item.event, item.icon),
        event: item.event,
        message: item.message,
        date: item.date,
        rank: item.rank,
        branchName: item.branch_name,
        payoutAmount: item.payout_amount,
        poolAmount: item.pool_amount,
        isViewer: item.is_viewer,
      })),
    [data?.rows],
  );

  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, ActivityItem[]>();
    for (const item of items) {
      const bucket = grouped.get(item.date) ?? [];
      bucket.push(item);
      grouped.set(item.date, bucket);
    }
    return Array.from(grouped.entries());
  }, [items]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.5;

    function scroll() {
      if (!el || paused) {
        raf = requestAnimationFrame(scroll);
        return;
      }
      el.scrollTop += speed;
      if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
        el.scrollTop = 0;
      }
      raf = requestAnimationFrame(scroll);
    }

    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [paused, itemsByDate.length]);

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Daily Top Rankers ({effectiveDays}d, top {perDay})
          </h3>
        </div>
        <select
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="rounded-md border border-glass-border bg-background/65 px-2 py-1 text-[10px] text-muted-foreground"
          aria-label="News feed lookback window"
        >
          {[1, 3, 7].map((d) => (
            <option key={d} value={d}>
              Last {d} day{d === 1 ? "" : "s"}
            </option>
          ))}
        </select>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="h-[200px] overflow-hidden scrollbar-hide"
      >
        <div className="space-y-1.5">
          {showSkeleton &&
            Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="flex items-start gap-2 rounded-lg border border-glass-border bg-glass-bg/50 px-2.5 py-2"
              >
                <Skeleton variant="circle" className="h-4 w-4 shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-2/5" />
                </div>
              </div>
            ))}

          {!showSkeleton && items.length === 0 && (
            <p className="rounded-lg border border-glass-border bg-glass-bg/40 px-2.5 py-2 text-[11px] text-muted-foreground">
              No daily rankings available for this window.
            </p>
          )}

          {!showSkeleton &&
            itemsByDate.map(([date, dayItems]) => {
              const poolAmount = dayItems[0]?.poolAmount ?? 0;

              return (
                <div key={date} className="space-y-1">
                  <div className="sticky top-0 z-10 flex items-center justify-between rounded-md border border-glass-border bg-background/90 px-2 py-1 backdrop-blur-sm">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      {formatDateLabel(date)}
                    </p>
                    {poolAmount > 0 && (
                      <p className="font-mono text-[9px] text-accent">
                        Pool {formatCurrency(poolAmount)}
                      </p>
                    )}
                  </div>

                  {dayItems.map((item) => {
                    const color =
                      RANK_COLOR_MAP[item.rank] ??
                      EVENT_COLOR_MAP[item.event] ??
                      "text-foreground";

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          "flex items-start gap-2 rounded-lg border border-glass-border bg-glass-bg/50 px-2.5 py-1.5 transition-colors hover:bg-glass-bg",
                          item.isViewer && "border-accent/40 bg-accent/5",
                        )}
                      >
                        <Icon icon={item.icon} className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", color)} />
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-[11px] leading-tight", color)}>
                            <span className="font-mono">#{item.rank}</span> {item.branchName}
                            {item.isViewer ? " (You)" : ""}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            Payout {formatCurrency(item.payoutAmount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
