"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { getMerchantDashboard } from "@/lib/api/services/merchant.service";
import { IMPROVEMENT_TIPS, SUB_SCORE_DESCRIPTIONS } from "@/lib/constants/scoring";
import { useToastStore } from "@/lib/stores/toast.store";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import {
  buildMerchantReferralShareMessage,
  toAbsoluteShareUrl,
} from "@/lib/utils/merchant-referral";

export default function MerchantReferralPage() {
  const router = useRouter();
  const pushToast = useToastStore((s) => s.push);
  const branchId = useEffectiveBranchId();

  const dashboardQuery = useQuery({
    queryKey: ["merchant-dashboard", branchId],
    queryFn: getMerchantDashboard,
    refetchInterval: 30_000,
    retry: false,
    enabled: Boolean(branchId),
  });

  const showSkeleton = useQuerySkeleton(dashboardQuery);
  const dashboard = dashboardQuery.data?.success ? dashboardQuery.data.data : null;
  const referralCode = dashboard?.merchant_referral_code ?? null;
  const referralShareUrl = toAbsoluteShareUrl(dashboard?.referral_share_url);
  const referralIosAppUrl = dashboard?.referral_ios_app_url ?? null;
  const referralAndroidAppUrl = dashboard?.referral_android_app_url ?? null;

  const referralTips = useMemo(() => IMPROVEMENT_TIPS.referral_score ?? [], []);
  const referralDescription = SUB_SCORE_DESCRIPTIONS.referral_score;

  async function copyText(value: string, successTitle: string, successDescription: string) {
    try {
      await navigator.clipboard.writeText(value);
      pushToast({
        variant: "success",
        title: successTitle,
        description: successDescription,
      });
    } catch {
      pushToast({
        variant: "error",
        title: "Could not copy",
        description: "Copy manually from the value shown on this page.",
      });
    }
  }

  async function handleCopyReferralCode() {
    if (!referralCode) {
      pushToast({
        variant: "warning",
        title: "Referral code unavailable",
        description: "Wait for dashboard data to load and try again.",
      });
      return;
    }

    await copyText(
      referralCode,
      "Referral code copied",
      "Share it with merchants when they install Kutoot Business.",
    );
  }

  async function handleCopyShareMessage() {
    const message = buildMerchantReferralShareMessage({
      referralCode,
      referralShareUrl,
      referralIosAppUrl,
      referralAndroidAppUrl,
    });

    if (!message) {
      pushToast({
        variant: "warning",
        title: "Share message unavailable",
        description: "Wait for dashboard data to load and try again.",
      });
      return;
    }

    await copyText(
      message,
      "Share message copied",
      "Send it to other merchants with your code and app download links.",
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Merchant Referral"
        subtitle="Share your referral code and Kutoot Business app links so other merchants can join under your branch."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <Card className="space-y-5 border border-primary/25 bg-card/75 p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Your referral code</p>
            {showSkeleton ? (
              <Skeleton className="mt-2 h-9 w-48" />
            ) : (
              <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
                {referralCode ?? "--"}
              </p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              New merchants should enter this code in the Kutoot Business app during signup.
            </p>
            <button
              type="button"
              onClick={() => void handleCopyReferralCode()}
              disabled={!referralCode || showSkeleton}
              className="mt-3 rounded-md border border-accent/35 bg-accent/12 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Copy Code
            </button>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/35 p-4 space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Share Kutoot Business</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Share the app store links below. Use the smart link when you want the recipient&apos;s device to pick
                iOS or Android automatically.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-border/60 bg-background/30 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Smart download link</p>
                {showSkeleton ? (
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                ) : (
                  <p className="mt-2 break-all text-sm text-foreground">{referralShareUrl ?? "--"}</p>
                )}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/30 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">iOS App Store</p>
                {showSkeleton ? (
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                ) : (
                  <p className="mt-2 break-all text-sm text-foreground">{referralIosAppUrl ?? "--"}</p>
                )}
              </div>

              <div className="rounded-lg border border-border/60 bg-background/30 p-3">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Google Play</p>
                {showSkeleton ? (
                  <Skeleton className="mt-2 h-4 w-full max-w-md" />
                ) : (
                  <p className="mt-2 break-all text-sm text-foreground">{referralAndroidAppUrl ?? "--"}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleCopyShareMessage()}
                disabled={showSkeleton || !referralCode}
                className="rounded-md border border-accent/35 bg-accent/12 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy Share Message
              </button>
              {referralIosAppUrl && (
                <a
                  href={referralIosAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open iOS Link
                </a>
              )}
              {referralAndroidAppUrl && (
                <a
                  href={referralAndroidAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-border/70 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Open Android Link
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
              <p>Share your code plus the Kutoot Business app link with nearby merchants.</p>
              <p>Ask them to enter your code when they sign up in the mobile app.</p>
              <p>Track referred merchant quality instead of only counting raw signups.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
