"use client";

import { useMemo, useState } from "react";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { formatScore, formatScoreChange } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import {
  LEADERBOARD_COLUMN_EXPLANATIONS,
  LEADERBOARD_PARAMETER_EXPLANATIONS,
  SUB_SCORE_LABELS,
  SUB_SCORE_ORDER,
} from "@/lib/constants/scoring";
import type { LeaderboardScoringParameter } from "@/lib/types";

const LEADERBOARD_PARAMETERS: LeaderboardScoringParameter[] = [
  "all",
  ...SUB_SCORE_ORDER,
] as LeaderboardScoringParameter[];

const PARAMETER_SELECT_OPTIONS = LEADERBOARD_PARAMETERS.map((key) => ({
  value: key,
  label: key === "all" ? "Overall" : (SUB_SCORE_LABELS[key] ?? key),
}));

function isoDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function parameterLabel(key: LeaderboardScoringParameter): string {
  if (key === "all") return "Overall";
  return SUB_SCORE_LABELS[key] ?? key;
}

function parameterExplanation(key: LeaderboardScoringParameter): string {
  return (
    LEADERBOARD_PARAMETER_EXPLANATIONS[key] ??
    "This score is part of your overall ranking."
  );
}

function TableHeader({
  label,
  explanation,
  className,
}: {
  label: string;
  explanation: string;
  className?: string;
}) {
  return (
    <th className={cn("group px-3 py-2.5 font-medium", className)}>
      <span className="inline-flex items-center gap-1.5">
        <span>{label}</span>
        <InfoTooltip
          text={explanation}
          size="sm"
          label={`About the ${label} column`}
          className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 max-sm:opacity-70"
        />
      </span>
    </th>
  );
}

export default function LeaderboardPage() {
  const todayIso = useMemo(() => isoDateOffset(0), []);

  const [page, setPage] = useState(1);
  const [parameter, setParameter] = useState<LeaderboardScoringParameter>("all");
  const [scoreDate, setScoreDate] = useState(todayIso);

  const leaderboardFilters = useMemo(() => {
    const next: {
      page: number;
      limit: number;
      parameter: LeaderboardScoringParameter;
      start_date?: string;
      end_date?: string;
    } = {
      page,
      limit: 20,
      parameter,
    };

    if (scoreDate) {
      next.start_date = scoreDate;
      next.end_date = scoreDate;
    }

    return next;
  }, [page, parameter, scoreDate]);

  const query = useLeaderboard(leaderboardFilters);

  const data = query.data;
  const showSkeleton = useQuerySkeleton(query);
  const scoreColumnLabel =
    parameter === "all" ? "Overall score" : parameterLabel(parameter);
  const scoreColumnExplanation =
    parameter === "all"
      ? LEADERBOARD_COLUMN_EXPLANATIONS.score
      : `${parameterExplanation(parameter)} This column shows that score for each shop.`;

  const activeSnapshotDate = data?.filters?.snapshot_date;
  const dateSummary = formatDisplayDate(scoreDate || activeSnapshotDate || todayIso);

  function onScoreDateChange(value: string) {
    setPage(1);
    setScoreDate(value || todayIso);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rankings"
        subtitle="See how branches rank for a day and sort by the score that matters to you."
      />

      <Card className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Filters</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pick a score date and how to sort the list.
            </p>
          </div>
          <p className="text-xs text-muted-foreground sm:text-right">
            {data?.pagination.total ?? "—"} branches
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DateRangePicker
            mode="single"
            label="Score date"
            max={todayIso}
            value={{ start: scoreDate, end: scoreDate }}
            presets={[
              { label: "Today", days: 0 },
              { label: "Yesterday", days: 1 },
            ]}
            onChange={(range) => onScoreDateChange(range.start || todayIso)}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="leaderboard-sort-parameter"
              className="text-xs font-medium text-muted-foreground"
            >
              Sort leaderboard by
            </label>
            <Select
              id="leaderboard-sort-parameter"
              value={parameter}
              onChange={(value) => {
                setParameter(value as LeaderboardScoringParameter);
                setPage(1);
              }}
              options={PARAMETER_SELECT_OPTIONS}
            />
            <p className="text-xs text-muted-foreground">
              Choose which score column ranks the table.
            </p>
          </div>
        </div>

        <div
          className="rounded-lg border border-accent/25 bg-accent/5 px-3 py-2.5 sm:px-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-xs font-semibold text-accent">
            Showing: {dateSummary} · Ranking by {parameterLabel(parameter)}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {parameterExplanation(parameter)}
          </p>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-left text-xs text-muted-foreground">
                <TableHeader
                  label="Rank"
                  explanation={LEADERBOARD_COLUMN_EXPLANATIONS.rank}
                  className="w-16"
                />
                <TableHeader
                  label="Business"
                  explanation={LEADERBOARD_COLUMN_EXPLANATIONS.business}
                />
                <TableHeader
                  label="Sector"
                  explanation={LEADERBOARD_COLUMN_EXPLANATIONS.sector}
                />
                <TableHeader label={scoreColumnLabel} explanation={scoreColumnExplanation} />
                <TableHeader
                  label="Change"
                  explanation={LEADERBOARD_COLUMN_EXPLANATIONS.change}
                />
                <TableHeader
                  label="Successful tx"
                  explanation={LEADERBOARD_COLUMN_EXPLANATIONS.successful_tx}
                />
              </tr>
            </thead>
            <tbody>
              {showSkeleton &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`sk-${i}`} className="border-b border-border/40">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-3 py-3">
                        <Skeleton className="h-4 w-20" />
                      </td>
                    ))}
                  </tr>
                ))}

              {!showSkeleton &&
                data?.items?.map((row) => {
                  const displayScore =
                    parameter === "all"
                      ? row.composite_score
                      : (row.parameter_score ??
                        row.sub_scores?.[parameter as keyof typeof row.sub_scores] ??
                        row.composite_score);

                  return (
                    <tr
                      key={`${row.branch_id}-${row.rank}-${row.period_date ?? "current"}`}
                      className="border-b border-border/50 transition-colors hover:bg-muted/15"
                    >
                      <td className="px-3 py-3 font-mono text-sm font-semibold text-foreground">
                        #{row.rank}
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-foreground">{row.business_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.city_name}, {row.state}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{row.sector_name}</td>
                      <td className="px-3 py-3 font-mono text-sm font-semibold text-foreground">
                        {formatScore(displayScore)}
                      </td>
                      <td className="px-3 py-3 font-mono text-sm text-muted-foreground">
                        {formatScoreChange(row.score_change)}
                      </td>
                      <td className="px-3 py-3 font-mono text-sm text-foreground">
                        {row.successful_transactions ?? 0}
                      </td>
                    </tr>
                  );
                })}

              {!showSkeleton && (!data?.items || data.items.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    No leaderboard entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Page {data?.pagination.page ?? page} of {data?.pagination.total_pages ?? 1}
            {activeSnapshotDate ? ` · Scores for ${formatDisplayDate(activeSnapshotDate)}` : null}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1 || showSkeleton}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= (data?.pagination.total_pages ?? 1) || showSkeleton}
              onClick={() => setPage((p) => Math.min(data?.pagination.total_pages ?? 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
