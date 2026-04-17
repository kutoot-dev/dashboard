"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useHOBranches, useHOBranchScores } from "@/lib/hooks/use-ho";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RankBadge } from "@/components/ui/rank-badge";
import { ScoreDisplay } from "@/components/ui/score-display";
import { EmptyState } from "@/components/ui/empty-state";
import { formatINR } from "@/lib/utils/format";

export default function HOBranchesPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";

  const { data: branches, isLoading: branchesLoading } = useHOBranches(hoId);
  const { data: branchScores, isLoading: scoresLoading } = useHOBranchScores(hoId);

  const isLoading = branchesLoading || scoresLoading;
  const scoreMap = new Map(
    (branchScores ?? []).map((s) => [s.branch_id, s])
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
          All Branches
        </h1>
        <p className="font-mono text-xs text-muted-foreground">
          View and compare all your branch locations
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : !branches || branches.length === 0 ? (
        <Card>
          <EmptyState title="No branches found" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => {
            const score = scoreMap.get(branch.branch_id);
            return (
              <Card key={branch.branch_id} hover className="flex flex-col gap-3">
                {/* Branch header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">
                      {branch.business_name}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {branch.status}
                    </p>
                  </div>
                  {score && (
                    <RankBadge rank={score.final_rank} totalBranches={branches.length} />
                  )}
                </div>

                {/* Score */}
                <div className="flex items-center gap-4">
                  {score ? (
                    <>
                      <ScoreDisplay score={score.composite_index_score ?? 0} size="md" />
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>Rank <span className="text-foreground font-mono">#{score.final_rank}</span></p>
                        <p>Payout <span className="text-gain font-mono">{formatINR(score.payout_amount ?? 0)}</span></p>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No score data</span>
                  )}
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-glass-border">
                  <div>
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">Capture</p>
                    <p className="font-mono text-xs text-foreground">
                      {branch.platform_capture_percentage != null
                        ? `${branch.platform_capture_percentage}%`
                        : "--"}
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[9px] uppercase text-muted-foreground">Type</p>
                    <p className="font-mono text-xs text-foreground capitalize">
                      {branch.business_type ?? "--"}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
