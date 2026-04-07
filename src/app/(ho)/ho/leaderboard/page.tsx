"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useHOBranches } from "@/lib/hooks/use-ho";
import { useLiveLeaderboard } from "@/lib/hooks/use-live-data";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { RankBadge } from "@/components/ui/rank-badge";
import { ChangeIndicator } from "@/components/ui/change-indicator";
import { SparklineChart } from "@/components/charts/sparkline-chart";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatScore, formatINR } from "@/lib/utils/format";
import { LEADERBOARD } from "@/lib/constants/strings";

const TOTAL = 50;

export default function HOLeaderboardPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "ho-001";
  const { data: branches } = useHOBranches(hoId);
  const { data, isLoading } = useLiveLeaderboard();
  const hoBranchIds = new Set((branches ?? []).map((b) => b.branch_id));

  const items = data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader title={LEADERBOARD.TITLE} subtitle={LEADERBOARD.SUBTITLE_HO} />
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState title={LEADERBOARD.EMPTY} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">{LEADERBOARD.COL_RANK}</th>
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">{LEADERBOARD.COL_BRANCH}</th>
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground hidden md:table-cell">{LEADERBOARD.COL_CATEGORY}</th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">{LEADERBOARD.COL_SCORE}</th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">{LEADERBOARD.COL_CHANGE}</th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground hidden lg:table-cell">{LEADERBOARD.COL_TREND}</th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground hidden sm:table-cell">{LEADERBOARD.COL_REWARD}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => {
                  const isMine = hoBranchIds.has(entry.branch_id);
                  return (
                    <tr
                      key={entry.branch_id}
                      className={cn(
                        "border-b border-border transition-colors",
                        isMine ? "bg-accent/5 border-l-2 border-l-accent" : "hover:bg-card-hover",
                      )}
                    >
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">{entry.rank}</span>
                          <RankBadge rank={entry.rank} totalBranches={TOTAL} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-mono text-sm", isMine && "font-bold text-accent")}>
                            {entry.business_name}
                          </span>
                          {isMine && (
                            <span className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent border border-accent/20">
                              YOURS
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground hidden md:table-cell">
                        {entry.sector_name}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-bold">
                        {formatScore(entry.composite_score)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <ChangeIndicator value={entry.score_change} />
                      </td>
                      <td className="px-3 py-2 text-right hidden lg:table-cell">
                        {entry.sparkline_data.length > 0 && (
                          <div className="ml-auto w-20">
                            <SparklineChart data={entry.sparkline_data} width={80} height={24} />
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right font-mono text-xs text-gain hidden sm:table-cell">
                        {formatINR(entry.payout_amount)}
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
