"use client";

import { useSyncExternalStore } from "react";
import { formatScorePercent } from "@/lib/utils/format";
import { formatRank } from "@/lib/utils/format-rank";
import { cn } from "@/lib/utils/cn";

interface DashboardHeroProps {
  userName?: string | null;
  compositeScore: number;
  compositeRank: number | null;
  activeDeals?: number;
  className?: string;
}

function useIstDateLabel() {
  return useSyncExternalStore(
    () => () => {},
    () =>
      new Date().toLocaleDateString("en-IN", {
        timeZone: "Asia/Kolkata",
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
    () => "",
  );
}

export function DashboardHero({
  userName,
  compositeScore,
  compositeRank,
  activeDeals = 0,
  className,
}: DashboardHeroProps) {
  const dateLabel = useIstDateLabel();
  const firstName = userName?.trim().split(/\s+/)[0] ?? "there";

  return (
    <header className={cn("space-y-4", className)}>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Merchant dashboard · {dateLabel}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Today at a glance
        </h1>
        <p className="text-sm text-muted-foreground">
          Hi {firstName} — here is how your branch is performing right now.
        </p>
      </div>

      <div
        className="flex gap-2 overflow-x-auto pb-0.5 sm:flex-wrap sm:overflow-visible"
        aria-label="Live score summary"
      >
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 py-2.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Score
          </span>
          <span className="font-tabular text-lg font-semibold text-foreground">
            {formatScorePercent(compositeScore)}
          </span>
        </div>

        {typeof compositeRank === "number" && compositeRank >= 1 && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Rank
            </span>
            <span className="font-tabular text-lg font-semibold text-accent">{formatRank(compositeRank)}</span>
          </div>
        )}

        {typeof activeDeals === "number" && (
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2.5">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Active deals
            </span>
            <span className="font-tabular text-lg font-semibold text-foreground">{activeDeals}</span>
          </div>
        )}
      </div>
    </header>
  );
}
