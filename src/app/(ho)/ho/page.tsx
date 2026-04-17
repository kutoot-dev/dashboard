"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useHOBranches, useHOBranchScores, useHOPortfolio } from "@/lib/hooks/use-ho";
import { useLiveScore } from "@/lib/hooks/use-live-data";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ScoreDisplay } from "@/components/ui/score-display";
import { RankBadge } from "@/components/ui/rank-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore } from "@/lib/utils/format";
import { HO_DASHBOARD } from "@/lib/constants/strings";
import { KMIChart } from "@/components/charts/kmi-chart";
import { TradingViewChart } from "@/components/charts/trading-view-chart";

export default function HODashboardPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const { data: branches, isLoading: branchesLoading } = useHOBranches(hoId);
  const { data: branchScores, isLoading: scoresLoading } = useHOBranchScores(hoId);
  const { data: portfolio, isLoading: portfolioLoading } = useHOPortfolio(hoId);

  const liveAvg = useLiveScore(portfolio?.avgScore ?? 0);
  const isLoading = branchesLoading || scoresLoading || portfolioLoading;
  const totalBranches = portfolio?.totalBranches ?? 0;

  // Map scores by branch_id for easy lookup
  const scoreMap = new Map(
    (branchScores ?? []).map((s) => [s.branch_id, s])
  );

  return (
    <div className="space-y-4">
      <PageHeader title={HO_DASHBOARD.TITLE} subtitle={HO_DASHBOARD.SUBTITLE} />

      {/* KBI Chart */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Kutoot Branch Index (KBI)
            </h2>
            <InfoTooltip text="Platform-wide branch performance index. Shows aggregate health of all branches." />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gain" />
            </span>
            <span className="font-mono text-[10px] uppercase text-gain">Live</span>
          </div>
        </div>
        <KMIChart height={160} />
      </Card>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {HO_DASHBOARD.TOTAL_BRANCHES}
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <span className="font-mono text-4xl font-bold text-foreground">
              {portfolio?.totalBranches ?? 0}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {HO_DASHBOARD.AVG_SCORE}
            </p>
            <InfoTooltip text="Average score across all your branches in the latest period." />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-28" />
          ) : (
            <ScoreDisplay score={liveAvg.current} change={liveAvg.change} size="lg" />
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {HO_DASHBOARD.TOTAL_PAYOUT}
            </p>
            <InfoTooltip text="Sum of payouts across all your branches for the latest period." />
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : (
            <span className="font-mono text-3xl font-bold text-gain">
              {formatINR(portfolio?.totalPayout ?? 0)}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {HO_DASHBOARD.TOP_PERFORMER}
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-10 w-32" />
          ) : (
            <span className="font-mono text-sm font-semibold text-foreground truncate">
              {portfolio?.bestBranchName ?? "—"}
            </span>
          )}
        </Card>
      </div>

      {/* Branch Holdings */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {HO_DASHBOARD.HOLDINGS}
          </h2>
          <InfoTooltip text="Each of your branches with their current score and rank. Click to view details." />
        </div>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : branches && branches.length > 0 ? (
          <div className="space-y-1">
            {branches.map((branch) => {
              const score = scoreMap.get(branch.branch_id);
              const isSelected = selectedBranch === branch.branch_id;
              return (
                <button
                  key={branch.branch_id}
                  onClick={() => setSelectedBranch(isSelected ? null : branch.branch_id)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left transition-colors",
                    isSelected
                      ? "bg-accent/10 border border-accent/20"
                      : "hover:bg-muted/50"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs text-muted-foreground w-6">
                      {score ? `#${score.final_rank}` : "—"}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-medium text-foreground truncate">
                        {branch.business_name}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {branch.branch_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {score && (
                      <>
                        <RankBadge rank={score.final_rank} totalBranches={totalBranches} />
                        <div className="text-right">
                          <p className="font-mono text-sm font-bold text-foreground">
                            {formatScore(score.composite_index_score)}
                          </p>
                          <p className={cn(
                            "font-mono text-[10px]",
                            score.rank_movement > 0 ? "text-gain" : score.rank_movement < 0 ? "text-loss" : "text-muted-foreground"
                          )}>
                            {score.rank_movement > 0 ? "▲" : score.rank_movement < 0 ? "▼" : "—"} {Math.abs(score.rank_movement)}
                          </p>
                        </div>
                        <span className="font-mono text-xs text-gain">
                          {formatINR(score.payout_amount)}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <EmptyState title={HO_DASHBOARD.NO_BRANCHES} />
        )}
      </Card>

      {/* Selected Branch Detail */}
      {selectedBranch && (
        <Card>
          <div className="mb-4">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {HO_DASHBOARD.BRANCH_DETAIL}
            </h2>
          </div>
          {(() => {
            const score = scoreMap.get(selectedBranch);
            const branch = branches?.find((b) => b.branch_id === selectedBranch);
            if (!score || !branch) return <EmptyState title="No data" />;
            return (
              <>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-muted-foreground">Branch</span>
                  <p className="font-mono font-medium">{branch.business_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Score</span>
                  <p className="font-mono font-bold text-lg">{formatScore(score.composite_index_score)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rank</span>
                  <p className="font-mono font-bold text-lg">#{score.final_rank}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Payout</span>
                  <p className="font-mono text-gain">{formatINR(score.payout_amount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Revenue</span>
                  <p className="font-mono">{formatINR(score.raw_revenue)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Volume</span>
                  <p className="font-mono">{(score.raw_transaction_volume ?? 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4">
                <TradingViewChart
                  locationId={Number((score as any).merchant_location_id ?? selectedBranch)}
                  height={280}
                  defaultResolution="5"
                />
              </div>
              </>
            );
          })()}
        </Card>
      )}
    </div>
  );
}
