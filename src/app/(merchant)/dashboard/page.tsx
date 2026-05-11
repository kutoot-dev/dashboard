"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { ScorePie } from "@/components/ui/score-pie";
import { ScoreTrendCard } from "@/components/ui/score-trend-card";
import { CommissionSliderCard } from "@/components/ui/commission-slider-card";
import { RecentRedemptionsSlideshow } from "@/components/ui/recent-redemptions-slideshow";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getMerchantDashboard } from "@/lib/api/services/merchant.service";
import { getBranchScore } from "@/lib/api/services/branches.service";
import {
  SUB_SCORE_DESCRIPTIONS,
  SUB_SCORE_LABELS,
  SUB_SCORE_ORDER,
  SUB_SCORE_WEIGHTS,
} from "@/lib/constants/scoring";
import { formatINR, formatScore } from "@/lib/utils/format";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: getMerchantDashboard,
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const { data: scoreData } = useQuery({
    queryKey: ["merchant-branch-score", branchId],
    queryFn: () => getBranchScore(branchId),
    enabled: Boolean(branchId),
    retry: false,
    refetchInterval: 30_000,
  });

  const dashboard = data?.success ? data.data : null;
  const branchScore = scoreData?.success ? scoreData.data : null;
  const scoreBreakdown = dashboard?.live?.score_breakdown ?? branchScore?.score_breakdown ?? {};
  const pieData = SUB_SCORE_ORDER.map((key) => ({
    key,
    label: SUB_SCORE_LABELS[key] ?? key,
    value: Number(scoreBreakdown[key] ?? 0),
    weight: Number(SUB_SCORE_WEIGHTS[key] ?? 0),
  }));
  const sortedParameters = useMemo(() => [...pieData].sort((a, b) => b.value - a.value), [pieData]);
  const parameterCards = useMemo(
    () =>
      sortedParameters.map((segment, index) => {
        const contribution = segment.value * segment.weight;
        const weightPercent = Math.round(segment.weight * 100);
        return {
          ...segment,
          contribution,
          weightPercent,
          isTopPerformer: index === 0,
          isLeastPerformer: index === sortedParameters.length - 1,
          description: SUB_SCORE_DESCRIPTIONS[segment.key] ?? "No description available.",
        };
      }),
    [sortedParameters],
  );
  const [activeSegmentKey, setActiveSegmentKey] = useState<string | null>(null);
  const [activeRecommendation, setActiveRecommendation] = useState<{
    key: string;
    label: string;
    recommendation: string;
    example: string;
    dealPresets?: Array<{
      label: string;
      discountPercent: number;
      duration: string;
      audience: string;
    }>;
  } | null>(null);
  const fixRecommendations = useMemo<Record<string, string>>(
    () => ({
      referral_score:
        "Referrals are not directly editable from this screen. Improve this by inviting nearby quality merchants and tracking their activation quality.",
      fairness_score:
        "Fairness is computed from customer concentration patterns. Improve it by reducing dependence on a few customers and widening repeat buyer mix.",
    }),
    [],
  );
  const compositeScore = dashboard?.live.composite_score ?? branchScore?.composite_index_score ?? 0;
  const compositeRank = dashboard?.live.rank ?? branchScore?.final_rank ?? null;
  const totalAmount = Number(dashboard?.today?.gmv ?? 0);
  const discounts = Number(dashboard?.today?.discount ?? 0);
  const netAmount = totalAmount - discounts;
  const walkins = Number(dashboard?.today?.transactions ?? 0);
  const statsCards = [
    { label: "Total Amount", value: formatINR(totalAmount), helper: "Gross sales today" },
    { label: "Discounts", value: formatINR(discounts), helper: "Offers redeemed today" },
    { label: "Net Amount", value: formatINR(Math.max(0, netAmount)), helper: "After discounts" },
    { label: "Walk-ins", value: walkins.toLocaleString("en-IN"), helper: "Customer visits / bills" },
  ];

  function handleFixClick(key: string, label: string) {
    setActiveRecommendation(null);

    if (key === "commission_score") {
      const growthBoostCard = document.getElementById("growth-boost-card");
      growthBoostCard?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const shouldSuggestDeal =
      key === "discount_aggression_score" ||
      key === "user_growth_score" ||
      key === "repeat_rate_score" ||
      key === "gmv_score" ||
      key === "platform_capture_score";

    if (shouldSuggestDeal) {
      router.push(`/deals?recommended=1&source=scoring&metric=${encodeURIComponent(key)}`);
      return;
    }

    if (key === "transaction_quality") {
      const txnButton = document.getElementById("quick-action-add-txn");
      txnButton?.click();
      return;
    }

    const recommendation =
      fixRecommendations[key] ??
      "This parameter is system-derived and cannot be edited directly. Follow the tips in this row to improve it over time.";

    setActiveRecommendation({
      key,
      label,
      recommendation,
      example:
        "Example: If one customer gives 40% of your sales, try spreading sales across more customers so your score becomes stable and safer.",
    });
  }

  const activeSegment =
    parameterCards.find((segment) => segment.key === activeSegmentKey) ?? parameterCards[0] ?? null;

  return (
    <div className="space-y-6">
      {!dashboard && isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="h-28 animate-pulse bg-card/50">
              <div className="h-full w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
            <div className="space-y-4">
             
              <div id="growth-boost-card">
                <CommissionSliderCard className="border border-secondary/30 bg-card/70" />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {statsCards.map((card) => (
                <Card key={card.label} className="border border-accent/28 bg-card/70 p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
                  <p className="mt-2 font-tabular text-xl font-semibold text-foreground">{card.value}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
                </Card>
              ))}
            </div>
          </div>

          

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            <ScoreTrendCard
              scoreBreakdown={scoreBreakdown}
              compositeScore={compositeScore}
              todayTransactions={dashboard?.today?.transactions ?? 0}
            />
            <RecentRedemptionsSlideshow className="border border-gain/25 bg-card/70" />
          </div>

          <Card className="space-y-4 border border-primary/28 bg-card/72">
            <div>
              <h3 className="font-display text-sm font-semibold text-primary">Score Insights</h3>
              <p className="text-xs text-muted-foreground">
                Hover any donut slice or parameter row to inspect it. Use Fix on lower scores for quick guidance.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-[2fr_3fr] xl:items-stretch">
              <div className="flex h-full flex-col space-y-3 rounded-lg border border-accent/28 bg-card/70 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      <span>Score Breakdown</span>
                      {activeSegment && (
                        <InfoTooltip
                          text={`${activeSegment.description} Easy: This score shows how good you are in ${activeSegment.label.toLowerCase()}. Example: if this score goes up by 10 points, your total score can go up by about ${(10 * activeSegment.weight).toFixed(1)} points.`}
                        />
                      )}
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      Composite {formatScore(compositeScore)} {typeof compositeRank === "number" ? `· Rank #${compositeRank}` : ""}
                    </p>
                  </div>
                </div>
                <ScorePie
                  data={pieData}
                  composite={compositeScore}
                  rank={compositeRank}
                  size={290}
                  compact
                  activeKey={activeSegmentKey}
                  onActiveKeyChange={setActiveSegmentKey}
                />
                {activeSegment && (
                  <div className="rounded-md border border-accent/35 bg-accent/10 px-3 py-2">
                    <p className="text-xs font-semibold text-accent">{activeSegment.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Score <span className="font-semibold text-foreground">{activeSegment.value.toFixed(0)} / 100</span> · Weight{" "}
                      <span className="font-semibold text-foreground">{activeSegment.weightPercent}%</span> · Adds{" "}
                      <span className="font-semibold text-foreground">{activeSegment.contribution.toFixed(1)}</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="flex h-full flex-col space-y-3 rounded-lg border border-primary/28 bg-card/70 p-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Scoring Parameters</h4>
                  <p className="text-xs text-muted-foreground">
                    Best-performing on top, low-performing at the bottom.
                  </p>
                </div>
                <div className="grid max-h-82.5 flex-1 gap-2 overflow-auto pr-1 sm:grid-cols-2">
                {parameterCards.map((segment) => {
                  const isActive = activeSegmentKey === segment.key;

                  return (
                  <div
                    key={`donut-${segment.key}`}
                    onMouseEnter={() => setActiveSegmentKey(segment.key)}
                    onMouseLeave={() => setActiveSegmentKey(null)}
                    className={`space-y-1.5 rounded-md border px-2.5 py-2 transition-all ${
                      isActive
                        ? "border-accent/55 bg-accent/14 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]"
                        : segment.isTopPerformer
                          ? "border-gain/45 bg-gain/14"
                          : segment.isLeastPerformer
                            ? "border-loss/45 bg-loss/14"
                            : "border-border/70 bg-card/65"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 text-foreground">
                        <span className="truncate">{segment.label}</span>
                        <InfoTooltip
                          text={`${segment.description} Weight: ${segment.weightPercent}%. Current contribution: ${segment.contribution.toFixed(1)}.`}
                        />
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-tabular text-foreground">{segment.value.toFixed(1)}</span>
                        <button
                          type="button"
                          onClick={() => handleFixClick(segment.key, segment.label)}
                          className="inline-flex items-center gap-1 rounded-md border border-warning/35 bg-warning/12 px-2 py-0.5 text-[10px] font-medium text-warning transition-colors hover:bg-warning/20"
                          title="Get improvement guidance"
                        >
                          <svg aria-hidden viewBox="0 0 20 20" className="h-3 w-3">
                            <path
                              fill="currentColor"
                              d="M11.627 2.05a1 1 0 0 1 1.746 0l1.2 2.214 2.514.48a1 1 0 0 1 .555 1.67l-1.75 1.84.326 2.526a1 1 0 0 1-1.45 1.034L12.5 10.73l-2.268 1.083a1 1 0 0 1-1.45-1.034l.326-2.526-1.75-1.84a1 1 0 0 1 .555-1.67l2.514-.48 1.2-2.214Z"
                            />
                            <path
                              fill="currentColor"
                              d="M3.293 15.293a1 1 0 0 1 1.414 0L6 16.586l1.293-1.293a1 1 0 1 1 1.414 1.414L7.414 18l1.293 1.293a1 1 0 0 1-1.414 1.414L6 19.414l-1.293 1.293a1 1 0 0 1-1.414-1.414L4.586 18l-1.293-1.293a1 1 0 0 1 0-1.414Z"
                            />
                          </svg>
                          Fix
                        </button>
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Weight {segment.weightPercent}% · Contribution {segment.contribution.toFixed(1)}
                    </p>
                    {(segment.isTopPerformer || segment.isLeastPerformer) && (
                      <p className="text-[10px] font-medium text-muted-foreground">
                        {segment.isTopPerformer ? "Top performer" : "Least performer"}
                      </p>
                    )}
                    <div className="h-2 overflow-hidden rounded-full bg-muted/70">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-primary via-secondary to-accent"
                        style={{ width: `${Math.min(segment.value, 100)}%` }}
                      />
                    </div>
                  </div>
                )})}
                </div>
              </div>
            </div>
          </Card>
          {activeRecommendation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/72 p-4 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-xl border border-accent/35 bg-card-solid p-4 shadow-[0_24px_60px_rgba(4,8,26,0.56)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-accent">
                      Fix plan: {activeRecommendation.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{activeRecommendation.recommendation}</p>
                    <p className="mt-2 rounded-md border border-border/80 bg-muted/55 px-2.5 py-2 text-xs text-muted-foreground">
                      {activeRecommendation.example}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRecommendation(null)}
                    className="rounded-md border border-border/80 px-2 py-1 text-xs text-foreground transition-colors hover:bg-card-hover"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
