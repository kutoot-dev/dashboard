"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingProfile } from "@/lib/api/services/merchant.service";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ProfileRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { OnboardingProfileSections } from "@/components/settings/onboarding-profile-sections";
import { ApplicationStatusCard } from "@/components/settings/application-status-card";
import { StoreQrCodes } from "@/components/settings/store-qr-codes";
import { StoreMediaGallery } from "@/components/settings/store-media-gallery";

export default function StorePage() {
  const branchId = useEffectiveBranchId();

  const profileQuery = useQuery({
    queryKey: ["store-onboarding-profile", branchId],
    queryFn: () => getOnboardingProfile(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const sections = profileQuery.data?.success ? profileQuery.data.data.sections : [];
  const applicationStatus = profileQuery.data?.success
    ? profileQuery.data.data.application_status
    : undefined;
  const showProfileSkeleton = useQuerySkeleton(profileQuery);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Review your store details, bank and KYC information, media, and QR codes."
      />

      {showProfileSkeleton ? (
        <ProfileRowsSkeleton rows={3} />
      ) : applicationStatus ? (
        <ApplicationStatusCard status={applicationStatus} />
      ) : null}

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Discount program</h2>
          <p className="text-sm text-muted-foreground">
            Configure merchant-funded bill discounts and amount bands for your branch.
          </p>
        </div>
        <Link
          href="/discount-program"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-border/80 bg-card/80 px-4 text-sm font-semibold text-foreground transition-all hover:border-accent/35 hover:bg-card-hover"
        >
          Manage discount bands
        </Link>
      </Card>

      {showProfileSkeleton ? (
        <div className="space-y-4">
          <ProfileRowsSkeleton rows={8} />
          <ProfileRowsSkeleton rows={6} />
          <ProfileRowsSkeleton rows={6} />
        </div>
      ) : profileQuery.isError ? (
        <Card className="p-4 text-sm text-muted-foreground">
          Unable to load store details right now. Please refresh the page.
        </Card>
      ) : (
        <OnboardingProfileSections sections={sections} />
      )}

      {branchId ? <StoreMediaGallery branchId={branchId} /> : null}

      {branchId ? <StoreQrCodes branchId={branchId} /> : null}
    </div>
  );
}
