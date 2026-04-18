"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { TradingViewChart } from "@/components/charts/trading-view-chart";
import { getStoreProfile } from "@/lib/api/services/merchant.service";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { formatScore } from "@/lib/utils/format";

export default function LeaderboardMerchantProfilePage() {
  const params = useParams<{ branchId: string }>();
  const branchId = params?.branchId ?? "0";
  const numericBranchId = Number(branchId) || 0;

  const { data: leaderboardData } = useLeaderboard({ limit: 200, page: 1 });

  const entry = useMemo(
    () => leaderboardData?.items.find((item) => item.branch_id === branchId),
    [leaderboardData?.items, branchId],
  );

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["store-profile", branchId, "leaderboard-view"],
    queryFn: () => getStoreProfile(branchId),
    retry: false,
  });

  return (
    <div className="space-y-4 pb-safe-bottom md:pb-0">
      <PageHeader
        title={entry?.business_name ?? profile?.data?.name ?? `Merchant ${branchId}`}
        subtitle="Merchant performance profile"
      >
        <Link
          href="/leaderboard"
          className="rounded-md border border-border px-3 py-2 font-mono text-xs text-muted-foreground transition hover:text-foreground"
        >
          Back to Rankings
        </Link>
      </PageHeader>

      <Card className="overflow-hidden p-0 glass-card-sm">
        <div className="border-b border-border px-4 py-2">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            TradingView Score Chart
          </h2>
        </div>
        <TradingViewChart locationId={numericBranchId} height={360} defaultResolution="D" />
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Card className="glass-card-sm p-4">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Leaderboard Snapshot
          </h3>
          {entry ? (
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Rank</p>
                <p className="font-mono text-2xl font-semibold">#{entry.rank}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Score</p>
                <p className="font-mono text-2xl font-semibold">{formatScore(entry.composite_score)}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Category</p>
                <p>{entry.sector_name}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase text-muted-foreground">Location</p>
                <p>{entry.city_name}, {entry.state}</p>
              </div>
            </div>
          ) : (
            <EmptyState title="Merchant ranking details unavailable" description="Profile details are still visible below." />
          )}
        </Card>

        <Card className="glass-card-sm p-4">
          <h3 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Merchant Profile
          </h3>
          {profileLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : profile?.success && profile.data ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Owner:</span> {profile.data.owner_name || "--"}</p>
              <p><span className="text-muted-foreground">Email:</span> {profile.data.store_email || "--"}</p>
              <p><span className="text-muted-foreground">Phone:</span> {profile.data.owner_mobile_whatsapp || "--"}</p>
              <p><span className="text-muted-foreground">Address:</span> {profile.data.address || "--"}</p>
              <p><span className="text-muted-foreground">Hours:</span> {profile.data.operating_hours_start || "--"} - {profile.data.operating_hours_end || "--"}</p>
            </div>
          ) : (
            <EmptyState title="Store profile unavailable" description="The chart remains available for this merchant." />
          )}
        </Card>
      </div>
    </div>
  );
}
