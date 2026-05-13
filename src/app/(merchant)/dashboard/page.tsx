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
import { ActivityTicker } from "@/components/ui/activity-ticker";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getMerchantDashboard, type MerchantScoreInsight } from "@/lib/api/services/merchant.service";
import {
  IMPROVEMENT_TIPS,
  SUB_SCORE_DESCRIPTIONS,
  SUB_SCORE_LABELS,
} from "@/lib/constants/scoring";
import { formatINR, formatScore } from "@/lib/utils/format";
import { useToastStore } from "@/lib/stores/toast.store";

const EMPTY_SCORE_INSIGHTS: MerchantScoreInsight[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const pushToast = useToastStore((s) => s.push);
  const branchId = user?.branch_id ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: getMerchantDashboard,
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const dashboard = data?.success ? data.data : null;
  const scoreBreakdown = dashboard?.live?.score_breakdown ?? {};
  const scoreInsights = dashboard?.live?.score_insights ?? EMPTY_SCORE_INSIGHTS;
  const parameterCards = useMemo(
    () =>
      scoreInsights.map((segment) => ({
        key: segment.key,
        value: Number(segment.score ?? 0),
        weight: Number(segment.weight ?? 0),
        weightPercent: Number(segment.weight ?? 0) * 100,
        contribution: Number(segment.contribution ?? 0),
        isTopPerformer: Boolean(segment.is_top_performer),
        isLeastPerformer: Boolean(segment.is_least_performer),
        label: SUB_SCORE_LABELS[segment.key] ?? segment.key,
        description: SUB_SCORE_DESCRIPTIONS[segment.key] ?? "No description available.",
      })),
    [scoreInsights],
  );
  const pieData = useMemo(
    () =>
      parameterCards.map((segment) => ({
        key: segment.key,
        label: segment.label,
        value: segment.value,
        weight: segment.weight,
      })),
    [parameterCards],
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
  const compositeScore = dashboard?.live.composite_score ?? 0;
  const compositeRank = dashboard?.live.rank ?? null;
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
  const merchantReferralCode = dashboard?.merchant_referral_code ?? null;
  const referralShareUrl = dashboard?.referral_share_url ?? null;

  async function handleCopyReferralLink() {
    if (!referralShareUrl) {
      pushToast({
        variant: "warning",
        title: "Referral link unavailable",
        description: "Please wait for dashboard data to load and try again.",
      });

      return;
    }

    try {
      const absoluteShareUrl =
        referralShareUrl.startsWith("http://") || referralShareUrl.startsWith("https://")
          ? referralShareUrl
          : `${window.location.origin}${referralShareUrl.startsWith("/") ? "" : "/"}${referralShareUrl}`;

      await navigator.clipboard.writeText(absoluteShareUrl);
      pushToast({
        variant: "success",
        title: "Referral link copied",
        description: "Share it with merchants to auto-fill your referral code.",
      });
    } catch {
      pushToast({
        variant: "error",
        title: "Could not copy link",
        description: "Copy manually from the link shown in the referral card.",
      });
    }
  }

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

  function handleOpenMerchantReferral() {
    router.push("/merchant-referral");
  }

  const activeSegment =
    parameterCards.find((segment) => segment.key === activeSegmentKey) ?? parameterCards[0] ?? null;
  const compositeCalculationRows = useMemo(
    () =>
      parameterCards.map((segment) => {
        const normalizedWeight = segment.weight;
        const weightedContribution = segment.value * normalizedWeight;

        return {
          key: segment.key,
          label: segment.label,
          score: segment.value,
          weightPercent: segment.weightPercent,
          weightedContribution,
        };
      }),
    [parameterCards],
  );

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Merchant Dashboard
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Today at a glance
        </h1>
       
      </div>

      {!dashboard && isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="h-28 animate-pulse bg-card/50">
                <div className="h-full w-full" />
              </Card>
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)]">
            <Card className="h-[420px] animate-pulse bg-card/50" />
            <div className="space-y-4">
              <Card className="h-40 animate-pulse bg-card/50" />
              <Card className="h-44 animate-pulse bg-card/50" />
              <Card className="h-48 animate-pulse bg-card/50" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((card) => (
              <Card key={card.label} className="border border-accent/28 bg-card/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</p>
                <p className="mt-2 font-tabular text-xl font-semibold text-foreground">{card.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{card.helper}</p>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.85fr)] xl:items-start">
            <div className="space-y-4">
              <ScoreTrendCard
                scoreBreakdown={scoreBreakdown}
                compositeScore={compositeScore}
                todayTransactions={dashboard?.today?.transactions ?? 0}
                scoreInsights={scoreInsights}
              />

              <Card className="space-y-5 border border-primary/28 bg-card/72 p-5">
                <div>
                  <h3 className="font-display text-sm font-semibold text-primary">Score Insights</h3>
                  <p className="text-xs text-muted-foreground">
                    Hover any donut slice or parameter row to inspect it. Use Fix on lower scores for quick guidance.
                  </p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/30 p-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                    How composite score is calculated
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Composite score = Sum of (parameter score out of 100 × parameter weight).
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {compositeCalculationRows.map((row) => (
                      <p key={row.key} className="text-[11px] text-muted-foreground">
                        <span className="font-medium text-foreground">{row.label}:</span>{" "}
                        {row.score.toFixed(1)} out of 100 × {row.weightPercent.toFixed(2)}% ={" "}
                        <span className="font-semibold text-foreground">{row.weightedContribution.toFixed(2)}</span>
                      </p>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Total composite shown above: <span className="font-semibold text-foreground">{formatScore(compositeScore)}</span>
                  </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-12 lg:items-start">
                  <div className="flex h-full flex-col space-y-4 rounded-lg border border-accent/28 bg-card/70 p-4 lg:col-span-12">
                    <div className="flex flex-wrap items-start justify-between gap-3">
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
                          Composite {formatScore(compositeScore)}{" "}
                          {typeof compositeRank === "number" ? `· Rank #${compositeRank}` : ""}
                        </p>
                      </div>
                    </div>
                    <ScorePie
                      data={pieData}
                      composite={compositeScore}
                      rank={compositeRank}
                      size={260}
                      compact
                      activeKey={activeSegmentKey}
                      onActiveKeyChange={setActiveSegmentKey}
                    />
                    {activeSegment && (
                      <div className="rounded-md border border-accent/35 bg-accent/10 px-3 py-2">
                        <p className="text-xs font-semibold text-accent">{activeSegment.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Score <span className="font-semibold text-foreground">{activeSegment.value.toFixed(0)} out of 100</span> · Weight{" "}
                          <span className="font-semibold text-foreground">{activeSegment.weightPercent.toFixed(2)}%</span> · Adds{" "}
                          <span className="font-semibold text-foreground">
                            {activeSegment.contribution.toFixed(1)} out of {(activeSegment.weight * 100).toFixed(1)}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex h-full flex-col space-y-4 rounded-lg border border-primary/28 bg-card/70 p-4 lg:col-span-12">
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Scoring Parameters</h4>
                      <p className="text-xs text-muted-foreground">
                        Best-performing on top, low-performing at the bottom.
                      </p>
                    </div>
                    <div className="grid flex-1 gap-3 overflow-auto pr-1 sm:grid-cols-1 lg:grid-cols-2">
                      {parameterCards.map((segment) => {
                        const isActive = activeSegmentKey === segment.key;
                        const maxContribution = segment.weight * 100;

                        return (
                          <div
                            key={`donut-${segment.key}`}
                            onMouseEnter={() => setActiveSegmentKey(segment.key)}
                            onMouseLeave={() => setActiveSegmentKey(null)}
                            className={`space-y-2.5 rounded-md border px-3 py-3 transition-all ${
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
                                  text={`${segment.description} Weight: ${segment.weightPercent.toFixed(2)}%. Current contribution: ${segment.contribution.toFixed(1)}.`}
                                />
                              </span>
                              <span className="flex shrink-0 items-center gap-2">
                                <span className="font-tabular text-foreground">{segment.value.toFixed(1)} out of 100</span>
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
                              Weight {segment.weightPercent.toFixed(2)}% · Contribution {segment.contribution.toFixed(1)} out of {maxContribution.toFixed(1)}
                            </p>
                            <p className="text-[11px] leading-4 text-muted-foreground">
                              {segment.description}
                            </p>
                            <div className="rounded-md border border-border/60 bg-background/35 px-2 py-2">
                              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                                Improve next
                              </p>
                              <div className="mt-1 space-y-1 text-[11px] leading-4 text-muted-foreground">
                                {(IMPROVEMENT_TIPS[segment.key] ?? [
                                  "Focus on cleaner customer behavior and more consistent volume.",
                                  "Use short, repeatable actions to move the score steadily.",
                                ])
                                  .slice(0, 2)
                                  .map((tip) => (
                                    <p key={tip} className="flex gap-1">
                                      <span className="mt-[2px] text-accent">•</span>
                                      <span>{tip}</span>
                                    </p>
                                  ))}
                              </div>
                            </div>
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
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              <Card
                role="link"
                tabIndex={0}
                onClick={handleOpenMerchantReferral}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleOpenMerchantReferral();
                  }
                }}
                className="cursor-pointer border border-primary/25 bg-card/75 p-4 transition-colors hover:border-accent/45 hover:bg-card/80"
              >
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  Merchant Referral
                </p>
                <p className="mt-1 text-lg font-semibold text-foreground">
                  {merchantReferralCode ?? "--"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Open your referral center to see your shareable code, growth tips, and the latest referral activity.
                </p>
                <p className="mt-2 break-all text-[11px] text-muted-foreground">
                  {referralShareUrl ?? "--"}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCopyReferralLink();
                    }}
                    className="rounded-md border border-accent/35 bg-accent/12 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
                  >
                    Copy Link
                  </button>
                  {referralShareUrl && (
                    <a
                      href={referralShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-md border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Open Link
                    </a>
                  )}
                  <span className="rounded-md border border-dashed border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    More Info
                  </span>
                </div>
              </Card>

              <div id="growth-boost-card">
                <CommissionSliderCard className="border border-secondary/30 bg-card/70" />
              </div>

              <RecentRedemptionsSlideshow className="border border-gain/25 bg-card/70" />

              <Card className="border border-accent/25 bg-card/70 p-3">
                <ActivityTicker />
              </Card>
            </div>
            </div>
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
