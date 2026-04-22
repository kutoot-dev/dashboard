"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useBranchScore, useBranchPayouts } from "@/lib/hooks/use-branch-data";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { RewardPoolCard } from "@/components/ui/reward-pool-card";
import { AreaChart } from "@/components/charts/area-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore, formatPeriodRange } from "@/lib/utils/format";

export default function PayoutsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const { data: currentScore, isLoading: scoreLoading } =
    useBranchScore(branchId);
  const { data: payouts, isLoading: payoutsLoading } =
    useBranchPayouts(branchId);
  const { data: periods, isLoading: periodsLoading } = useScoringPeriods();

  // Build payout history from real API data
  const payoutHistory = useMemo(() => {
    if (!payouts) return [];
    return payouts.map((p) => ({
      time: p.period_label,
      period_label: p.period_label,
      score: p.score ?? 0,
      rank: p.rank ?? 0,
      amount: p.allocated_amount ?? 0,
      status: (p.status === "paid" ? "paid" : (p.allocated_amount ?? 0) > 0 ? "non_monetary" : "none") as "paid" | "non_monetary" | "none",
    }));
  }, [payouts]);

  const latestPeriod = periods?.[periods.length - 1];
  const dailyPool = latestPeriod?.pool_amount ?? 0;

  const totalPaid = useMemo(
    () =>
      payoutHistory
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + p.amount, 0),
    [payoutHistory],
  );

  // Chart data: payout amounts over time
  const chartData = useMemo(
    () =>
      payoutHistory.map((p) => ({
        time: p.time,
        value: p.amount,
      })),
    [payoutHistory],
  );

  const isLoading = payoutsLoading || scoreLoading || periodsLoading;

  return (
    <div className="space-y-4">
      <PageHeader title="Rewards" subtitle="Your reward history and daily pool" />

      {/* Daily Reward Pool */}
      <RewardPoolCard totalPool={dailyPool} merchantShare={currentScore ? currentScore.payout_amount : undefined} />

      {/* Top row: total earned + chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Total Earned
            </p>
            <InfoTooltip text="Total amount you have earned from all completed periods combined." />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <span className="font-mono text-3xl font-bold text-gain">
              {formatINR(totalPaid)}
            </span>
          )}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                Periods rewarded
                <InfoTooltip text="Number of scoring periods where you earned a cash reward (score above 55). Each qualifying period, you receive your share from the daily reward pool distributed at 11 PM." />
              </span>
              <span className="font-mono text-foreground">
                {payoutHistory.filter((p) => p.status === "paid").length}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current rank</span>
              <span className="font-mono text-foreground">
                #{currentScore?.final_rank ?? "—"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current score</span>
              <span className="font-mono text-foreground">
                {currentScore ? formatScore(currentScore.composite_index_score) : "—"}
              </span>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden p-0 lg:col-span-3">
          {isLoading ? (
            <Skeleton variant="rect" className="h-[250px]" />
          ) : chartData.length > 0 ? (
            <AreaChart data={chartData} height={250} color="#22c55e" />
          ) : (
            <EmptyState title="No payout data" />
          )}
        </Card>
      </div>

      {/* Reward History Table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Reward History
          </h2>
          <InfoTooltip text="Complete history of your rewards from each scoring period. Rewards are calculated based on your score and rank." />
        </div>
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-4 py-3"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        ) : payoutHistory.length === 0 ? (
          <EmptyState
            title="No reward history"
            description="Rewards will appear after scoring periods close."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    Period
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    Rank
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    Reward
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...payoutHistory].reverse().map((row) => (
                  <tr
                    key={row.time}
                    className="border-b border-border transition-colors hover:bg-card-hover"
                  >
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {row.period_label}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">
                      {formatScore(row.score)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                      #{row.rank}
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">
                      {row.amount > 0 ? formatINR(row.amount) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.status === "paid" ? (
                        <Badge variant="gain">Paid</Badge>
                      ) : row.status === "non_monetary" ? (
                        <Badge variant="neutral">Non-monetary</Badge>
                      ) : (
                        <Badge variant="loss">None</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
