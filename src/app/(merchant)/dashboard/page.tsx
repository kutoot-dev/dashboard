"use client";

import { useMemo, useRef } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useBranchScore,
  useBranchVolume,
} from "@/lib/hooks/use-branch-data";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { useLiveScore } from "@/lib/hooks/use-live-data";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ScoreDisplay } from "@/components/ui/score-display";
import { ChangeIndicator } from "@/components/ui/change-indicator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { RewardPoolCard } from "@/components/ui/reward-pool-card";
import { QuickActions } from "@/components/ui/quick-actions";
import { ScorePie } from "@/components/ui/score-pie";
import { ScoringParametersExplainer } from "@/components/ui/scoring-parameters-explainer";
import { CommissionSliderCard } from "@/components/ui/commission-slider-card";
import { RecentRedemptionsSlideshow } from "@/components/ui/recent-redemptions-slideshow";
import { SortableSection } from "@/components/ui/sortable-section";
import { useTransactionStream } from "@/lib/hooks/use-transaction-stream";
import {
  useDashboardLayout,
  type DashboardSectionId,
} from "@/lib/hooks/use-dashboard-layout";
import { VolumeChart } from "@/components/charts/volume-chart";
import { TradingViewChart } from "@/components/charts/trading-view-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import { SUB_SCORE_LABELS, SUB_SCORE_WEIGHTS, SUB_SCORE_ORDER, IMPROVEMENT_TIPS } from "@/lib/constants/scoring";
import { BRANCH_DASHBOARD, COMMON } from "@/lib/constants/strings";

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

  const { data: score, isLoading: scoreLoading } = useBranchScore(branchId);
  const { data: volume, isLoading: volumeLoading } = useBranchVolume(branchId);
  const { data: periods } = useScoringPeriods();

  useTransactionStream(branchId);

  const liveScore = useLiveScore(score?.composite_index_score ?? 0);

  const volumeBars = useMemo(
    () =>
      (volume ?? []).map((item: { time: string; value: number }, index: number, arr: { time: string; value: number }[]) => {
        const prev = index > 0 ? arr[index - 1]?.value ?? item.value : item.value;
        return {
          time: item.time,
          value: item.value,
          color: item.value >= prev ? "#22c55e" : "#ef4444",
        };
      }),
    [volume],
  );

  const subScores = score?.score_breakdown
    ? SUB_SCORE_ORDER.map((key) => ({
        key,
        value: (score.score_breakdown as Record<string, number>)[key] ?? 0,
      }))
    : [];

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(subScores)],
  );

  const latestPeriod = periods?.[periods.length - 1];
  const dailyPool = latestPeriod?.pool_amount ?? 0;
  const estimatedShare = score ? score.payout_amount : undefined;

  const improvementScrollRef = useRef<HTMLDivElement>(null);

  const { order, setOrder } = useDashboardLayout();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(active.id as DashboardSectionId);
    const newIdx = order.indexOf(over.id as DashboardSectionId);
    if (oldIdx === -1 || newIdx === -1) return;
    setOrder(arrayMove(order, oldIdx, newIdx));
  }

  const sections: Record<DashboardSectionId, React.ReactNode> = {
    "stats-strip": (
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <Card className="glass-card-sm p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {BRANCH_DASHBOARD.YOUR_SCORE}
          </p>
          {scoreLoading ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : score ? (
            <ScoreDisplay score={liveScore.current} change={liveScore.change} size="md" />
          ) : (
            <span className="font-mono text-xl text-muted-foreground">—</span>
          )}
        </Card>
        <Card className="glass-card-sm p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            {BRANCH_DASHBOARD.YOUR_RANK}
          </p>
          {scoreLoading ? (
            <Skeleton className="mt-1 h-7 w-16" />
          ) : score ? (
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-xl font-bold text-foreground">#{score.final_rank}</span>
              <ChangeIndicator value={score.rank_movement} suffix="" />
            </div>
          ) : (
            <span className="font-mono text-xl text-muted-foreground">—</span>
          )}
        </Card>
        <Card className="glass-card-sm p-2.5">
          <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            Last Reward
          </p>
          {scoreLoading ? (
            <Skeleton className="mt-1 h-7 w-20" />
          ) : score ? (
            <div className="mt-0.5">
              <span className="font-mono text-xl font-bold text-gain">
                {formatINR(score.payout_amount)}
              </span>
              {score.fatigue_dampener_applied && (
                <p className="mt-0.5 font-mono text-[9px] text-warning">
                  Fatigue {typeof score.fatigue_dampener_value === "number" ? (score.fatigue_dampener_value * 100).toFixed(0) : "--"}%
                </p>
              )}
            </div>
          ) : (
            <span className="font-mono text-xl text-muted-foreground">—</span>
          )}
        </Card>
        <RewardPoolCard totalPool={dailyPool} merchantShare={estimatedShare} />
      </div>
    ),
    "boost-commission": <CommissionSliderCard />,
    "kbi-chart": (
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {COMMON.INDEX_NAME}
            </h2>
            <InfoTooltip text="Live candlestick chart showing branch score movement. Data from backend every minute." />
          </div>
          <div className="flex items-center gap-4">
            {score && (
              <div className="flex items-center gap-2 rounded-md bg-accent/5 px-3 py-1 border border-accent/10">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{BRANCH_DASHBOARD.YOUR_INDEX}</span>
                <span className="font-mono text-sm font-bold text-accent">
                  {(1000 + liveScore.current * 2.47).toFixed(0)}
                </span>
                <span className={cn(
                  "font-mono text-[10px] font-semibold",
                  liveScore.change >= 0 ? "text-gain" : "text-loss",
                )}>
                  {liveScore.change >= 0 ? "▲" : "▼"} {Math.abs(liveScore.change * 2.47).toFixed(1)}
                </span>
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
        <TradingViewChart
          locationId={Number(branchId) || 1}
          height={280}
          defaultResolution="5"
          defaultMetric="rank"
        />
      </Card>
    ),
    "score-history": (
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Score History
            </h2>
            <InfoTooltip text="Candlestick chart of your daily score. Green = up, Red = down." />
          </div>
          <TradingViewChart locationId={Number(branchId) || 1} height={220} defaultResolution="D" />
        </Card>
        <Card className="overflow-hidden p-3 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Score Parameters
            </h2>
            <InfoTooltip text="Each slice is weighted by the parameter's contribution to your composite score. Hover a slice to inspect the sub-score." />
          </div>
          {scoreLoading && subScores.length === 0 ? (
            <Skeleton variant="rect" className="h-56" />
          ) : (
            <ScorePie
              size={220}
              composite={score?.composite_index_score ?? undefined}
              rank={score?.final_rank ?? null}
              data={subScores.map((s) => ({
                key: s.key,
                label: SUB_SCORE_LABELS[s.key] ?? s.key,
                value: s.value,
                weight: SUB_SCORE_WEIGHTS[s.key] ?? 0.125,
              }))}
            />
          )}
          <ScoringParametersExplainer
            collapsible
            values={Object.fromEntries(subScores.map((s) => [s.key, s.value]))}
          />
        </Card>
      </div>
    ),
    "redemptions": <RecentRedemptionsSlideshow />,
    "volume": (
      <Card className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Transaction Volume
          </h2>
        </div>
        {volumeLoading ? (
          <Skeleton variant="rect" className="h-24" />
        ) : volumeBars.length > 0 ? (
          <VolumeChart data={volumeBars} height={90} />
        ) : (
          <EmptyState title="No volume data" />
        )}
      </Card>
    ),
    "improve":
      weakestScores.length > 0 ? (
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Where to Improve
            </h2>
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
                <div key={key} className="glass-card-sm shrink-0 w-56 snap-start p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-semibold", getScoreColor(value))}>
                      {label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">{value.toFixed(0)}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${(value / target) * 100}%`, backgroundColor: getBarColor(value) }}
                    />
                  </div>
                  <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
                    <span>{gap.toFixed(0)} pts to next</span>
                    <span className="text-gain">+{scoreImpact.toFixed(1)}</span>
                  </div>
                  {tips.length > 0 && (
                    <p className="text-[10px] text-muted-foreground line-clamp-2">{tips[0]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : null,
  };

  return (
    <div className="space-y-3 pb-safe-bottom md:pb-0">
      <PageHeader title={BRANCH_DASHBOARD.TITLE} subtitle={BRANCH_DASHBOARD.SUBTITLE}>
        <QuickActions />
      </PageHeader>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {order.map((id) => (
              <SortableSection key={id} id={id}>
                {sections[id]}
              </SortableSection>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
