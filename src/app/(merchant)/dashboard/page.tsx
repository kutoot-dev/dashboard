"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuickActions } from "@/components/ui/quick-actions";
import { CommissionSliderCard } from "@/components/ui/commission-slider-card";
import { RecentRedemptionsSlideshow } from "@/components/ui/recent-redemptions-slideshow";
import { getMerchantDashboard } from "@/lib/api/services/merchant.service";
import { useTransactionStream } from "@/lib/hooks/use-transaction-stream";
import { formatINR, formatScore } from "@/lib/utils/format";

function MetricCard({
  label,
  transactions,
  gmv,
  discount,
  commission,
}: {
  label: string;
  transactions: number;
  gmv: number;
  discount: number;
  commission: number;
}) {
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <Badge variant="neutral">{transactions} txn</Badge>
      </div>
      <div className="space-y-1">
        <p className="font-mono text-xl font-semibold text-foreground">{formatINR(gmv)}</p>
        <p className="text-xs text-muted-foreground">
          Discount {formatINR(discount)} | Commission {formatINR(commission)}
        </p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const stream = useTransactionStream(branchId);

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: getMerchantDashboard,
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const dashboard = data?.success ? data.data : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Live branch KPIs, score movement, and recent transaction activity."
      >
        <QuickActions compact />
      </PageHeader>

      {!dashboard && isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-28 animate-pulse bg-card/50">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      )}

      {dashboard && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Today"
              transactions={dashboard.today.transactions}
              gmv={dashboard.today.gmv}
              discount={dashboard.today.discount}
              commission={dashboard.today.commission}
            />
            <MetricCard
              label="Week"
              transactions={dashboard.week.transactions}
              gmv={dashboard.week.gmv}
              discount={dashboard.week.discount}
              commission={dashboard.week.commission}
            />
            <MetricCard
              label="Month"
              transactions={dashboard.month.transactions}
              gmv={dashboard.month.gmv}
              discount={dashboard.month.discount}
              commission={dashboard.month.commission}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Live Scoreboard</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Composite score</span>
                  <span className="font-mono text-lg font-semibold text-foreground">
                    {formatScore(dashboard.live.composite_score)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Current rank</span>
                  <Badge variant="accent">#{dashboard.live.rank}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Active deals</span>
                  <span className="font-mono text-sm text-foreground">{dashboard.live.active_deals}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">GMV today</span>
                  <span className="font-mono text-sm text-foreground">{formatINR(dashboard.live.gmv_today)}</span>
                </div>
                <div className="pt-1 text-[11px] text-muted-foreground">
                  Stream status: {stream.connected ? "connected" : "polling"}
                </div>
              </div>
            </Card>

            <RecentRedemptionsSlideshow className="md:col-span-2" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CommissionSliderCard />
            <Card>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">What changed in this release</p>
              <ul className="mt-3 space-y-2 text-sm text-foreground">
                <li>Deal lifecycle controls: pause, resume, archive.</li>
                <li>Transaction exports: CSV, GST summary CSV, and invoice ZIP.</li>
                <li>Per-transaction PDF invoice download from the transactions screen.</li>
              </ul>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
