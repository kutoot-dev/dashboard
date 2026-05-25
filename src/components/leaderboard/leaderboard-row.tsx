"use client";

import { cn } from "@/lib/utils/cn";
import { formatScore, formatScoreChange, getChangeColor } from "@/lib/utils/format";
import type { LeaderboardEntry, LeaderboardScoringParameter } from "@/lib/types";

const PODIUM_RANK_STYLES: Record<number, string> = {
  1: "bg-[var(--tier-legend)]/15 border-[var(--tier-legend)]/35 text-[var(--tier-legend)]",
  2: "bg-[var(--tier-elite)]/12 border-[var(--tier-elite)]/30 text-[var(--tier-elite)]",
  3: "bg-[var(--tier-pro)]/12 border-[var(--tier-pro)]/30 text-[var(--tier-pro)]",
};

function rowScore(
  row: LeaderboardEntry,
  parameter: LeaderboardScoringParameter,
): number {
  if (parameter === "all") return row.composite_score;
  return (
    row.parameter_score ??
    row.sub_scores?.[parameter as keyof typeof row.sub_scores] ??
    row.composite_score
  );
}

interface LeaderboardRowProps {
  row: LeaderboardEntry;
  parameter: LeaderboardScoringParameter;
  isViewer?: boolean;
}

export function LeaderboardRow({ row, parameter, isViewer }: LeaderboardRowProps) {
  const displayScoreValue = rowScore(row, parameter);
  const podiumStyle = PODIUM_RANK_STYLES[row.rank];

  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors",
        isViewer
          ? "bg-primary/8 hover:bg-primary/12"
          : row.rank <= 3
            ? "bg-muted/10 hover:bg-muted/20"
            : "hover:bg-muted/15",
      )}
    >
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex min-w-[2.5rem] items-center justify-center rounded-lg border px-2 py-0.5 font-mono text-sm font-semibold",
            podiumStyle ?? "border-border/60 bg-card/50 text-foreground",
          )}
        >
          #{row.rank}
        </span>
      </td>
      <td className="px-3 py-3">
        <p className={cn("font-medium", isViewer ? "text-primary" : "text-foreground")}>
          {row.business_name}
          {isViewer && (
            <span className="ml-2 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              You
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {row.city_name}, {row.state}
        </p>
      </td>
      <td className="px-3 py-3 text-muted-foreground">{row.sector_name}</td>
      <td className="px-3 py-3 font-mono text-sm font-semibold text-foreground">
        {formatScore(displayScoreValue)}
      </td>
      <td
        className={cn(
          "px-3 py-3 font-mono text-sm",
          getChangeColor(row.score_change),
        )}
      >
        {formatScoreChange(row.score_change)}
      </td>
      <td className="px-3 py-3 font-mono text-sm text-foreground">
        {row.successful_transactions ?? 0}
      </td>
    </tr>
  );
}
