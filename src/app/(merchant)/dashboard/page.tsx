"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { DashboardPageSkeleton } from "@/components/ui/loading-skeletons";
import { ScoreInsightsCard } from "@/components/ui/score-insights-card";
import { ScoreTrendCard } from "@/components/ui/score-trend-card";
import { CommissionSliderCard } from "@/components/ui/commission-slider-card";
import { RecentRedemptionsSlideshow } from "@/components/ui/recent-redemptions-slideshow";
import { ActivityTicker } from "@/components/ui/activity-ticker";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { DashboardStatsGrid } from "@/components/dashboard/dashboard-stats-grid";
import { DashboardReferralCard } from "@/components/dashboard/dashboard-referral-card";
import { DashboardTabPanel } from "@/components/dashboard/dashboard-tab-panel";
import { ImprovementModal } from "@/components/dashboard/improvement-modal";
import { getMerchantDashboard, type MerchantScoreInsight } from "@/lib/api/services/merchant.service";
import { SUB_SCORE_DESCRIPTIONS, SUB_SCORE_LABELS } from "@/lib/constants/scoring";
import { formatINR } from "@/lib/utils/format";
import { useToastStore } from "@/lib/stores/toast.store";
import { useTransactionStream } from "@/lib/hooks/use-transaction-stream";
import type { DashboardSectionId } from "@/lib/hooks/use-dashboard-layout";

const EMPTY_SCORE_INSIGHTS: MerchantScoreInsight[] = [];

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const pushToast = useToastStore((s) => s.push);
  const branchId = useEffectiveBranchId();
  const [activeTab, setActiveTab] = useState<DashboardSectionId>("stats-strip");

  useTransactionStream(branchId);

  const { data, isLoading } = useQuery({
    queryKey: ["merchant-dashboard", branchId],
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
  const [activeRecommendation, setActiveRecommendation] = useState<{
    key: string;
    label: string;
    recommendation: string;
    example: string;
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
    { label: "Total amount", value: formatINR(totalAmount), helper: "Gross sales today" },
    { label: "Discounts", value: formatINR(discounts), helper: "Offers redeemed today" },
    {
      label: "Net amount",
      value: formatINR(Math.max(0, netAmount)),
      helper: "After discounts",
      emphasis: true,
    },
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
      setActiveTab("boost-commission");
      requestAnimationFrame(() => {
        document.getElementById("growth-boost-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
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

    if (key === "referral_score") {
      setActiveTab("referral");
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

  function renderActiveTab() {
    switch (activeTab) {
      case "stats-strip":
        return <DashboardStatsGrid stats={statsCards} />;
      case "score-history":
        return (
          <ScoreTrendCard
            scoreBreakdown={scoreBreakdown}
            compositeScore={compositeScore}
            todayTransactions={dashboard?.today?.transactions ?? 0}
            scoreInsights={scoreInsights}
          />
        );
      case "improve":
        return (
          <ScoreInsightsCard
            segments={parameterCards}
            pieData={pieData}
            compositeScore={compositeScore}
            compositeRank={compositeRank}
            onImproveClick={handleFixClick}
          />
        );
      case "referral":
        return (
          <DashboardReferralCard
            referralCode={merchantReferralCode}
            referralShareUrl={referralShareUrl}
            onOpenReferral={() => router.push("/merchant-referral")}
            onCopyLink={() => void handleCopyReferralLink()}
          />
        );
      case "boost-commission":
        return (
          <div id="growth-boost-card">
            <CommissionSliderCard className="border border-secondary/30 bg-card/70" />
          </div>
        );
      case "redemptions":
        return <RecentRedemptionsSlideshow className="border border-gain/25 bg-card/70" />;
      case "volume":
        return (
          <div className="rounded-xl border border-accent/25 bg-card/70 p-3">
            <ActivityTicker />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <DashboardHero
        userName={user?.name}
        compositeScore={compositeScore}
        compositeRank={compositeRank}
        activeDeals={dashboard?.live?.active_deals ?? 0}
      />

      {!dashboard && isLoading ? (
        <DashboardPageSkeleton />
      ) : (
        <>
          <DashboardTabPanel activeTab={activeTab} onTabChange={setActiveTab}>
            {renderActiveTab()}
          </DashboardTabPanel>

          {activeRecommendation && (
            <ImprovementModal
              label={activeRecommendation.label}
              recommendation={activeRecommendation.recommendation}
              example={activeRecommendation.example}
              onClose={() => setActiveRecommendation(null)}
            />
          )}
        </>
      )}
    </div>
  );
}
