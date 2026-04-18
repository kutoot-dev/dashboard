"use client";

import { useState, useMemo, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useBranchScore,
  useBranchCandlesticks,
  useBranchVolume,
} from "@/lib/hooks/use-branch-data";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { useLiveScore } from "@/lib/hooks/use-live-data";
import {
  useSimulatedScore,
  useSimulatedCandlesticks,
  useSimulatedVolume,
} from "@/lib/hooks/use-simulated-data";
import { useUIStore } from "@/lib/stores/ui.store";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ScoreDisplay } from "@/components/ui/score-display";
import { ChangeIndicator } from "@/components/ui/change-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ChartTypeSwitcher } from "@/components/ui/chart-type-switcher";
import { RewardPoolCard } from "@/components/ui/reward-pool-card";
import { ActivityTicker } from "@/components/ui/activity-ticker";
import { QuickActions } from "@/components/ui/quick-actions";
import { MultiChart } from "@/components/charts/multi-chart";
import { VolumeChart } from "@/components/charts/volume-chart";
import { TradingViewChart } from "@/components/charts/trading-view-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import { SUB_SCORE_LABELS, SUB_SCORE_WEIGHTS, SUB_SCORE_ORDER, IMPROVEMENT_TIPS } from "@/lib/constants/scoring";
import { BRANCH_DASHBOARD, COMMON } from "@/lib/constants/strings";

type ChartType = "candle" | "line" | "area" | "baseline";

function getScoreColor(value: number): string {
  if (value > 75) return "text-gain";
  if (value > 50) return "text-accent";
  if (value > 25) return "text-warning";
  return "text-loss";
}

