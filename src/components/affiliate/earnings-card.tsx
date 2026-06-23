import { Card } from "@/components/ui/card";
import { formatINR } from "@/lib/utils/format";

interface EarningsCardProps {
  totalEarned: number;
  pendingBalance: number;
  minWithdrawalAmount: number;
}

export function EarningsCard({
  totalEarned,
  pendingBalance,
  minWithdrawalAmount,
}: EarningsCardProps) {
  const safeThreshold = minWithdrawalAmount > 0 ? minWithdrawalAmount : 1;
  const progress = Math.max(0, Math.min(100, (pendingBalance / safeThreshold) * 100));

  return (
    <Card className="space-y-4 border border-border/70 bg-card/75 p-5">
      <div>
        <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Earnings
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatINR(totalEarned)}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Total earned from referrals</p>
      </div>

      <div className="rounded-xl border border-border/65 bg-background/35 p-4">
        <p className="text-xs text-muted-foreground">Pending balance</p>
        <p className="mt-1 text-lg font-semibold text-foreground">{formatINR(pendingBalance)}</p>

        <div className="mt-3">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Withdrawal threshold</span>
            <span>{formatINR(minWithdrawalAmount)}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/70">
            <div
              className="h-full rounded-full bg-linear-to-r from-primary via-secondary to-accent transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {progress.toFixed(0)}% of minimum payout reached
          </p>
        </div>
      </div>
    </Card>
  );
}
