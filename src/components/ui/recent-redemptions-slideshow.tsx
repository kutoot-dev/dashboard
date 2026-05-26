"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTransactions,
  type RecentRedemption,
} from "@/lib/api/services/merchant.service";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";

interface RecentRedemptionsSlideshowProps {
  className?: string;
  limit?: number;
}

function timeShort(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "short",
  });
}

/**
 * Live list of the 5 most recent redemptions at this merchant. Driven by
 * react-query (polls every 30s as a fallback) and kept in-sync in real time
 * by `useTransactionStream`, which prepends new transactions onto the cached
 * `["recent-redemptions"]` entry.
 *
 * Name retained for backwards compatibility with the dashboard import.
 */
export function RecentRedemptionsSlideshow({
  className,
  limit = 5,
}: RecentRedemptionsSlideshowProps) {
  const { user } = useAuth();
  const branchId = useEffectiveBranchId();

  const { data, isLoading } = useQuery({
    queryKey: ["recent-redemptions"],
    queryFn: async () => {
      const res = await getTransactions(branchId, { page: 1, limit });
      if (!res.success) return { success: false as const, data: { rows: [] as RecentRedemption[] } };

      const rows: RecentRedemption[] = res.data.rows.map((txn) => ({
        id: txn.id,
        customer_name: txn.customer_name,
        customer_initial: (txn.customer_name?.trim()?.[0] ?? "?").toUpperCase(),
        customer_phone: txn.customer_phone,
        coupon_code: txn.coupon_code,
        coupon_title: txn.coupon_title,
        discount_applied: txn.discount,
        bill_amount: txn.bill_amount,
        total_paid: txn.total_paid,
        created_at: txn.created_at,
      }));

      return { success: true as const, data: { rows } };
    },
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const rows: RecentRedemption[] = data?.success ? data.data.rows : [];

  if (isLoading) {
    return (
      <div className={cn("glass-card flex h-full flex-col p-3", className)}>
        <Skeleton variant="rect" className="h-full min-h-40" />
      </div>
    );
  }

  return (
    <div className={cn("glass-card flex h-full flex-col space-y-2 p-3", className)}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Latest {limit} transactions
        </p>
        <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider text-gain">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
          </span>
          live
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No transactions yet. New payments will appear here automatically.
        </p>
      ) : (
        <ul className="flex-1 divide-y divide-glass-border overflow-y-auto">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
              <div
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-sm font-bold text-accent"
              >
                {r.customer_initial || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs font-semibold">
                    {r.customer_name || "Anonymous customer"}
                  </p>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {timeShort(r.created_at)}
                  </span>
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                  {r.coupon_code && (
                    <Badge variant="neutral" className="text-[9px]">
                      {r.coupon_code}
                    </Badge>
                  )}
                  <span className="font-mono text-muted-foreground">
                    bill <span className="font-semibold text-foreground">{formatINR(r.bill_amount)}</span>
                  </span>
                  {r.discount_applied > 0 && (
                    <span className="font-mono text-primary">
                      saved {formatINR(r.discount_applied)}
                    </span>
                  )}
                  <span className="font-mono text-gain">
                    paid {formatINR(r.total_paid)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
