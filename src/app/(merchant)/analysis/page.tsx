"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import {
  useMerchantScore,
  useMerchantCandlesticks,
} from "@/lib/hooks/use-merchant-data";
import { useScoringPeriods, usePeriodScores } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/select";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ChartTypeSwitcher } from "@/components/ui/chart-type-switcher";
import { MultiChart } from "@/components/charts/multi-chart";
import { BaselineChart } from "@/components/charts/baseline-chart";
import { AreaChart } from "@/components/charts/area-chart";
import { cn } from "@/lib/utils/cn";
import { formatScore, formatDate } from "@/lib/utils/format";
import { SUB_SCORE_LABELS, SUB_SCORE_DESCRIPTIONS } from "@/lib/constants/scoring";
import type { ScoreBreakdown } from "@/lib/types";

type ChartType = "candle" | "line" | "area" | "baseline";

const TABS = [
  { id: "trend", label: "My Score History" },
  { id: "components", label: "Score Breakdown" },
  { id: "peer", label: "Compare With Others" },
];

const SUB_SCORE_KEYS: (keyof ScoreBreakdown)[] = [
  "trading_performance",
  "margin_efficiency",
  "location_opportunity",
  "transaction_quality",
  "momentum",
  "ecosystem_contribution",
];

export default function AnalysisPage() {
  const { user } = useAuth();
  const merchantId = user?.merchant_id ?? "m-001";
  const [activeTab, setActiveTab] = useState("trend");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [chartType, setChartType] = useState<ChartType>("area");

  const { data: periods, isLoading: periodsLoading } = useScoringPeriods();
  const { data: candlesticks, isLoading: candlesticksLoading } =
    useMerchantCandlesticks(merchantId);
  const { data: score } = useMerchantScore(merchantId);
  const { data: periodScores } = usePeriodScores(selectedPeriod || (periods?.[0]?.period_id ?? ""));

  const periodOptions = (periods ?? []).map((p) => ({
    value: p.period_id,
    label: `${p.period_type === "daily" ? "D" : p.period_type === "weekly" ? "W" : "BW"} ${p.period_id.slice(-3)}`,
  }));

  // Build score trend data from candlestick closes
  const trendData = useMemo(
    () =>
      (candlesticks ?? []).map((c) => ({
        time: c.time,
        value: c.close,
      })),
    [candlesticks],
  );

  // Sector average baseline (use 50 as fallback)
  const sectorAverage = score?.sector_percentile_rank
    ? score.sector_percentile_rank * 100
    : 50;

  // Build sub-score time series (simulated from candlestick length with breakdown)
  const subScoreCharts = useMemo(() => {
    if (!candlesticks || !score?.score_breakdown) return [];
    return SUB_SCORE_KEYS.map((key) => {
      const baseValue = score.score_breakdown[key];
      const data = candlesticks.map((c, i) => ({
        time: c.time,
        value: Math.max(0, baseValue + (c.close - (candlesticks[0]?.close ?? 50)) * 0.2 + (Math.sin(i * 0.7) * 1.5)),
      }));
      return { key, label: SUB_SCORE_LABELS[key] ?? key, data };
    });
  }, [candlesticks, score]);

  // Peer comparison: merchant score vs sector average
  const peerData = useMemo(
    () =>
      (candlesticks ?? []).map((c) => ({
        time: c.time,
        value: c.close,
      })),
    [candlesticks],
  );

  // Score history table from candlesticks
  const scoreHistory = useMemo(
    () =>
      (candlesticks ?? [])
        .map((c, i) => ({
          period: c.time,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
          change: i > 0 ? c.close - (candlesticks?.[i - 1]?.close ?? 0) : 0,
        }))
        .reverse(),
    [candlesticks],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="My Performance" subtitle="Understand your score in detail">
        <Select
          options={periodOptions}
          value={selectedPeriod}
          onChange={setSelectedPeriod}
          placeholder="Select period"
          disabled={periodsLoading}
        />
      </PageHeader>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {/* Score Trend Tab */}
        {activeTab === "trend" && (
          <div className="space-y-4">
            <Card className="overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Score Trend
                  </h3>
                  <InfoTooltip text="Shows how your score has changed over time. The dashed line is the average score for your business category." />
                </div>
                <ChartTypeSwitcher value={chartType} onChange={setChartType} />
              </div>
              {candlesticksLoading ? (
                <Skeleton variant="rect" className="h-[300px]" />
              ) : trendData.length > 0 ? (
                chartType === "baseline" ? (
                  <BaselineChart
                    data={trendData}
                    baseline={sectorAverage}
                    height={300}
                  />
                ) : (
                  <MultiChart
                    type={chartType}
                    candleData={candlesticks ?? []}
                    lineData={trendData}
                    baseline={sectorAverage}
                    height={300}
                  />
                )
              ) : (
                <EmptyState title="No trend data" />
              )}
            </Card>

            {/* Score History Table */}
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                        Period
                      </th>
                      <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                        Open
                      </th>
                      <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                        High
                      </th>
                      <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                        Low
                      </th>
                      <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                        Close
                      </th>
                      <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreHistory.map((row) => (
                      <tr
                        key={row.period}
                        className="border-b border-border hover:bg-card-hover transition-colors"
                      >
                        <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                          {row.period}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                          {formatScore(row.open)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                          {formatScore(row.high)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                          {formatScore(row.low)}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-xs font-semibold text-foreground">
                          {formatScore(row.close)}
                        </td>
                        <td
                          className={cn(
                            "px-3 py-2 text-right font-mono text-xs font-semibold",
                            row.change > 0
                              ? "text-gain"
                              : row.change < 0
                                ? "text-loss"
                                : "text-muted-foreground",
                          )}
                        >
                          {row.change > 0 ? "+" : ""}
                          {formatScore(row.change)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Component Analysis Tab */}
        {activeTab === "components" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {candlesticksLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton variant="rect" className="h-[180px]" />
                </Card>
              ))
            ) : subScoreCharts.length > 0 ? (
              subScoreCharts.map((chart) => (
                <Card key={chart.key} className="overflow-hidden p-0">
                  <div className="px-3 pt-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-mono text-xs font-semibold text-muted-foreground">
                        {chart.label}
                      </h3>
                      <InfoTooltip text={SUB_SCORE_DESCRIPTIONS[chart.key] ?? "Score component details"} />
                    </div>
                  </div>
                  <AreaChart data={chart.data} height={180} />
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState
                  title="No component data"
                  description="Score breakdown will appear after periods are calculated."
                />
              </div>
            )}
          </div>
        )}

        {/* Peer Comparison Tab */}
        {activeTab === "peer" && (
          <div className="space-y-4">
            <Card>
              <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Your Score vs Category Average
              </h3>
              <p className="mb-3 text-xs text-muted-foreground">
                Baseline (dashed) = sector average ({formatScore(sectorAverage)})
              </p>
            </Card>
            <Card className="overflow-hidden p-0">
              {candlesticksLoading ? (
                <Skeleton variant="rect" className="h-[300px]" />
              ) : peerData.length > 0 ? (
                <BaselineChart
                  data={peerData}
                  baseline={sectorAverage}
                  height={300}
                />
              ) : (
                <EmptyState title="No peer data" />
              )}
            </Card>

            {/* Rank Percentile */}
            {score && (
              <Card>
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Current Position
              </h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">Rank <InfoTooltip text="Your current position among all merchants." /></p>
                    <p className="font-mono text-2xl font-bold text-foreground">
                      #{score.final_rank}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">Category Rank <InfoTooltip text="Your rank within your business category (e.g. all kiranas)." /></p>
                    <p className="font-mono text-2xl font-bold text-foreground">
                      Top {(score.sector_percentile_rank * 100).toFixed(0)}%
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">Performance Level <InfoTooltip text="How far above or below the average you are. Positive means above average." /></p>
                    <p className={cn(
                      "font-mono text-2xl font-bold",
                      score.sector_zscore > 0 ? "text-gain" : score.sector_zscore < 0 ? "text-loss" : "text-foreground",
                    )}>
                      {score.sector_zscore > 0 ? "+" : ""}{score.sector_zscore.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">Growth Speed <InfoTooltip text="Your momentum score — how fast you’re improving." /></p>
                    <p className="font-mono text-2xl font-bold text-accent">
                      {formatScore(score.momentum_score)}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