function getBarColor(value: number): string {
  if (value > 75) return "#22c55e";
  if (value > 50) return "#f59e0b";
  if (value > 25) return "#f97316";
  return "#ef4444";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const [chartType, setChartType] = useState<ChartType>("candle");

  const { dateRange, setDateRange } = useUIStore();

  const { data: apiScore, isLoading: scoreLoading } = useBranchScore(branchId);
  const { data: apiCandlesticks, isLoading: candlesticksLoading } =
    useBranchCandlesticks(branchId);
  const { data: apiVolume, isLoading: volumeLoading } =
    useBranchVolume(branchId);
  const { data: periods } = useScoringPeriods();

  // Simulated fallback data
  const simScore = useSimulatedScore();
  const simCandles = useSimulatedCandlesticks();
  const simVolume = useSimulatedVolume();

  // Use API data if available, otherwise simulated
  const score = apiScore ?? (!scoreLoading ? simScore : null);
  const candlesticks = apiCandlesticks ?? (!candlesticksLoading ? simCandles : null);
  const volume = apiVolume ?? (!volumeLoading ? simVolume : null);

  // Live score simulation
  const liveScore = useLiveScore(score?.composite_index_score ?? 0);

  // Filter chart data to the selected date range
  const slicedCandles = useMemo(() => {
    if (!candlesticks) return [];
    if (!dateRange.start && !dateRange.end) return candlesticks;
    return candlesticks.filter((c) => {
      if (dateRange.start && c.time < dateRange.start) return false;
      if (dateRange.end && c.time > dateRange.end) return false;
      return true;
    });
  }, [candlesticks, dateRange]);

  const slicedVolume = useMemo(() => {
    if (!volume) return [];
    if (!dateRange.start && !dateRange.end) return volume;
    return volume.filter((v) => {
      if (dateRange.start && v.time < dateRange.start) return false;
      if (dateRange.end && v.time > dateRange.end) return false;
      return true;
    });
  }, [volume, dateRange]);

  const volumeBars = useMemo(
    () =>
      slicedVolume.map((item, index, arr) => {
        const prev = index > 0 ? arr[index - 1]?.value ?? item.value : item.value;
        return {
          time: item.time,
          value: item.value,
          color: item.value >= prev ? "#22c55e" : "#ef4444",
        };
      }),
    [slicedVolume],
  );

  // Convert candlestick closes to line data for non-candle chart types
  const lineData = useMemo(
    () => slicedCandles.map((c) => ({ time: c.time, value: c.close })),
    [slicedCandles],
  );

  // v2 sub-scores for parameter meters and improvement card
  const subScores = score?.score_breakdown
    ? SUB_SCORE_ORDER.map((key) => ({
        key,
        value: (score.score_breakdown as Record<string, number>)[key] ?? 0,
      }))
    : [];

  // Find weakest scores for improvement suggestions
  const weakestScores = useMemo(
    () =>
      [...subScores]
        .sort((a, b) => a.value - b.value)
        .slice(0, 5)
        .map((s) => ({
          key: s.key,
          value: s.value,
          label: SUB_SCORE_LABELS[s.key] ?? s.key,
        })),
    [subScores],
  );

  // Dynamic reward pool from API
  const latestPeriod = periods?.[periods.length - 1];
  const dailyPool = latestPeriod?.pool_amount ?? 0;
  const estimatedShare = score ? score.payout_amount : undefined;

  const improvementScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-4 pb-safe-bottom md:pb-0">
      {/* Header */}
      <PageHeader title={BRANCH_DASHBOARD.TITLE} subtitle={BRANCH_DASHBOARD.SUBTITLE}>
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
          className="w-60"
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
        <TradingViewChart locationId={Number(branchId) || 1} height={260} defaultResolution="D" />
      </Card>

      {/* Top Row: Score + Rank + Reward Pool */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Live Score */}
        <Card className="glass-card-sm">
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

        {/* Rank — clean display */}
        <Card className="glass-card-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {BRANCH_DASHBOARD.YOUR_RANK}
            </p>
          </div>
          {scoreLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : score ? (
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-4xl font-bold text-foreground">
                #{score.final_rank}
              </span>
              <ChangeIndicator value={score.rank_movement} suffix="" />
            </div>
          ) : (
            <span className="font-mono text-2xl text-muted-foreground">—</span>
          )}
        </Card>

        {/* Period Reward */}
        <Card className="glass-card-sm">
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
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                  <span className="font-mono text-[10px] text-warning">
                    Fatigue applied ({typeof score.fatigue_dampener_value === "number" ? (score.fatigue_dampener_value * 100).toFixed(0) : "--"}%)
                  </span>
                  <InfoTooltip text="You've been in the top 10 for 3+ weeks. A small reduction is applied to give other branches a fair chance. Keep performing - you still earn top rewards!" />
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
            <ChartTypeSwitcher value={chartType} onChange={setChartType} />
          </div>
        </div>
        {candlesticksLoading ? (
          <Skeleton variant="rect" className="h-100" />
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
          <Skeleton variant="rect" className="h-30" />
        ) : volumeBars.length > 0 ? (
          <VolumeChart data={volumeBars} height={120} />
        ) : (
          <EmptyState title="No volume data" />
        )}
      </Card>

      {/* Activity Feed + Quick Actions */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="glass-card-sm">
          <ActivityTicker />
        </Card>
        <Card className="glass-card-sm">
          <QuickActions />
        </Card>
      </div>

      {/* Score Parameters — Card Grid */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Your Score Parameters
          </h2>
          <InfoTooltip text="Your score is made up of 8 parameters. Each has a different weight." />
        </div>
        {scoreLoading && subScores.length === 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        ) : subScores.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {subScores.map((s) => {
              const weightPct = Math.round((SUB_SCORE_WEIGHTS[s.key] ?? 0.125) * 100);
              const contribution = (s.value * (SUB_SCORE_WEIGHTS[s.key] ?? 0.125)).toFixed(1);
              return (
                <div key={s.key} className="glass-card-sm p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-foreground leading-tight">
                      {SUB_SCORE_LABELS[s.key] ?? s.key}
                    </span>
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[9px] text-accent">
                      {weightPct}%
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("font-mono text-2xl font-bold", getScoreColor(s.value))}>
                      {s.value.toFixed(0)}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.min(s.value, 100)}%`, backgroundColor: getBarColor(s.value) }}
                    />
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground">+{contribution} to total</p>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No score breakdown" />
        )}
      </div>

      {/* Where to Improve — Horizontal Slideshow */}
      {weakestScores.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Where to Improve
            </h2>
            <InfoTooltip text="Focus on these areas to boost your ranking and earn more rewards." />
          </div>
          <div
            ref={improvementScrollRef}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-1 px-1"
          >
            {weakestScores.map(({ key, value, label }) => {
              const tips = IMPROVEMENT_TIPS[key] ?? [];
              const target = value < 25 ? 25 : value < 50 ? 50 : value < 75 ? 75 : 100;
              const gap = target - value;
              const weight = SUB_SCORE_WEIGHTS[key] ?? 0;
              const scoreImpact = gap * weight;

              return (
                <div key={key} className="glass-card-sm shrink-0 w-70 snap-start p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-sm font-semibold", getScoreColor(value))}>
                      {label}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{value.toFixed(0)}/100</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(value / target) * 100}%`, backgroundColor: getBarColor(value) }}
                      />
                    </div>
                    <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>{gap.toFixed(0)} pts to next level</span>
                      <span className="text-gain">+{scoreImpact.toFixed(1)} impact</span>
                    </div>
                  </div>
                  {tips.length > 0 && (
                    <ul className="space-y-1">
                      {tips.slice(0, 2).map((tip, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                          <span className="mt-0.5 shrink-0">*</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
