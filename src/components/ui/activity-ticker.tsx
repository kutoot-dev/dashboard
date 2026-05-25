"use client";

import { useEffect, useRef, useState } from "react";
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
  merchantLocationName: string | null;
  userName: string | null;
  timestamp: string;
}

const EVENT_COLOR_MAP: Record<string, string> = {
  created: "text-gain",
  updated: "text-accent",
  deleted: "text-loss",
  scanned: "text-warning",
  approved: "text-gain",
  rejected: "text-loss",
  merchant_submitted: "text-accent",
  onboarding_link_sent: "text-accent",
  store_profile_completed: "text-gain",
  password_reset: "text-warning",
  credentials_resent_email: "text-accent",
  credentials_resent_sms: "text-accent",
};

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function ActivityTicker({ className }: { className?: string }) {
  const [hours, setHours] = useState(24);

  const feedQuery = useQuery({
    queryKey: ["merchant-news-feed", hours],
    queryFn: async () => {
      const res = await getMerchantNewsFeed({ hours, limit: 50 });
      return res.success ? res.data : null;
    },
    refetchInterval: 60_000,
    retry: false,
  });

  const data = feedQuery.data;
  const showSkeleton = useQuerySkeleton(feedQuery);
  const backendItems = data?.rows ?? [];
  const effectiveHours = data?.hours ?? hours;

  const items: ActivityItem[] = backendItems.map((item) => ({
    id: item.id,
    icon: newsFeedIcon(item.event, item.icon),
    event: item.event,
    message: item.message,
    merchantLocationName: item.merchant_location_name ?? null,
    userName: item.user_name ?? null,
    timestamp: item.created_at,
  }));

  const scrollRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let raf: number;
    const speed = 0.5; // px per frame

    function scroll() {
      if (!el || paused) {
        raf = requestAnimationFrame(scroll);
        return;
      }
      el.scrollTop += speed;
      // Loop back when reaching bottom
      if (el.scrollTop >= el.scrollHeight - el.clientHeight) {
        el.scrollTop = 0;
      }
      raf = requestAnimationFrame(scroll);
    }

    raf = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <div className={cn("relative", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            News Feed ({effectiveHours}h)
          </h3>
        </div>
        <select
          value={hours}
          onChange={(event) => setHours(Number(event.target.value))}
          className="rounded-md border border-glass-border bg-background/65 px-2 py-1 text-[10px] text-muted-foreground"
          aria-label="News feed lookback window"
        >
          {[6, 12, 24, 48, 72, 168].map((h) => (
            <option key={h} value={h}>
              Last {h}h
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
              No merchant activity in this window.
            </p>
          )}
          {!showSkeleton &&
            items.map((item) => {
            const color = EVENT_COLOR_MAP[item.event] ?? "text-foreground";
            return (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-lg border border-glass-border bg-glass-bg/50 px-2.5 py-1.5 transition-colors hover:bg-glass-bg"
              >
                <Icon icon={item.icon} className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", color)} />
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11px] leading-tight", color)}>
                    {item.message}
                  </p>
                  {(item.merchantLocationName || item.userName) && (
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {item.merchantLocationName ? `Location: ${item.merchantLocationName}` : ""}
                      {item.userName ? `${item.merchantLocationName ? " • " : ""}User: ${item.userName}` : ""}
                    </p>
                  )}
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {timeAgo(item.timestamp)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
