"use client";

import { useState, useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useHOBranches, useHOBranchScores } from "@/lib/hooks/use-ho";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { AreaChart } from "@/components/charts/area-chart";
import { cn } from "@/lib/utils/cn";
import { formatScore } from "@/lib/utils/format";
import { ANALYSIS } from "@/lib/constants/strings";
import { SUB_SCORE_LABELS, SUB_SCORE_DESCRIPTIONS } from "@/lib/constants/scoring";
import type { ScoreBreakdown } from "@/lib/types";

const TABS = [
  { id: "compare", label: "Branch Comparison" },
  { id: "components", label: "Score Breakdown" },
];

const SUB_SCORE_KEYS: (keyof ScoreBreakdown)[] = [
  "trading_performance",
  "margin_efficiency",
  "location_opportunity",
  "transaction_quality",
  "momentum",
  "ecosystem_contribution",
];

export default function HOAnalysisPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";
  const [activeTab, setActiveTab] = useState("compare");

  const { data: branches, isLoading: branchesLoading } = useHOBranches(hoId);
  const { data: branchScores, isLoading: scoresLoading } = useHOBranchScores(hoId);
  const isLoading = branchesLoading || scoresLoading;

  const scores = branchScores ?? [];

  // Sort branches by score descending
  const ranked = useMemo(
    () => [...scores].sort((a, b) => b.composite_index_score - a.composite_index_score),
    [scores],
  );

  const branchNameMap = useMemo(() => {
    const map = new Map<string, string>();
    (branches ?? []).forEach((b) => map.set(b.branch_id, b.business_name));
    return map;
  }, [branches]);

  // Compute per-sub-score averages across HO branches
  const subScoreAvgs = useMemo(() => {
    if (scores.length === 0) return null;
    const sums: Record<string, number> = {};
    SUB_SCORE_KEYS.forEach((k) => (sums[k] = 0));
    scores.forEach((s) => {
      SUB_SCORE_KEYS.forEach((k) => (sums[k] += s.score_breakdown[k]));
    });
    return SUB_SCORE_KEYS.map((k) => ({
      key: k,
      label: SUB_SCORE_LABELS[k] ?? k,
      avg: sums[k] / scores.length,
      values: scores.map((s) => ({
        branchId: s.branch_id,
        value: s.score_breakdown[k],
      })),
    }));
  }, [scores]);

  return (
    <div className="space-y-4">
      <PageHeader title={ANALYSIS.TITLE} subtitle="Cross-branch analysis for your HO" />

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {/* Branch Comparison */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            {/* Composite score bar chart (horizontal bars) */}
            <Card>
              <div className="mb-4 flex items-center gap-2">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Composite Score Comparison
                </h3>
                <InfoTooltip text="All your branches ranked by composite score. The bar width represents the score out of 100." />
              </div>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : ranked.length > 0 ? (
                <div className="space-y-1.5">
                  {ranked.map((s, idx) => (
                    <div key={s.branch_id} className="flex items-center gap-3">
                      <span className="w-5 text-right font-mono text-[10px] text-muted-foreground">
                        {idx + 1}
                      </span>
                      <span className="w-32 truncate font-mono text-xs text-foreground">
                        {branchNameMap.get(s.branch_id) ?? s.branch_id}
                      </span>
                      <div className="flex-1">
                        <div className="relative h-5 w-full overflow-hidden rounded bg-muted/30">
                          <div
                            className={cn(
                              "absolute left-0 top-0 h-full rounded transition-all",
                              s.composite_index_score >= 70
                                ? "bg-gain/60"
                                : s.composite_index_score >= 50
                                  ? "bg-accent/40"
                                  : "bg-loss/50",
                            )}
                            style={{ width: `${Math.min(s.composite_index_score, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-12 text-right font-mono text-xs font-bold text-foreground">
                        {formatScore(s.composite_index_score)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No branch scores" />
              )}
            </Card>

            {/* Detailed stats table */}
            <Card className="overflow-hidden p-0">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Branch Stats
                </h3>
              </div>
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-8" />
                  ))}
                </div>
              ) : ranked.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">Branch</th>
                        <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">Score</th>
                        <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">Rank</th>
                        {SUB_SCORE_KEYS.map((k) => (
                          <th key={k} className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground hidden lg:table-cell">
                            {(SUB_SCORE_LABELS[k] ?? k).split(" ")[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ranked.map((s) => (
                        <tr key={s.branch_id} className="border-b border-border hover:bg-card-hover transition-colors">
                          <td className="px-3 py-2 font-mono text-xs text-foreground">
                            {branchNameMap.get(s.branch_id) ?? s.branch_id}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs font-bold text-foreground">
                            {formatScore(s.composite_index_score)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs text-foreground">
                            #{s.final_rank}
                          </td>
                          {SUB_SCORE_KEYS.map((k) => (
                            <td key={k} className="px-3 py-2 text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">
                              {formatScore(s.score_breakdown[k])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="No data" />
              )}
            </Card>
          </div>
        )}

        {/* Sub-score breakdown */}
        {activeTab === "components" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <Skeleton className="mb-2 h-4 w-24" />
                  <Skeleton variant="rect" className="h-[180px]" />
                </Card>
              ))
            ) : subScoreAvgs && subScoreAvgs.length > 0 ? (
              subScoreAvgs.map((chart) => (
                <Card key={chart.key} className="overflow-hidden p-0">
                  <div className="px-3 pt-3">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-mono text-xs font-semibold text-muted-foreground">
                        {chart.label}
                      </h3>
                      <InfoTooltip text={SUB_SCORE_DESCRIPTIONS[chart.key] ?? "Score component"} />
                    </div>
                    <p className="mt-0.5 font-mono text-lg font-bold text-foreground">
                      {formatScore(chart.avg)}
                      <span className="ml-1 text-[10px] text-muted-foreground">avg</span>
                    </p>
                  </div>
                  {/* Mini bar chart per branch */}
                  <div className="px-3 pb-3 pt-2 space-y-1">
                    {chart.values
                      .sort((a, b) => b.value - a.value)
                      .map((v) => (
                        <div key={v.branchId} className="flex items-center gap-2">
                          <span className="w-20 truncate font-mono text-[10px] text-muted-foreground">
                            {branchNameMap.get(v.branchId) ?? v.branchId}
                          </span>
                          <div className="flex-1 h-3 rounded bg-muted/30 overflow-hidden">
                            <div
                              className="h-full rounded bg-accent/50"
                              style={{ width: `${Math.min(v.value * 5, 100)}%` }}
                            />
                          </div>
                          <span className="w-8 text-right font-mono text-[10px] text-foreground">
                            {formatScore(v.value)}
                          </span>
                        </div>
                      ))}
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState title="No component data" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
