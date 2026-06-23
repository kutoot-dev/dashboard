import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/utils/format";

interface ReferralStatsProps {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  conversionRate: number;
}

export function ReferralStats({
  totalReferrals,
  successfulReferrals,
  pendingReferrals,
  conversionRate,
}: ReferralStatsProps) {
  return (
    <Card className="border border-border/70 bg-card/75 p-5">
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Referral stats
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/65 bg-background/35 p-3">
          <p className="text-xs text-muted-foreground">Total referrals</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{totalReferrals}</p>
        </div>
        <div className="rounded-xl border border-border/65 bg-background/35 p-3">
          <p className="text-xs text-muted-foreground">Successful</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{successfulReferrals}</p>
        </div>
        <div className="rounded-xl border border-border/65 bg-background/35 p-3">
          <p className="text-xs text-muted-foreground">Conversion rate</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{formatPercent(conversionRate, 2)}</p>
        </div>
        <div className="rounded-xl border border-border/65 bg-background/35 p-3">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{pendingReferrals}</p>
        </div>
      </div>
    </Card>
  );
}
