"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useBranchScore,
  useBranchCandlesticks,
  useBranchVolume,
} from "@/lib/hooks/use-branch-data";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { useLiveScore } from "@/lib/hooks/use-live-data";
import { useUIStore } from "@/lib/stores/ui.store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ScoreDisplay } from "@/components/ui/score-display";
import { RankBadge } from "@/components/ui/rank-badge";
import { ChangeIndicator } from "@/components/ui/change-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ChartTypeSwitcher } from "@/components/ui/chart-type-switcher";
import { RewardPoolCard } from "@/components/ui/reward-pool-card";
import { ParameterMeter } from "@/components/ui/parameter-meter";
import { ImprovementCard } from "@/components/ui/improvement-card";
import { MultiChart } from "@/components/charts/multi-chart";
import { VolumeChart } from "@/components/charts/volume-chart";
import { KMIChart } from "@/components/charts/kmi-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore, formatPeriodRange } from "@/lib/utils/format";
import { SUB_SCORE_LABELS, SUB_SCORE_DESCRIPTIONS, SUB_SCORE_WEIGHTS } from "@/lib/constants/scoring";
import { BRANCH_DASHBOARD, COMMON } from "@/lib/constants/strings";

type ChartType = "candle" | "line" | "area" | "baseline";

const TIME_RANGES = [
  { label: "4W", value: 4 },
  { label: "8W", value: 8 },
  { label: "12W", value: 12 },
  { label: "All", value: -1 },
];

const TOTAL_BRANCHES = 50;

