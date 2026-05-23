"use client";

import { useQuery } from "@tanstack/react-query";
import { getBranchPayouts } from "@/lib/api/services/branches.service";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/format";
import { StatCardsSkeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { PAYOUTS } from "@/lib/constants/strings";

function statusBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("paid")) return "gain" as const;
  if (normalized.includes("pending")) return "warning" as const;
  if (normalized.includes("failed")) return "loss" as const;
  return "neutral" as const;
}

function formatRank(rank: number | null | undefined) {
  return typeof rank === "number" ? `#${rank}` : "--";
}

export default function PayoutsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const payoutsQuery = useQuery({
    queryKey: ["branch-payouts", branchId],
    queryFn: () => getBranchPayouts(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const payload = payoutsQuery.data?.success ? payoutsQuery.data.data : null;
  const history = payload?.history ?? [];
  const latest = payload?.latest ?? null;
  const showSkeleton = useQuerySkeleton(payoutsQuery);

  return (
    <div className="space-y-6">
      <PageHeader title={PAYOUTS.TITLE_BRANCH} subtitle={PAYOUTS.SUBTITLE_BRANCH} />

      {showSkeleton ? (
        <StatCardsSkeleton count={2} className="md:grid-cols-2" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {PAYOUTS.TOTAL_BONUS_RECEIVED}
            </p>
            <p className="mt-2 font-mono text-xl text-foreground">
              {formatINR(payload?.total_bonus_received ?? 0)}
            </p>
          </Card>

          <Card>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {PAYOUTS.LATEST_DAY_SHARE}
            </p>
            {latest ? (
              <>
                <p className="mt-2 font-mono text-xl text-foreground">{formatINR(latest.your_share)}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {latest.date} · {PAYOUTS.LATEST_RANK} {formatRank(latest.rank)} · {PAYOUTS.LATEST_POOL}{" "}
                  {formatINR(latest.daily_pool)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">{PAYOUTS.EMPTY}</p>
            )}
          </Card>
        </div>
      )}

      <Card>
        <div className="mb-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {PAYOUTS.HISTORY}
          </p>
        </div>

        {showSkeleton ? (
          <TableRowsSkeleton rows={6} columns={5} minWidth="min-w-[640px]" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-2 py-2">{PAYOUTS.COL_DATE}</th>
                  <th className="px-2 py-2">{PAYOUTS.COL_RANK}</th>
                  <th className="px-2 py-2">{PAYOUTS.COL_DAILY_POOL}</th>
                  <th className="px-2 py-2">{PAYOUTS.COL_YOUR_SHARE}</th>
                  <th className="px-2 py-2">{PAYOUTS.COL_STATUS}</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.payout_id} className="border-b border-border/60 align-top">
                    <td className="px-2 py-3 text-foreground">{row.date || row.period_id}</td>
                    <td className="px-2 py-3 font-mono text-foreground">{formatRank(row.rank)}</td>
                    <td className="px-2 py-3 font-mono text-foreground">{formatINR(row.daily_pool)}</td>
                    <td className="px-2 py-3 font-mono text-foreground">{formatINR(row.your_share)}</td>
                    <td className="px-2 py-3">
                      <Badge variant={statusBadgeVariant(row.status || "")}>
                        {(row.status || "unknown").toUpperCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}

                {history.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-sm text-muted-foreground">
                      {PAYOUTS.EMPTY}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
