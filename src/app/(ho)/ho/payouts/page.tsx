"use client";

import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useHOBranches, useHOBranchScores, useHOPortfolio } from "@/lib/hooks/use-ho";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore } from "@/lib/utils/format";
import { PAYOUTS } from "@/lib/constants/strings";

export default function HOPayoutsPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";

  const { data: branches, isLoading: branchesLoading } = useHOBranches(hoId);
  const { data: branchScores, isLoading: scoresLoading } = useHOBranchScores(hoId);
  const { data: portfolio, isLoading: portfolioLoading } = useHOPortfolio(hoId);

  const isLoading = branchesLoading || scoresLoading || portfolioLoading;

  const branchNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (branches ?? []).forEach((b) => map.set(b.branch_id, b.business_name));
    return map;
  }, [branches]);

  const scores = branchScores ?? [];

  // Sort by payout descending
  const ranked = useMemo(
    () => [...scores].sort((a, b) => b.payout_amount - a.payout_amount),
    [scores],
  );

  const totalPayout = portfolio?.totalPayout ?? 0;
  const paidCount = scores.filter((s) => s.payout_amount > 0).length;

  return (
    <div className="space-y-4">
      <PageHeader title={PAYOUTS.TITLE_HO} subtitle={PAYOUTS.SUBTITLE_HO} />

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {PAYOUTS.TOTAL_EARNED}
            </p>
            <InfoTooltip text="Sum of all payouts across your branches for the current period." />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <span className="font-mono text-3xl font-bold text-gain">
              {formatINR(totalPayout)}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Branches Earning
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <span className="font-mono text-3xl font-bold text-foreground">
              {paidCount}
              <span className="ml-1 text-sm text-muted-foreground">/ {scores.length}</span>
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Avg Payout per Branch
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <span className="font-mono text-3xl font-bold text-foreground">
              {formatINR(scores.length > 0 ? totalPayout / scores.length : 0)}
            </span>
          )}
        </Card>
      </div>

      {/* Branch payout table */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Branch Payouts
          </h2>
          <InfoTooltip text="Payout breakdown per branch for the latest scoring period." />
        </div>
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        ) : ranked.length === 0 ? (
          <EmptyState title="No payout data" description="Payouts will appear after scoring periods close." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    Branch
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    {PAYOUTS.COL_SCORE}
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    {PAYOUTS.COL_RANK}
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    {PAYOUTS.COL_REWARD}
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    {PAYOUTS.COL_STATUS}
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((s, idx) => {
                  const status: "paid" | "non_monetary" | "none" =
                    s.payout_amount > 50 ? "paid" : s.payout_amount > 0 ? "non_monetary" : "none";
                  return (
                    <tr
                      key={`${s.branch_id}-${idx}`}
                      className="border-b border-border transition-colors hover:bg-card-hover"
                    >
                      <td className="px-3 py-2 font-mono text-xs text-foreground">
                        {branchNameMap.get(s.branch_id) ?? s.branch_id}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">
                        {formatScore(s.composite_index_score)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                        #{s.final_rank}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">
                        {s.payout_amount > 0 ? formatINR(s.payout_amount) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {status === "paid" ? (
                          <Badge variant="gain">Paid</Badge>
                        ) : status === "non_monetary" ? (
                          <Badge variant="neutral">Non-monetary</Badge>
                        ) : (
                          <Badge variant="loss">None</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
