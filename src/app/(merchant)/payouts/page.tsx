"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranchPayouts } from "@/lib/api/services/branches.service";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FilterChip } from "@/components/ui/filter-chip";
import {
  BonusPayoutTrendChart,
  type BonusPayoutChartView,
} from "@/components/payouts/bonus-payout-trend-chart";
import { BonusPayoutStatCard } from "@/components/payouts/bonus-payout-stat-card";
import { BonusPayoutHistory } from "@/components/payouts/bonus-payout-history";
import { formatINRDecimal } from "@/lib/utils/format";
import { buildBonusPayoutSeries, summarizePayoutSeries } from "@/lib/utils/payouts-chart";
import { StatCardsSkeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { PAYOUTS } from "@/lib/constants/strings";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import { faCalendarDay, faChartLine, faMoneyBillTransfer } from "@/lib/icons";

const PAYOUTS_REFRESH_MS = 5 * 60 * 1000;

function formatAsOf(iso: string | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatRank(rank: number | null | undefined) {
  return typeof rank === "number" ? `#${rank}` : "—";
}

function formatChangePct(value: number | null) {
  if (value === null || Number.isNaN(value)) return null;
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export default function PayoutsPage() {
  const { user } = useAuth();
  const branchId = useEffectiveBranchId();
  const [chartView, setChartView] = useState<BonusPayoutChartView>("both");

  const payoutsQuery = useQuery({
    queryKey: ["branch-payouts", branchId],
    queryFn: () => getBranchPayouts(branchId),
    enabled: Boolean(branchId),
    retry: false,
    refetchInterval: PAYOUTS_REFRESH_MS,
    refetchOnWindowFocus: true,
  });

  const payload = payoutsQuery.data?.success ? payoutsQuery.data.data : null;
  const history = payload?.history ?? [];
  const latest = payload?.latest ?? null;
  const todayExpected = payload?.today_expected ?? null;
  const showSkeleton = useQuerySkeleton(payoutsQuery);

  const chartData = useMemo(
    () => buildBonusPayoutSeries(history, todayExpected),
    [history, todayExpected],
  );

  const chartSummary = useMemo(() => summarizePayoutSeries(chartData), [chartData]);
  const changeLabel = formatChangePct(chartSummary.changePct);

  return (
    <div className="space-y-6 pb-8">
      <PageHeader title={PAYOUTS.TITLE_BRANCH} subtitle={PAYOUTS.SUBTITLE_BRANCH}>
        <Link
          href="/payouts/guide"
          className="text-xs font-medium text-accent hover:underline"
        >
          {PAYOUTS.GUIDE_TITLE}
        </Link>
      </PageHeader>

      {/* Hero — today's expected payout */}
      {showSkeleton ? (
        <div className="h-44 animate-pulse rounded-2xl bg-muted/30" />
      ) : (
        <section
          className={cn(
            "relative overflow-hidden rounded-2xl border border-gold/25 p-6 shadow-[0_20px_48px_rgba(8,13,34,0.22)]",
            "bg-gradient-to-br from-gold/20 via-primary/10 to-card/80",
          )}
        >
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-12 left-1/3 h-32 w-32 rounded-full bg-accent/15 blur-3xl"
            aria-hidden
          />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl space-y-3">
              <Badge variant="gold" className="w-fit">
                {PAYOUTS.HERO_BADGE}
              </Badge>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {PAYOUTS.TODAY_EXPECTED}
              </h2>
              <p className="text-sm text-muted-foreground">{PAYOUTS.TODAY_EXPECTED_HELPER}</p>
            </div>

            <div className="lg:text-right">
              {todayExpected ? (
                <>
                  <p className="font-mono text-4xl font-bold tracking-tight text-gold sm:text-5xl">
                    {formatINRDecimal(todayExpected.your_share)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground lg:justify-end">
                    {typeof todayExpected.accumulated_net === "number" ? (
                      <>
                        <span>
                          {PAYOUTS.TODAY_ACCUMULATED_NET}{" "}
                          <span className="font-mono text-foreground">
                            {formatINRDecimal(todayExpected.accumulated_net)}
                          </span>
                        </span>
                        <span className="hidden text-border sm:inline">·</span>
                      </>
                    ) : null}
                    <span>
                      {PAYOUTS.TODAY_POOL}{" "}
                      <span className="font-mono text-foreground">{formatINRDecimal(todayExpected.daily_pool)}</span>
                      {todayExpected.payout_wallet_name ? (
                        <span className="text-muted-foreground"> ({todayExpected.payout_wallet_name})</span>
                      ) : null}
                    </span>
                    <span className="hidden text-border sm:inline">·</span>
                    <span>
                      {PAYOUTS.LATEST_RANK}{" "}
                      <span className="font-mono text-accent">{formatRank(todayExpected.rank)}</span>
                    </span>
                    <span className="hidden text-border sm:inline">·</span>
                    <span>
                      {PAYOUTS.TODAY_AS_OF} {formatAsOf(todayExpected.as_of)}
                    </span>
                    {todayExpected.is_estimate ? (
                      <Badge variant="neutral" title={PAYOUTS.TODAY_EXPECTED_HELPER}>
                        {PAYOUTS.TODAY_ESTIMATE}
                      </Badge>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{PAYOUTS.EMPTY}</p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Summary stats */}
      {showSkeleton ? (
        <StatCardsSkeleton count={3} className="md:grid-cols-3" />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <BonusPayoutStatCard
            variant="gold"
            icon={<Icon icon={faMoneyBillTransfer} className="h-5 w-5 text-gold" aria-hidden />}
            label={PAYOUTS.TOTAL_BONUS_RECEIVED}
            value={formatINRDecimal(payload?.total_bonus_received ?? 0)}
            helper="Lifetime bonus credited from daily pools"
          />
          <BonusPayoutStatCard
            variant="accent"
            icon={<Icon icon={faCalendarDay} className="h-5 w-5 text-accent" aria-hidden />}
            label={PAYOUTS.LATEST_DAY_SHARE}
            value={latest ? formatINRDecimal(latest.your_share) : "—"}
            helper={
              latest
                ? `${latest.date} · ${PAYOUTS.LATEST_RANK} ${formatRank(latest.rank)} · ${PAYOUTS.LATEST_POOL} ${formatINRDecimal(latest.daily_pool)}`
                : PAYOUTS.EMPTY
            }
          />
          <BonusPayoutStatCard
            variant="default"
            icon={<Icon icon={faChartLine} className="h-5 w-5 text-foreground" aria-hidden />}
            label={PAYOUTS.AVG_DAILY_SHARE}
            value={chartData.length ? formatINRDecimal(chartSummary.avgShare) : "—"}
            helper={
              chartData.length
                ? `${chartData.length} ${PAYOUTS.TREND_DAYS}${
                    changeLabel ? ` · ${PAYOUTS.DAY_CHANGE} ${changeLabel}` : ""
                  }`
                : "Trend builds as payout days accumulate"
            }
            footer={
              changeLabel ? (
                <p
                  className={cn(
                    "text-xs font-medium",
                    (chartSummary.changePct ?? 0) >= 0 ? "text-gain" : "text-loss",
                  )}
                >
                  {PAYOUTS.DAY_CHANGE} {changeLabel}
                </p>
              ) : null
            }
          />
        </div>
      )}

      {/* Trend chart */}
      <Card className="space-y-4 p-5 sm:p-6" hover>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-lg font-semibold text-foreground">{PAYOUTS.TREND_TITLE}</p>
            <p className="mt-1 text-sm text-muted-foreground">{PAYOUTS.TREND_SUBTITLE}</p>
            {chartData.length > 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-0.5 w-4 rounded-full bg-gold" aria-hidden />
                  {PAYOUTS.TREND_VIEW_SHARE}
                </span>
                {chartView === "both" ? (
                  <>
                    {" "}
                    ·{" "}
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-0.5 w-4 border-t-2 border-dashed border-accent"
                        aria-hidden
                      />
                      {PAYOUTS.TREND_VIEW_POOL}
                    </span>
                  </>
                ) : null}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Chart view">
            <FilterChip
              label={PAYOUTS.TREND_VIEW_BOTH}
              selected={chartView === "both"}
              onSelect={() => setChartView("both")}
              tone="gold"
            />
            <FilterChip
              label={PAYOUTS.TREND_VIEW_SHARE}
              selected={chartView === "share"}
              onSelect={() => setChartView("share")}
              tone="gold"
            />
            <FilterChip
              label={PAYOUTS.TREND_VIEW_POOL}
              selected={chartView === "pool"}
              onSelect={() => setChartView("pool")}
              tone="accent"
            />
          </div>
        </div>

        {showSkeleton ? (
          <div className="h-[280px] animate-pulse rounded-xl bg-muted/30" />
        ) : (
          <BonusPayoutTrendChart data={chartData} view={chartView} height={280} />
        )}
      </Card>

      {/* History */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <p className="font-display text-lg font-semibold text-foreground">{PAYOUTS.HISTORY}</p>
          <p className="mt-1 text-sm text-muted-foreground">{PAYOUTS.HISTORY_SUBTITLE}</p>
        </div>

        {showSkeleton ? (
          <TableRowsSkeleton rows={6} columns={5} minWidth="min-w-[640px]" />
        ) : (
          <BonusPayoutHistory rows={history} />
        )}
      </Card>
    </div>
  );
}
