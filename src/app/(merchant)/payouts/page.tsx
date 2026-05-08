"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranchPayouts } from "@/lib/api/services/branches.service";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatINR, formatScore } from "@/lib/utils/format";

function statusBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("paid")) return "gain" as const;
  if (normalized.includes("pending")) return "warning" as const;
  if (normalized.includes("failed")) return "loss" as const;
  return "neutral" as const;
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

  const rows = payoutsQuery.data?.success ? payoutsQuery.data.data : [];

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.pool += row.pool_amount || 0;
        acc.allocated += row.allocated_amount || 0;
        if ((row.status || "").toLowerCase().includes("paid")) {
          acc.paid += row.allocated_amount || 0;
          acc.paidCount += 1;
        }
        return acc;
      },
      { pool: 0, allocated: 0, paid: 0, paidCount: 0 },
    );
  }, [rows]);

  return (
    <div className="space-y-6">
      <PageHeader title="Rewards" subtitle="Payout allocation history tied to branch score performance." />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Periods</p>
          <p className="mt-2 font-mono text-xl text-foreground">{rows.length}</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pool tracked</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINR(summary.pool)}</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Allocated</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINR(summary.allocated)}</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Paid out</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINR(summary.paid)}</p>
          <p className="text-xs text-muted-foreground">{summary.paidCount} settled periods</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Payout timeline</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Period</th>
                <th className="px-2 py-2">Score</th>
                <th className="px-2 py-2">Rank</th>
                <th className="px-2 py-2">Pool</th>
                <th className="px-2 py-2">Allocated</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Paid at</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.payout_id} className="border-b border-border/60 align-top">
                  <td className="px-2 py-3 text-foreground">{row.period_label || row.period_id}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{formatScore(row.score)}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{typeof row.rank === "number" ? `#${row.rank}` : "--"}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{formatINR(row.pool_amount)}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{formatINR(row.allocated_amount)}</td>
                  <td className="px-2 py-3">
                    <Badge variant={statusBadgeVariant(row.status || "")}>{(row.status || "unknown").toUpperCase()}</Badge>
                  </td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">
                    {row.paid_at ? new Date(row.paid_at).toLocaleString("en-IN") : "--"}
                  </td>
                </tr>
              ))}

              {!payoutsQuery.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No payout records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
