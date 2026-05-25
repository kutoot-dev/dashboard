"use client";

import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { BranchPayoutHistoryItem } from "@/lib/api/services/branches.service";
import { formatINR } from "@/lib/utils/format";
import { PAYOUTS } from "@/lib/constants/strings";
import { cn } from "@/lib/utils/cn";
import { faTrophy } from "@/lib/icons";

function statusBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("paid")) return "gain" as const;
  if (normalized.includes("pending")) return "warning" as const;
  if (normalized.includes("failed")) return "loss" as const;
  return "neutral" as const;
}

function formatRank(rank: number | null | undefined) {
  return typeof rank === "number" ? `#${rank}` : "—";
}

function rankTone(rank: number | null | undefined) {
  if (typeof rank !== "number") return "text-muted-foreground";
  if (rank <= 3) return "text-gold font-semibold";
  if (rank <= 10) return "text-accent font-medium";
  return "text-foreground";
}

interface BonusPayoutHistoryProps {
  rows: BranchPayoutHistoryItem[];
}

export function BonusPayoutHistory({ rows }: BonusPayoutHistoryProps) {
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-14 text-center text-sm text-muted-foreground">
        <Icon icon={faTrophy} className="h-8 w-8 text-gold/50" aria-hidden />
        <p>{PAYOUTS.EMPTY}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.payout_id}
            className="rounded-xl border border-border/70 bg-background/30 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{row.date || row.period_id}</p>
                <p className={cn("mt-0.5 font-mono text-xs", rankTone(row.rank))}>
                  {PAYOUTS.COL_RANK} {formatRank(row.rank)}
                </p>
              </div>
              <Badge variant={statusBadgeVariant(row.status || "")}>
                {(row.status || "unknown").toUpperCase()}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">{PAYOUTS.COL_DAILY_POOL}</dt>
                <dd className="mt-0.5 font-mono text-foreground">{formatINR(row.daily_pool)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{PAYOUTS.COL_YOUR_SHARE}</dt>
                <dd className="mt-0.5 font-mono text-lg font-semibold text-gold">{formatINR(row.your_share)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border/80 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_DATE}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_RANK}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_DAILY_POOL}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_YOUR_SHARE}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_STATUS}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.payout_id}
                className={cn(
                  "border-b border-border/40 transition-colors hover:bg-gold/5",
                  index % 2 === 0 ? "bg-transparent" : "bg-muted/15",
                )}
              >
                <td className="px-3 py-3.5 font-medium text-foreground">{row.date || row.period_id}</td>
                <td className={cn("px-3 py-3.5 font-mono", rankTone(row.rank))}>{formatRank(row.rank)}</td>
                <td className="px-3 py-3.5 font-mono text-foreground">{formatINR(row.daily_pool)}</td>
                <td className="px-3 py-3.5 font-mono text-base font-semibold text-gold">
                  {formatINR(row.your_share)}
                </td>
                <td className="px-3 py-3.5">
                  <Badge variant={statusBadgeVariant(row.status || "")}>
                    {(row.status || "unknown").toUpperCase()}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
