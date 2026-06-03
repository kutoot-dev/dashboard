"use client";



import { useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";

import {

  flattenLeaderboardPages,

  latestLeaderboardMeta,

  useInfiniteLeaderboard,

} from "@/lib/hooks/use-infinite-leaderboard";

import { PageHeader } from "@/components/layout/page-header";

import { Card } from "@/components/ui/card";

import { DateRangePicker } from "@/components/ui/date-range-picker";

import { Input } from "@/components/ui/input";

import { Select } from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";

import { InfoTooltip } from "@/components/ui/info-tooltip";

import { MyRankingCard } from "@/components/leaderboard/my-ranking-card";

import { LeaderboardRow } from "@/components/leaderboard/leaderboard-row";

import { cn } from "@/lib/utils/cn";

import {

  LEADERBOARD_COLUMN_EXPLANATIONS,

  LEADERBOARD_PARAMETER_EXPLANATIONS,

  SUB_SCORE_LABELS,

  SUB_SCORE_ORDER,

} from "@/lib/constants/scoring";

import type { LeaderboardScoringParameter } from "@/lib/types";
import { resolveMyLeaderboardRank } from "@/lib/utils/leaderboard-rank";



const PAGE_SIZE = 20;



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

  const { user } = useAuth();

  const todayIso = useMemo(() => isoDateOffset(0), []);

  const loadMoreRef = useRef<HTMLDivElement>(null);



  const [parameter, setParameter] = useState<LeaderboardScoringParameter>("all");

  useEffect(() => {
    if (!LEADERBOARD_PARAMETERS.includes(parameter)) {
      setParameter("all");
    }
  }, [parameter]);

  const [scoreDate, setScoreDate] = useState(todayIso);

  const [search, setSearch] = useState("");



  const leaderboardFilters = useMemo(() => {

    const next: {

      limit: number;

      parameter: LeaderboardScoringParameter;

      start_date?: string;

      end_date?: string;

      search?: string;

    } = {

      limit: PAGE_SIZE,

      parameter,

    };



    if (scoreDate) {

      next.start_date = scoreDate;

      next.end_date = scoreDate;

    }



    if (search.trim()) {

      next.search = search.trim();

    }



    return next;

  }, [parameter, scoreDate, search]);



  const query = useInfiniteLeaderboard(leaderboardFilters);

  const pages = query.data?.pages;

  const { pagination, filters: filtersMeta, my_entry } = latestLeaderboardMeta(pages);

  const items = flattenLeaderboardPages(pages);

  const branchId = useEffectiveBranchId();

  const myDisplayRank = useMemo(
    () => resolveMyLeaderboardRank(parameter, my_entry, items, branchId),
    [parameter, my_entry, items, branchId],
  );

  const showInitialSkeleton =

    query.isPending || (query.isFetching && !query.isFetchingNextPage && items.length === 0);



  const scoreColumnLabel =

    parameter === "all" ? "Overall score" : parameterLabel(parameter);

  const scoreColumnExplanation =

    parameter === "all"

      ? LEADERBOARD_COLUMN_EXPLANATIONS.score

      : `${parameterExplanation(parameter)} This column shows that score for each shop.`;



  const activeSnapshotDate = filtersMeta?.snapshot_date;

  const dateSummary = formatDisplayDate(scoreDate || activeSnapshotDate || todayIso);



  function onScoreDateChange(value: string) {

    setScoreDate(value || todayIso);

  }



  useEffect(() => {

    const el = loadMoreRef.current;

    if (!el) return;



    const observer = new IntersectionObserver(

      (entries) => {

        if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {

          void query.fetchNextPage();

        }

      },

      { rootMargin: "280px" },

    );



    observer.observe(el);

    return () => observer.disconnect();

  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);



  return (

    <div className="space-y-6">

      <PageHeader

        title="Rankings"

        subtitle="See how branches rank for a day and sort by the score that matters to you."

      />



      <MyRankingCard

        entry={my_entry}

        displayRank={myDisplayRank}

        parameter={parameter}

        parameterLabel={parameterLabel(parameter)}

        dateLabel={dateSummary}

        isLoading={showInitialSkeleton || (Boolean(my_entry) && myDisplayRank == null)}

        businessName={user?.name}

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

            {pagination?.total ?? "—"} branches

          </p>

        </div>



        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

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



          <Input

            label="Search branches"

            placeholder="Business, city, state, or sector"

            value={search}

            onChange={(e) => setSearch(e.target.value)}

          />



          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">

            <label

              htmlFor="leaderboard-sort-parameter"

              className="text-xs font-medium text-muted-foreground"

            >

              Sort leaderboard by

            </label>

            <Select

              id="leaderboard-sort-parameter"

              value={parameter}

              onChange={(value) => setParameter(value as LeaderboardScoringParameter)}

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

              {showInitialSkeleton &&

                Array.from({ length: 8 }).map((_, i) => (

                  <tr key={`sk-${i}`} className="border-b border-border/40">

                    {Array.from({ length: 6 }).map((__, j) => (

                      <td key={j} className="px-3 py-3">

                        <Skeleton className="h-4 w-20" />

                      </td>

                    ))}

                  </tr>

                ))}



              {!showInitialSkeleton &&

                items.map((row) => (

                  <LeaderboardRow

                    key={`${row.branch_id}-${row.rank}-${row.period_date ?? "current"}`}

                    row={row}

                    parameter={parameter}

                    isViewer={Boolean(branchId && row.branch_id === branchId)}

                  />

                ))}



              {!showInitialSkeleton && items.length === 0 && (

                <tr>

                  <td colSpan={6} className="px-3 py-10 text-center text-sm text-muted-foreground">

                    {search.trim()

                      ? "No branches match your search. Try a different name, city, or sector."

                      : "No leaderboard entries found for this date."}

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>



        <div

          ref={loadMoreRef}

          className="flex flex-col items-center gap-2 border-t border-border/60 px-4 py-4"

        >

          {query.isFetchingNextPage && (

            <div className="flex w-full flex-col gap-2">

              {Array.from({ length: 3 }).map((_, i) => (

                <Skeleton key={i} className="h-10 w-full rounded-lg" />

              ))}

            </div>

          )}



          {!query.isFetchingNextPage && items.length > 0 && (

            <p className="text-xs text-muted-foreground">

              {query.hasNextPage

                ? "Scroll for more branches"

                : `Showing all ${items.length.toLocaleString("en-IN")} of ${(pagination?.total ?? items.length).toLocaleString("en-IN")} branches`}

              {activeSnapshotDate ? ` · Scores for ${formatDisplayDate(activeSnapshotDate)}` : null}

            </p>

          )}

        </div>

      </Card>

    </div>

  );

}


