"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface ActivityItem {
  id: string;
  icon: "rank_up" | "rank_down" | "deal" | "commission" | "reward" | "milestone";
  message: string;
  timestamp: string;
}

const ICON_MAP: Record<ActivityItem["icon"], { emoji: string; color: string }> = {
  rank_up:    { emoji: "🔺", color: "text-gain" },
  rank_down:  { emoji: "🔻", color: "text-loss" },
  deal:       { emoji: "🏷️", color: "text-accent" },
  commission: { emoji: "💰", color: "text-warning" },
  reward:     { emoji: "🎁", color: "text-gain" },
  milestone:  { emoji: "🏆", color: "text-accent" },
};

function generateMockActivities(): ActivityItem[] {
  const branches = [
    "Chandni Chowk", "Connaught Place", "Nagpur Main", "Lajpat Nagar",
    "Koramangala", "Indiranagar", "Cyber Hub", "HSR Layout",
    "T Nagar", "Janpath", "HITEC City", "Andheri",
  ];

  const activities: ActivityItem[] = [];
  const now = Date.now();

  for (let i = 0; i < 20; i++) {
    const branch = branches[Math.floor(Math.random() * branches.length)];
    const roll = Math.random();
    let item: Omit<ActivityItem, "id" | "timestamp">;

    if (roll < 0.25) {
      const positions = Math.ceil(Math.random() * 5);
      item = { icon: "rank_up", message: `${branch} moved up ${positions} positions` };
    } else if (roll < 0.40) {
      const positions = Math.ceil(Math.random() * 3);
      item = { icon: "rank_down", message: `${branch} dropped ${positions} positions` };
    } else if (roll < 0.55) {
      const pct = Math.floor(Math.random() * 20 + 5);
      item = { icon: "deal", message: `${branch} created a ${pct}% discount deal` };
    } else if (roll < 0.70) {
      const newPct = (Math.random() * 5 + 3).toFixed(1);
      item = { icon: "commission", message: `${branch} set commission to ${newPct}%` };
    } else if (roll < 0.85) {
      const amount = Math.floor(Math.random() * 5000 + 500);
      item = { icon: "reward", message: `${branch} earned ₹${amount} payout` };
    } else {
      item = { icon: "milestone", message: `${branch} reached Top 3 ranking` };
    }

    activities.push({
      ...item,
      id: `act-${i}`,
      timestamp: new Date(now - i * 60000 * Math.floor(Math.random() * 30 + 1)).toISOString(),
    });
  }

  return activities;
}

function timeAgo(ts: string): string {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export function ActivityTicker({ className }: { className?: string }) {
  const [items] = useState<ActivityItem[]>(generateMockActivities);
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
