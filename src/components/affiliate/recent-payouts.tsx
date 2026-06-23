import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatINR } from "@/lib/utils/format";
import type { AffiliatePayoutItem } from "@/lib/api/services/affiliate.service";

interface RecentPayoutsProps {
  payouts: AffiliatePayoutItem[];
}

function payoutStatusVariant(status: string): "gain" | "warning" | "neutral" {
  if (status === "paid" || status === "success" || status === "completed") return "gain";
  if (status === "pending" || status === "requested" || status === "processing") return "warning";
  return "neutral";
}

function payoutStatusLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function RecentPayouts({ payouts }: RecentPayoutsProps) {
  return (
    <Card className="border border-border/70 bg-card/75 p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Recent payouts
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">Last 5 payouts</h2>
        </div>
        <Link
          href="/payouts"
          className="text-xs font-medium text-accent underline-offset-2 hover:underline"
        >
          View all
        </Link>
      </div>

      {payouts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payouts available yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/65 bg-background/35">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 bg-muted/55 text-left">
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Date</th>
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((item) => {
                const rowDate = item.paid_at ?? item.requested_at;
                return (
                  <tr key={String(item.id)} className="border-b border-border/60 last:border-b-0">
                    <td className="px-3 py-2 text-foreground">
                      {rowDate ? formatDate(rowDate) : "--"}
                    </td>
                    <td className="px-3 py-2 font-mono text-foreground">{formatINR(item.amount)}</td>
                    <td className="px-3 py-2">
                      <Badge variant={payoutStatusVariant(item.status)}>
                        {payoutStatusLabel(item.status)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
