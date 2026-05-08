"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { ScorePie } from "@/components/ui/score-pie";
import { ScoreTrendCard } from "@/components/ui/score-trend-card";
import { CommissionSliderCard } from "@/components/ui/commission-slider-card";
import { RecentRedemptionsSlideshow } from "@/components/ui/recent-redemptions-slideshow";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { createDeal, getMerchantDashboard, type CreateDealPayload } from "@/lib/api/services/merchant.service";
import { getBranchScore } from "@/lib/api/services/branches.service";
import {
  SUB_SCORE_DESCRIPTIONS,
  SUB_SCORE_LABELS,
  SUB_SCORE_ORDER,
  SUB_SCORE_WEIGHTS,
} from "@/lib/constants/scoring";
import { ApiError } from "@/lib/api/client";
import { useToastStore } from "@/lib/stores/toast.store";
import { formatINR } from "@/lib/utils/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

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
      payload: CreateDealPayload;
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
  const branchNumber = Number(branchId);
  const createDealMutation = useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(branchId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals", branchId] });
      qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
      qc.invalidateQueries({ queryKey: ["merchant-branch-score", branchId] });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to create deal";
      pushToast({ title: "Create failed", description: message, variant: "error" });
    },
  });

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
      setActiveRecommendation({
        key,
        label,
        recommendation:
          "Create a simple deal now. Start with a small, safe discount and increase only if redemptions are low.",
        example:
          "Example: If your average bill is Rs.500, a 15% deal gives Rs.75 off. Customer pays Rs.425, and you can attract more repeat buyers.",
        dealPresets: [
          {
            label: "Starter Push",
            discountPercent: 10,
            duration: "3 days",
            audience: "All customers",
            payload: {
              discount_type: "percentage",
              discount_value: 10,
              min_order_value: null,
              max_discount_amount: null,
              code: null,
              starts_at: null,
              expires_at: null,
            },
          },
          {
            label: "Growth Boost",
            discountPercent: 15,
            duration: "7 days",
            audience: "New + inactive customers",
            payload: {
              discount_type: "percentage",
              discount_value: 15,
              min_order_value: null,
              max_discount_amount: null,
              code: null,
              starts_at: null,
              expires_at: null,
            },
          },
          {
            label: "Revive Regulars",
            discountPercent: 20,
            duration: "2 days",
            audience: "Customers not seen in 14 days",
            payload: {
              discount_type: "percentage",
              discount_value: 20,
              min_order_value: null,
              max_discount_amount: 200,
              code: null,
              starts_at: null,
              expires_at: null,
            },
          },
        ],
      });
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
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((card) => (
              <Card key={card.label} className="border border-cyan-400/20 bg-slate-900/45">
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">{card.label}</p>
                <p className="mt-2 font-tabular text-xl font-semibold text-white">{card.value}</p>
                <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
              </Card>
            ))}
          </div>

          <Card className="border border-cyan-400/15 bg-slate-900/45">
            <p className="text-xs text-slate-300">
              Dashboard data is shown for <span className="font-semibold text-slate-100">today only</span>:
              from 12:00 AM to current time.
            </p>
          </Card>

          <div id="growth-boost-card">
            <CommissionSliderCard className="border border-amber-400/25 bg-slate-900/55" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
            {Number.isFinite(branchNumber) && branchNumber > 0 ? (
              <ScoreTrendCard branchId={branchNumber} />
            ) : (
              <Card className="border border-cyan-400/20 bg-slate-900/55">
                <h3 className="text-sm font-semibold text-cyan-100">Scoring Trend</h3>
                <p className="mt-2 text-xs text-slate-400">
                  Line graph will appear once a valid branch id is available for this account.
                </p>
              </Card>
            )}
            <RecentRedemptionsSlideshow className="border border-emerald-400/20 bg-slate-900/55" />
          </div>

          <Card className="space-y-4 border border-fuchsia-400/20 bg-slate-900/55">
            <div>
              <h3 className="text-sm font-semibold text-fuchsia-100">Score Insights</h3>
              <p className="text-xs text-slate-400">
                Hover any donut slice or parameter row to inspect it. Use Fix on lower scores for quick guidance.
              </p>
            </div>
            <div className="grid gap-4 xl:grid-cols-[2fr_3fr]">
              <div className="space-y-3 rounded-lg border border-cyan-400/20 bg-slate-900/60 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100">
                      <span>Score Breakdown</span>
                      {activeSegment && (
                        <InfoTooltip
                          text={`${activeSegment.description} Easy: This score shows how good you are in ${activeSegment.label.toLowerCase()}. Example: if this score goes up by 10 points, your total score can go up by about ${(10 * activeSegment.weight).toFixed(1)} points.`}
                        />
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Composite {compositeScore.toFixed(1)} {typeof compositeRank === "number" ? `· Rank #${compositeRank}` : ""}
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
                  <div className="rounded-md border border-cyan-400/25 bg-cyan-500/5 px-3 py-2">
                    <p className="text-xs font-semibold text-cyan-100">{activeSegment.label}</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Score <span className="font-semibold text-white">{activeSegment.value.toFixed(0)} / 100</span> · Weight{" "}
                      <span className="font-semibold text-white">{activeSegment.weightPercent}%</span> · Adds{" "}
                      <span className="font-semibold text-white">{activeSegment.contribution.toFixed(1)}</span>
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-100">Scoring Parameters</h4>
                  <p className="text-xs text-slate-400">
                    Best-performing on top, low-performing at the bottom.
                  </p>
                </div>
                <div className="grid max-h-[330px] gap-2 overflow-auto pr-1 sm:grid-cols-2">
                {parameterCards.map((segment) => {
                  const isActive = activeSegmentKey === segment.key;

                  return (
                  <div
                    key={`donut-${segment.key}`}
                    onMouseEnter={() => setActiveSegmentKey(segment.key)}
                    onMouseLeave={() => setActiveSegmentKey(null)}
                    className={`space-y-1.5 rounded-md border px-2.5 py-2 transition-all ${
                      isActive
                        ? "border-cyan-300/60 bg-cyan-500/10 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                        : segment.isTopPerformer
                          ? "border-emerald-300/60 bg-emerald-500/10"
                          : segment.isLeastPerformer
                            ? "border-rose-300/60 bg-rose-500/10"
                            : "border-white/10 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 text-slate-300">
                        <span className="truncate">{segment.label}</span>
                        <InfoTooltip
                          text={`${segment.description} Weight: ${segment.weightPercent}%. Current contribution: ${segment.contribution.toFixed(1)}.`}
                        />
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span className="font-tabular text-slate-200">{segment.value.toFixed(1)}</span>
                        <button
                          type="button"
                          onClick={() => handleFixClick(segment.key, segment.label)}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-100 transition-colors hover:bg-amber-400/20"
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
                    <p className="text-[11px] text-slate-400">
                      Weight {segment.weightPercent}% · Contribution {segment.contribution.toFixed(1)}
                    </p>
                    {(segment.isTopPerformer || segment.isLeastPerformer) && (
                      <p className="text-[10px] font-medium text-slate-300">
                        {segment.isTopPerformer ? "Top performer" : "Least performer"}
                      </p>
                    )}
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400"
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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
              <div className="w-full max-w-xl rounded-xl border border-cyan-400/25 bg-slate-900 p-4 shadow-2xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cyan-100">
                      Fix plan: {activeRecommendation.label}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">{activeRecommendation.recommendation}</p>
                    <p className="mt-2 rounded-md border border-white/10 bg-slate-800/60 px-2.5 py-2 text-xs text-slate-300">
                      {activeRecommendation.example}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveRecommendation(null)}
                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-slate-200 hover:bg-white/5"
                  >
                    Close
                  </button>
                </div>
                {activeRecommendation.dealPresets && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-100">
                      Recommended Deal Presets
                    </p>
                    <div className="grid gap-2 md:grid-cols-3">
                      {activeRecommendation.dealPresets.map((preset) => (
                        <button
                          type="button"
                          key={`${activeRecommendation.key}-${preset.label}`}
                          onClick={() => {
                            if (createDealMutation.isPending) return;
                            createDealMutation.mutate(preset.payload, {
                              onSuccess: () => {
                                pushToast({
                                  title: "Preset deal created",
                                  description: `${preset.label} is now live.`,
                                  variant: "success",
                                });
                                setActiveRecommendation(null);
                              },
                            });
                          }}
                          disabled={createDealMutation.isPending}
                          className="rounded-md border border-amber-300/25 bg-amber-500/10 px-2.5 py-2 text-left text-xs transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          <p className="font-semibold text-amber-100">{preset.label}</p>
                          <p className="mt-1 text-slate-200">{preset.discountPercent}% OFF</p>
                          <p className="text-slate-300">Duration: {preset.duration}</p>
                          <p className="text-slate-400">Audience: {preset.audience}</p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const dealButton = document.getElementById("quick-action-add-deal");
                        dealButton?.click();
                      }}
                      className="inline-flex items-center rounded-md border border-amber-300/30 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-100 hover:bg-amber-400/20"
                    >
                      Open Add Deal
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
