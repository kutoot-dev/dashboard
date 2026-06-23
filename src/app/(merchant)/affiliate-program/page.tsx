"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { useToastStore } from "@/lib/stores/toast.store";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import {
  getAffiliateAnalytics,
  getAffiliatePayouts,
  getAffiliateProfile,
  getAffiliateProfileStatus,
  getAffiliateReferralLink,
  registerAffiliateProgram,
  type AffiliateBankDetailsInput,
  updateAffiliateBankDetails,
} from "@/lib/api/services/affiliate.service";
import { toAbsoluteAffiliateUrl } from "@/lib/utils/affiliate";
import { RegistrationCard } from "@/components/affiliate/registration-card";
import { ReferralCodeCard } from "@/components/affiliate/referral-code-card";
import { EarningsCard } from "@/components/affiliate/earnings-card";
import { RecentPayouts } from "@/components/affiliate/recent-payouts";
import { ReferralStats } from "@/components/affiliate/referral-stats";
import { BankDetailsCard } from "@/components/affiliate/bank-details-card";
import { ShareDialog } from "@/components/affiliate/share-dialog";

function parseNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function AffiliateProgramPage() {
  const branchId = useEffectiveBranchId();
  const pushToast = useToastStore((state) => state.push);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const statusQuery = useQuery({
    queryKey: ["affiliate-status", branchId],
    queryFn: getAffiliateProfileStatus,
    enabled: Boolean(branchId),
    refetchInterval: 30_000,
    retry: false,
  });

  const profileQuery = useQuery({
    queryKey: ["affiliate-profile", branchId],
    queryFn: getAffiliateProfile,
    enabled: Boolean(branchId),
    refetchInterval: 30_000,
    retry: false,
  });

  const isRegistered =
    (statusQuery.data?.success ? Boolean(statusQuery.data.data?.is_registered) : false) ||
    (profileQuery.data?.success ? Boolean(profileQuery.data.data?.is_registered) : false);

  const referralLinkQuery = useQuery({
    queryKey: ["affiliate-referral-link", branchId],
    queryFn: getAffiliateReferralLink,
    enabled: Boolean(branchId) && isRegistered,
    retry: false,
  });

  const analyticsQuery = useQuery({
    queryKey: ["affiliate-analytics", branchId],
    queryFn: getAffiliateAnalytics,
    enabled: Boolean(branchId) && isRegistered,
    refetchInterval: 30_000,
    retry: false,
  });

  const payoutsQuery = useQuery({
    queryKey: ["affiliate-payouts", branchId],
    queryFn: () => getAffiliatePayouts({ limit: 50 }),
    enabled: Boolean(branchId) && isRegistered,
    retry: false,
  });

  const registerMutation = useMutation({
    mutationFn: registerAffiliateProgram,
    onSuccess: () => {
      pushToast({
        variant: "success",
        title: "Affiliate registration complete",
        description: "Your affiliate account is now active.",
      });
      void statusQuery.refetch();
      void profileQuery.refetch();
      void referralLinkQuery.refetch();
      void analyticsQuery.refetch();
      void payoutsQuery.refetch();
    },
    onError: (error) => {
      pushToast({
        variant: "error",
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Could not register for affiliate program.",
      });
    },
  });

  const bankDetailsMutation = useMutation({
    mutationFn: (payload: AffiliateBankDetailsInput) =>
      updateAffiliateBankDetails(payload),
    onSuccess: () => {
      pushToast({
        variant: "success",
        title: "Bank details updated",
        description: "Your payout account was updated successfully.",
      });
      void profileQuery.refetch();
    },
  });

  const profile = profileQuery.data?.success ? profileQuery.data.data : null;
  const status = statusQuery.data?.success ? statusQuery.data.data : null;
  const referralData = referralLinkQuery.data?.success ? referralLinkQuery.data.data : null;
  const analytics = analyticsQuery.data?.success ? analyticsQuery.data.data : null;
  const payoutsResponse = payoutsQuery.data?.success ? payoutsQuery.data.data : null;

  const referralCode = referralData?.referral_code ?? profile?.referral_code ?? null;
  const referralLink = toAbsoluteAffiliateUrl(
    referralData?.referral_url ?? referralData?.share_url ?? profile?.referral_url ?? profile?.share_url,
  );

  const totalReferrals = parseNumber(analytics?.total_referrals);
  const successfulReferrals = parseNumber(analytics?.successful_referrals);
  const pendingReferrals = parseNumber(analytics?.pending_referrals);
  const conversionRate = useMemo(() => {
    if (typeof analytics?.conversion_rate === "number" && Number.isFinite(analytics.conversion_rate)) {
      return analytics.conversion_rate;
    }
    if (totalReferrals <= 0) return 0;
    return (successfulReferrals / totalReferrals) * 100;
  }, [analytics?.conversion_rate, successfulReferrals, totalReferrals]);

  const totalEarned = parseNumber(analytics?.total_earned ?? profile?.total_earned);
  const pendingBalance = parseNumber(analytics?.pending_balance ?? profile?.pending_balance);
  const minWithdrawalAmount = parseNumber(
    analytics?.min_withdrawal_amount ?? profile?.min_withdrawal_amount,
  );

  const payoutItems = (
    payoutsResponse?.items ??
    payoutsResponse?.rows ??
    payoutsResponse?.payouts ??
    []
  )
    .slice()
    .sort((a, b) => {
      const aDate = new Date(a.paid_at ?? a.requested_at ?? 0).getTime();
      const bDate = new Date(b.paid_at ?? b.requested_at ?? 0).getTime();
      return bDate - aDate;
    })
    .slice(0, 5);

  const handleRegister = () => {
    registerMutation.mutate();
  };

  const copyText = async (
    value: string,
    title: string,
    description: string,
  ) => {
    try {
      await navigator.clipboard.writeText(value);
      pushToast({
        variant: "success",
        title,
        description,
      });
    } catch (error) {
      pushToast({
        variant: "error",
        title: "Could not copy",
        description:
          error instanceof Error
            ? error.message
            : "Please copy the value manually.",
      });
    }
  };

  const saveBankDetails = async (payload: AffiliateBankDetailsInput) => {
    await bankDetailsMutation.mutateAsync(payload);
  };

  if (!branchId) {
    return (
      <Card className="p-6">
        <p className="text-sm text-loss">No store linked to this account.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Affiliate Program"
        subtitle="Manage registration, referral performance, payouts, and payout bank details."
      />

      <RegistrationCard
        isRegistered={isRegistered}
        status={status?.status ?? profile?.status ?? "not_registered"}
        isLoading={statusQuery.isLoading}
        isRegistering={registerMutation.isPending}
        canRegister={status?.can_register ?? true}
        onRegister={handleRegister}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <ReferralCodeCard
          referralCode={referralCode}
          referralLink={referralLink}
          isLoading={referralLinkQuery.isLoading || profileQuery.isLoading}
          disabled={!isRegistered}
          onRegenerate={() => void referralLinkQuery.refetch()}
          onCopyCode={() => {
            if (!referralCode) return;
            void copyText(
              referralCode,
              "Referral code copied",
              "Share it with merchants during signup.",
            );
          }}
          onCopyLink={() => {
            if (!referralLink) return;
            void copyText(
              referralLink,
              "Referral link copied",
              "Share this link with merchants.",
            );
          }}
          onShare={() => setShareDialogOpen(true)}
        />

        <EarningsCard
          totalEarned={totalEarned}
          pendingBalance={pendingBalance}
          minWithdrawalAmount={minWithdrawalAmount}
        />

        <ReferralStats
          totalReferrals={totalReferrals}
          successfulReferrals={successfulReferrals}
          pendingReferrals={pendingReferrals}
          conversionRate={conversionRate}
        />

        <BankDetailsCard
          bankDetails={profile?.bank_details ?? null}
          disabled={!isRegistered}
          isSaving={bankDetailsMutation.isPending}
          onSave={saveBankDetails}
        />
      </div>

      <RecentPayouts payouts={payoutItems} />

      <ShareDialog
        isOpen={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        referralCode={referralCode}
        referralLink={referralLink}
        onCopyLink={() => {
          if (!referralLink) return;
          void copyText(
            referralLink,
            "Referral link copied",
            "Share this link with merchants.",
          );
        }}
      />
    </div>
  );
}
