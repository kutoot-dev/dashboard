"use client";

import { useQuery } from "@tanstack/react-query";
import { getOnboardingProfile, getStoreProfile } from "@/lib/api/services/merchant.service";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { ProfileRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { OnboardingProfileSections } from "@/components/settings/onboarding-profile-sections";

function formatTime(value: string | null | undefined): string {
  if (!value) return "--";
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export default function StorePage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const storeQuery = useQuery({
    queryKey: ["store-profile", branchId],
    queryFn: () => getStoreProfile(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const onboardingQuery = useQuery({
    queryKey: ["store-onboarding-profile", branchId],
    queryFn: () => getOnboardingProfile(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const profile = storeQuery.data?.success ? storeQuery.data.data : null;
  const onboardingSections =
    onboardingQuery.data?.success ? onboardingQuery.data.data.sections : [];
  const showSkeleton = useQuerySkeleton(storeQuery);
  const showOnboardingSkeleton = useQuerySkeleton(onboardingQuery);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Settings"
        subtitle="Review your store contact details and onboarding submission."
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Store details</h2>
          <p className="text-sm text-muted-foreground">
            Contact and operating hours on file for your branch. This is read-only.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3 md:col-span-2 lg:col-span-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Profile
            </p>

            {showSkeleton && <ProfileRowsSkeleton rows={5} />}

            {!showSkeleton && profile && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Store email</span>
                  <span className="font-medium text-foreground">{profile.store_email || "--"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Owner name</span>
                  <span className="font-medium text-foreground">{profile.owner_name || "--"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Owner WhatsApp mobile</span>
                  <span className="font-medium text-foreground">
                    {profile.owner_mobile_whatsapp || "--"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Operating start</span>
                  <span className="font-medium text-foreground">
                    {formatTime(profile.operating_hours_start)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Operating end</span>
                  <span className="font-medium text-foreground">
                    {formatTime(profile.operating_hours_end)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          <Card className="space-y-3 md:col-span-2 lg:col-span-1">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Quick reference
            </p>

            {showSkeleton && <ProfileRowsSkeleton rows={6} />}

            {!showSkeleton && profile && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Store name</span>
                  <span className="font-medium text-foreground">{profile.name || "--"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium text-foreground">{profile.category || "--"}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="font-medium text-foreground">
                    {profile.commission_percentage != null
                      ? `${profile.commission_percentage}%`
                      : "--"}
                  </span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Onboarding profile</h2>
          <p className="text-sm text-muted-foreground">
            Everything collected when your store was onboarded. This is read-only.
          </p>
        </div>

        {showOnboardingSkeleton ? (
          <div className="space-y-4">
            <ProfileRowsSkeleton rows={8} />
            <ProfileRowsSkeleton rows={8} />
          </div>
        ) : onboardingQuery.isError ? (
          <Card className="p-4 text-sm text-muted-foreground">
            Unable to load onboarding details right now. Please refresh the page.
          </Card>
        ) : (
          <OnboardingProfileSections sections={onboardingSections} />
        )}
      </section>
    </div>
  );
}
