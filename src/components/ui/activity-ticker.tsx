"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/client";
import type { ApiResponse } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export interface ActivityItem {
  id: string;
  icon: "rank_up" | "rank_down" | "deal" | "commission" | "reward" | "milestone";
  message: string;
  timestamp: string;
}

interface BackendActivityItem {
  id: string;
  icon_type: string;
  message: string;
  branch_name: string | null;
  branch_id: string | null;
  created_at: string;
}

const ICON_MAP: Record<ActivityItem["icon"], { emoji: string; color: string }> = {
  rank_up:    { emoji: "🔺", color: "text-gain" },
  rank_down:  { emoji: "🔻", color: "text-loss" },
  deal:       { emoji: "🏷️", color: "text-accent" },
  commission: { emoji: "💰", color: "text-warning" },
  reward:     { emoji: "🎁", color: "text-gain" },
  milestone:  { emoji: "🏆", color: "text-accent" },
};

const VALID_ICONS = new Set<string>(Object.keys(ICON_MAP));

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function ActivityTicker({ className }: { className?: string }) {
  const { data: backendItems } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<BackendActivityItem[]>>("/activity?limit=50");
      return res.data.data;
    },
    refetchInterval: 60_000,
    retry: false,
  });

  const items: ActivityItem[] = (backendItems ?? []).map((item) => ({
    id: item.id,
    icon: (VALID_ICONS.has(item.icon_type) ? item.icon_type : "milestone") as ActivityItem["icon"],
    message: item.message,
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
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Live Activity
          </h3>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="h-[200px] overflow-hidden scrollbar-hide"
      >
        <div className="space-y-1.5">
          {items.map((item) => {
            const { emoji, color } = ICON_MAP[item.icon];
            return (
              <div
                key={item.id}
                className="flex items-start gap-2 rounded-lg border border-glass-border bg-glass-bg/50 px-2.5 py-1.5 transition-colors hover:bg-glass-bg"
              >
                <span className="text-xs flex-shrink-0">{emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[11px] leading-tight", color)}>
                    {item.message}
                  </p>
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