export default function DashboardPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "m-001";
  const [chartType, setChartType] = useState<ChartType>("candle");

  const { selectedPeriodId, setSelectedPeriodId, chartTimeRange, setChartTimeRange } =
    useUIStore();

  const { data: periods, isLoading: periodsLoading } = useScoringPeriods();
  const { data: score, isLoading: scoreLoading } = useBranchScore(
    branchId,
    selectedPeriodId ?? undefined,
  );
  const { data: candlesticks, isLoading: candlesticksLoading } =
    useBranchCandlesticks(branchId);
  const { data: volume, isLoading: volumeLoading } =
    useBranchVolume(branchId);

  // Live score simulation
  const liveScore = useLiveScore(score?.composite_index_score ?? 0);

  const periodOptions = (periods ?? []).map((p) => ({
    value: p.period_id,
    label: formatPeriodRange(p.period_start, p.period_end),
  }));

  // Slice chart data by time range
  const slicedCandles =
    chartTimeRange > 0 && candlesticks
      ? candlesticks.slice(-chartTimeRange)
      : candlesticks ?? [];
  const slicedVolume =
    chartTimeRange > 0 && volume
      ? volume.slice(-chartTimeRange)
      : volume ?? [];

  // Convert candlestick closes to line data for non-candle chart types
  const lineData = useMemo(
    () => slicedCandles.map((c) => ({ time: c.time, value: c.close })),
    [slicedCandles],
  );

  // Sub-scores array for parameter meters and improvement card
  const subScores = score?.score_breakdown
    ? [
        { key: "trading_performance", value: score.score_breakdown.trading_performance },
        { key: "margin_efficiency", value: score.score_breakdown.margin_efficiency },
        { key: "location_opportunity", value: score.score_breakdown.location_opportunity },
        { key: "transaction_quality", value: score.score_breakdown.transaction_quality },
        { key: "momentum", value: score.score_breakdown.momentum },
        { key: "ecosystem_contribution", value: score.score_breakdown.ecosystem_contribution },
      ]
    : [];

  // Find weakest scores for improvement suggestions
  const weakestScores = useMemo(
    () =>
      [...subScores]
        .sort((a, b) => a.value - b.value)
        .slice(0, 3)
        .map((s) => ({
          key: s.key,
          value: s.value,
          label: SUB_SCORE_LABELS[s.key] ?? s.key,
        })),
    [subScores],
  );

  // Simulate daily reward pool (in production this comes from API)
  const dailyPool = 50000;
  const estimatedShare = score
    ? Math.round(dailyPool * (1 / Math.max(score.final_rank, 1)) * 0.3)
    : undefined;

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader title={BRANCH_DASHBOARD.TITLE} subtitle={BRANCH_DASHBOARD.SUBTITLE}>
        <Select
          options={periodOptions}
          value={selectedPeriodId ?? ""}
          onChange={(v) => setSelectedPeriodId(v || null)}
          placeholder="Latest period"
          disabled={periodsLoading}
        />
      </PageHeader>

      {/* KBI (Kutoot Branch Index) — platform-wide chart */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {COMMON.INDEX_NAME}
            </h2>
            <InfoTooltip text="The KBI shows the combined performance of all branches on Kutoot. When most branches do well, the index goes up. It updates live every few seconds." />
          </div>
          <div className="flex items-center gap-4">
            {/* Your personal index */}
            {score && (
              <div className="flex items-center gap-2 rounded-md bg-accent/5 px-3 py-1 border border-accent/10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{BRANCH_DASHBOARD.YOUR_INDEX}</span>
                <span className="font-mono text-sm font-bold text-accent">
                  {(1000 + liveScore.current * 2.47).toFixed(0)}
                </span>
                <span className={cn(
                  "font-mono text-[10px] font-semibold",
                  liveScore.change >= 0 ? "text-gain" : "text-loss"
                )}>
                  {liveScore.change >= 0 ? "▲" : "▼"} {Math.abs(liveScore.change * 2.47).toFixed(1)}
                </span>
                <InfoTooltip text="Your personal index derived from your composite score. Higher score = higher index. Compare it with the platform-wide KMI to see where you stand." />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gain" />
              </span>
              <span className="font-mono text-[10px] uppercase text-gain">Live</span>
            </div>
          </div>
        </div>
        <KMIChart height={180} />
      </Card>

      {/* Top Row: Score + Rank + Reward Pool */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Live Score */}
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {BRANCH_DASHBOARD.YOUR_SCORE}
            </p>
            <InfoTooltip text="Your overall performance score out of 100. Based on 6 different parameters like daily sales, profit health, and location advantage." />
          </div>
          {scoreLoading ? (
            <Skeleton className="h-10 w-28" />
          ) : score ? (
            <ScoreDisplay
              score={liveScore.current}
              change={liveScore.change}
              size="lg"
            />
          ) : (
            <span className="font-mono text-2xl text-muted-foreground">—</span>
          )}
        </Card>

        {/* Rank */}
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {BRANCH_DASHBOARD.YOUR_RANK}
            </p>
            <InfoTooltip text="Your position among all branches. Higher score = lower rank number. Top ranks earn bigger daily rewards." />
          </div>
          {scoreLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : score ? (
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-5xl font-bold text-foreground">
                #{score.final_rank}
              </span>
              <div className="flex flex-col gap-1">
                <RankBadge rank={score.final_rank} totalBranches={TOTAL_BRANCHES} />
                <ChangeIndicator value={score.rank_movement} suffix="" />
              </div>
            </div>
          ) : (
            <span className="font-mono text-2xl text-muted-foreground">—</span>
          )}
        </Card>

        {/* Period Reward */}
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Last Reward
            </p>
            <InfoTooltip text="Your reward from the last completed period. Rewards are distributed daily at 11:00 PM based on your rank and score." />
          </div>
          {scoreLoading ? (
            <Skeleton className="h-10 w-24" />
          ) : score ? (
            <div>
              <span className="font-mono text-3xl font-bold text-gain">
                {formatINR(score.payout_amount)}
              </span>
              {score.fatigue_dampener_applied && (
                <div className="mt-1 flex items-center gap-1">
                  <p className="font-mono text-[10px] text-warning">
                    Fatigue applied ({(score.fatigue_dampener_value * 100).toFixed(0)}%)
                  </p>
                  <InfoTooltip text="You've been in the top 10 for 3+ weeks. A small reduction is applied to give other branches a fair chance. Keep performing — you still earn top rewards!" />
                </div>
              )}
            </div>
          ) : (
            <span className="font-mono text-2xl text-muted-foreground">—</span>
          )}
        </Card>

        {/* Daily Reward Pool */}
        <RewardPoolCard totalPool={dailyPool} merchantShare={estimatedShare} />
      </div>

      {/* Performance Chart with Type Switcher */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Score History
            </h2>
            <InfoTooltip text="Shows how your score changed over time. Green means your score went up, red means it went down. Switch chart types using the buttons on the right." />
          </div>
          <div className="flex items-center gap-3">
            {/* Time Range */}
            <div className="flex gap-1">
              {TIME_RANGES.map((tr) => (
                <button
                  key={tr.value}
                  onClick={() => setChartTimeRange(tr.value)}
                  className={cn(
                    "rounded px-2 py-1 font-mono text-[10px] font-medium transition-colors",
                    chartTimeRange === tr.value
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tr.label}
                </button>
              ))}
            </div>
            {/* Chart Type */}
            <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          </div>
        </div>
        {candlesticksLoading ? (
          <Skeleton variant="rect" className="h-[400px]" />
        ) : slicedCandles.length > 0 ? (
          <MultiChart
            type={chartType}
            candleData={slicedCandles}
            lineData={lineData}
            baseline={50}
            height={400}
          />
        ) : (
          <EmptyState title="No chart data" description="Score history will appear once periods are calculated." />
        )}
      </Card>

      {/* Volume Chart */}
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Transaction Volume
          </h2>
          <InfoTooltip text="Number of transactions you completed each period. More transactions generally improve your Dukaan Activity score." />
        </div>
        {volumeLoading ? (
          <Skeleton variant="rect" className="h-[120px]" />
        ) : slicedVolume.length > 0 ? (
          <VolumeChart data={slicedVolume} height={120} />
        ) : (
          <EmptyState title="No volume data" />
        )}
      </Card>

      {/* Parameter Meters — All 6 sub-scores with weightage */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Score Parameters
          </h2>
          <InfoTooltip text="Your score is made up of 6 parameters. Each has a different weight (importance). The percentage shows how much each parameter affects your total score." />
        </div>
        {scoreLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : subScores.length > 0 ? (
          <div className="space-y-4">
            {subScores.map((s) => (
              <ParameterMeter
                key={s.key}
                label={SUB_SCORE_LABELS[s.key] ?? s.key}
                value={s.value}
                weight={SUB_SCORE_WEIGHTS[s.key] ?? 0}
                description={SUB_SCORE_DESCRIPTIONS[s.key]}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No score breakdown" />
        )}
      </Card>

      {/* Bottom Row: Improvement Suggestions + Period Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Improvement Suggestions */}
        {!scoreLoading && weakestScores.length > 0 && (
          <ImprovementCard weakestScores={weakestScores} />
        )}

        {/* Period Details */}
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Period Details
            </h2>
            <InfoTooltip text="Detailed numbers for the selected scoring period. These raw numbers are used to calculate your parameters." />
          </div>
          {score ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <span className="flex items-center gap-1 text-muted-foreground">
                Total Sales
                <InfoTooltip text="Total number of transactions during this period. More transactions improve your Shop Activity score (35% weight). Values are log-normalized before scoring to keep the scale fair across small and large merchants." />
              </span>
              <span className="font-mono text-foreground text-right">
                {formatINR(score.raw_transaction_volume)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                Revenue
                <InfoTooltip text="Sum of all transaction amounts (₹) for this period. Combined with transaction count, this forms your trading performance — the highest-weighted parameter at 35%. Both values are log-normalized: Revenue Score = log(revenue + 1)." />
              </span>
              <span className="font-mono text-foreground text-right">
                {formatINR(score.raw_revenue)}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                Category Rank
                <InfoTooltip text="Your rank compared to merchants in the same business category (like all kiranas or all pharmacies)." />
              </span>
              <span className="font-mono text-foreground text-right">
                Top {(score.sector_percentile_rank * 100).toFixed(0)}%
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                Area Boost
                <InfoTooltip text="Location multiplier based on your city tier. Smaller cities get a higher boost." />
              </span>
              <span className="font-mono text-foreground text-right">
                {score.location_opportunity_multiplier.toFixed(2)}x
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                Growth Speed
                <InfoTooltip text="Your momentum score — how much you're improving day over day." />
              </span>
              <span className="font-mono text-foreground text-right">
                {formatScore(score.momentum_score)}/100
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                Community Points
                <InfoTooltip text="Extra score from referring other merchants. Max 5% of your total score." />
              </span>
              <span className="font-mono text-foreground text-right">
                {formatScore(score.ecosystem_contribution_score)}/100
              </span>
            </div>
          ) : (
            <EmptyState title="Select a period to see details" />
          )}
        </Card>
      </div>
    </div>
  );
}
