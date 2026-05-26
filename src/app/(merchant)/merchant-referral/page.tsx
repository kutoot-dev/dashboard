"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getMerchantDashboard } from "@/lib/api/services/merchant.service";
import { IMPROVEMENT_TIPS, SUB_SCORE_DESCRIPTIONS } from "@/lib/constants/scoring";
import { useToastStore } from "@/lib/stores/toast.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";

export default function MerchantReferralPage() {
  const router = useRouter();
  const { user } = useAuth();
  const pushToast = useToastStore((s) => s.push);
  const branchId = useEffectiveBranchId();

  const dashboardQuery = useQuery({
    queryKey: ["merchant-dashboard"],
    queryFn: getMerchantDashboard,
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const showSkeleton = useQuerySkeleton(dashboardQuery);
  const dashboard = dashboardQuery.data?.success ? dashboardQuery.data.data : null;
  const referralCode = dashboard?.merchant_referral_code ?? "--";
  const referralShareUrl = dashboard?.referral_share_url ?? null;

  const referralTips = useMemo(() => IMPROVEMENT_TIPS.referral_score ?? [], []);
  const referralDescription = SUB_SCORE_DESCRIPTIONS.referral_score;

  async function handleCopyReferralLink() {
    if (!referralShareUrl) {
      pushToast({
        variant: "warning",
        title: "Referral link unavailable",
        description: "Wait for dashboard data to load and try again.",
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
        description: "Share it with other merchants to bring them into the network.",
      });
    } catch {
      pushToast({
        variant: "error",
        title: "Could not copy link",
        description: "Copy manually from the link shown on this page.",
      });
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Referral"
        subtitle="Your referral center for sharing the branch code, tracking referral performance, and improving the merchant-referral score."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="space-y-4 border border-primary/25 bg-card/75 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Shareable code</p>
            {showSkeleton ? (
              <Skeleton className="mt-2 h-9 w-48" />
            ) : (
              <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">{referralCode}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              Use this code when inviting other merchants so your referral activity is attached to your branch.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/35 p-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Referral link</p>
            {showSkeleton ? (
              <Skeleton className="mt-2 h-4 w-full max-w-md" />
            ) : (
              <p className="mt-2 break-all text-sm text-foreground">{referralShareUrl ?? "--"}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopyReferralLink}
                className="rounded-md border border-accent/35 bg-accent/12 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
              >
                Copy Link
              </button>
              {referralShareUrl && (
                <a
                  href={referralShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open Link
                </a>
              )}
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Back
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3 border border-primary/28 bg-card/70 p-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Why it matters</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{referralDescription}</p>
            </div>
            <div className="space-y-2">
              {referralTips.map((tip) => (
                <div key={tip} className="rounded-md border border-border/60 bg-background/30 px-3 py-2 text-sm text-foreground">
                  {tip}
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 border border-secondary/28 bg-card/70 p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">What to do next</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Share the code with nearby merchants who are likely to activate and stay active.</p>
              <p>Track referred merchant quality instead of only counting raw signups.</p>
              <p>Use this page when you want the referral-specific view separate from the dashboard.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
