"use client";

import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { faMinus } from "@fortawesome/free-solid-svg-icons";
import { faCaretDown, faCaretUp, faCrown, faTrophy } from "@/lib/icons";
import { cn } from "@/lib/utils/cn";
import {
  formatScore,
  formatScoreChange,
  getChangeColor,
  getRankTier,
} from "@/lib/utils/format";
import type { LeaderboardMyEntry, LeaderboardScoringParameter } from "@/lib/types";

const TIER_STYLES = {
  platinum: {
    gradient: "from-[var(--tier-legend)]/25 via-[var(--primary)]/15 to-[var(--accent)]/20",
    border: "border-[var(--tier-legend)]/45",
    badge: "bg-[var(--tier-legend)]/20 text-[var(--tier-legend)]",
    rank: "text-[var(--tier-legend)]",
  },
  gold: {
    gradient: "from-[var(--tier-elite)]/25 via-[var(--warning)]/10 to-[var(--secondary)]/15",
    border: "border-[var(--tier-elite)]/45",
    badge: "bg-[var(--tier-elite)]/20 text-[var(--tier-elite)]",
    rank: "text-[var(--tier-elite)]",
  },
  silver: {
    gradient: "from-[var(--tier-pro)]/20 via-[var(--info)]/10 to-[var(--accent)]/15",
    border: "border-[var(--tier-pro)]/40",
    badge: "bg-[var(--tier-pro)]/20 text-[var(--tier-pro)]",
    rank: "text-[var(--tier-pro)]",
  },
  bronze: {
    gradient: "from-[var(--tier-rising)]/20 via-[var(--secondary)]/10 to-[var(--warning)]/10",
    border: "border-[var(--tier-rising)]/40",
    badge: "bg-[var(--tier-rising)]/20 text-[var(--tier-rising)]",
    rank: "text-[var(--tier-rising)]",
  },
  none: {
    gradient: "from-primary/15 via-card to-accent/10",
    border: "border-primary/25",
    badge: "bg-muted text-muted-foreground",
    rank: "text-foreground",
  },
} as const;

const TIER_LABELS = {
  platinum: "Top 1%",
  gold: "Top 5%",
  silver: "Top 15%",
  bronze: "Top 30%",
  none: "Climbing",
} as const;

function displayScore(
  entry: LeaderboardMyEntry,
  parameter: LeaderboardScoringParameter,
): number {
  if (parameter === "all") return entry.composite_score;
  return (
    entry.parameter_score ??
    entry.sub_scores?.[parameter as keyof typeof entry.sub_scores] ??
    entry.composite_score
  );
}

function RankChangeIcon({ change }: { change: number }) {
  if (change > 0) return <Icon icon={faCaretUp} className="h-3.5 w-3.5 text-gain" aria-hidden />;
  if (change < 0) return <Icon icon={faCaretDown} className="h-3.5 w-3.5 text-loss" aria-hidden />;
  return <Icon icon={faMinus} className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
}

interface MyRankingCardProps {
  entry: LeaderboardMyEntry | null | undefined;
  parameter: LeaderboardScoringParameter;
  parameterLabel: string;
  dateLabel: string;
  isLoading?: boolean;
  businessName?: string;
}

export function MyRankingCard({
  entry,
  parameter,
  parameterLabel,
  dateLabel,
  isLoading,
  businessName,
}: MyRankingCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden border-primary/20 p-5 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-12 w-24 rounded bg-muted" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-muted/60" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!entry) {
    return (
      <Card className="border-dashed border-border/80 p-5 text-sm text-muted-foreground sm:p-6">
        Your branch ranking will appear here once scores are available for {dateLabel}.
      </Card>
    );
  }

  const poolTotal = entry.rank_pool_total ?? entry.list_total ?? 0;
  const tier = getRankTier(entry.rank, Math.max(poolTotal, 1));
  const styles = TIER_STYLES[tier];
  const score = displayScore(entry, parameter);
  const percentile =
    poolTotal > 0 ? Math.min(100, Math.round((entry.rank / poolTotal) * 100)) : null;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border bg-gradient-to-br p-5 sm:p-6",
        styles.gradient,
        styles.border,
      )}
      aria-label="Your branch ranking"
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/20 blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-secondary/15 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                styles.badge,
              )}
            >
              <Icon icon={faCrown} className="h-3 w-3" aria-hidden />
              Your rank
            </span>
            <span className="rounded-full bg-card/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {dateLabel} · {parameterLabel}
            </span>
            {tier !== "none" && (
              <span className={cn("text-[10px] font-semibold uppercase tracking-wider", styles.rank)}>
                {TIER_LABELS[tier]}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-foreground">
            {businessName ?? entry.business_name}
          </p>
          <p className="text-xs text-muted-foreground">
            {entry.city_name}
            {entry.state ? `, ${entry.state}` : ""}
            {entry.sector_name ? ` · ${entry.sector_name}` : ""}
          </p>

          {entry.visible_in_list === false && (
            <p className="text-xs text-warning">
              Hidden by search — clear search to see your branch in the list below.
            </p>
          )}
        </div>

        <div className="flex items-end gap-3 sm:flex-col sm:items-end">
          <div className="flex items-center gap-2">
            <Icon icon={faTrophy} className={cn("h-8 w-8", styles.rank)} aria-hidden />
            <span className={cn("font-display text-4xl font-bold tabular-nums sm:text-5xl", styles.rank)}>
              #{entry.rank}
            </span>
          </div>
          {poolTotal > 0 && (
            <p className="text-xs text-muted-foreground">
              of {poolTotal.toLocaleString("en-IN")} branches
              {percentile !== null ? ` · top ${percentile}%` : null}
            </p>
          )}
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {parameterLabel} score
          </p>
          <p className="mt-0.5 font-tabular text-lg font-semibold text-foreground">
            {formatScore(score)}
          </p>
        </div>

        <div className="rounded-xl border border-accent/25 bg-accent/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Movement
          </p>
          <p
            className={cn(
              "mt-0.5 flex items-center gap-1 font-tabular text-lg font-semibold",
              getChangeColor(entry.score_change),
            )}
          >
            <RankChangeIcon change={entry.score_change} />
            {formatScoreChange(entry.score_change)}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--gain)]/25 bg-[var(--gain)]/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Successful tx
          </p>
          <p className="mt-0.5 font-tabular text-lg font-semibold text-foreground">
            {(entry.successful_transactions ?? 0).toLocaleString("en-IN")}
          </p>
        </div>

        <div className="rounded-xl border border-[var(--info)]/25 bg-[var(--info)]/10 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Overall
          </p>
          <p className="mt-0.5 font-tabular text-lg font-semibold text-foreground">
            {formatScore(entry.composite_score)}
          </p>
        </div>
      </div>
    </Card>
  );
}
