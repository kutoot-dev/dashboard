"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";
import type { WithdrawalHistoryItem } from "@/lib/types/wallet";

interface WalletWithdrawalHistoryProps {
  items: WithdrawalHistoryItem[];
}

export function WalletWithdrawalHistory({ items }: WalletWithdrawalHistoryProps) {
  if (items.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-sm font-semibold text-foreground">Withdrawal history</h2>
        <p className="mt-2 text-sm text-muted-foreground">No withdrawals yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-sm font-semibold text-foreground">Withdrawal history</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3 last:border-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {formatINR(item.amount)}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.requested_at
                  ? new Date(item.requested_at).toLocaleString()
                  : "—"}
              </p>
            </div>
            <Badge
              variant={item.status === "paid" ? "gain" : "warning"}
              title={item.status}
            >
              {item.status === "paid" ? "Paid" : "Requested"}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
