"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { useLiveLeaderboard } from "@/lib/hooks/use-live-data";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RankBadge } from "@/components/ui/rank-badge";
import { ChangeIndicator } from "@/components/ui/change-indicator";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SparklineChart } from "@/components/charts/sparkline-chart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { formatScore, formatINR, formatPeriodRange } from "@/lib/utils/format";
import type { LeaderboardFilters } from "@/lib/types";

const CITY_TIERS = [
  { value: "", label: "All Tiers" },
  { value: "tier_1", label: "Tier 1" },
  { value: "tier_2", label: "Tier 2" },
  { value: "tier_3", label: "Tier 3" },
];

const STATES = [
  { value: "", label: "All States" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Delhi", label: "Delhi" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
];

const PAGE_SIZE = 20;
const TOTAL_BRANCHES = 50;

export default function LeaderboardPage() {
  const { user } = useAuth();
  const currentBranchId = user?.branch_id ?? "m-001";

  const [filters, setFilters] = useState<LeaderboardFilters>({
    page: 1,
    limit: PAGE_SIZE,
    city_tier: "",
    state: "",
    period_id: "",
  });

  const { data: periods } = useScoringPeriods();
  const { data: leaderboard, isLoading } = useLiveLeaderboard(filters);

  const periodOptions = [
    { value: "", label: "Latest Period" },
    ...(periods ?? []).map((p) => ({
      value: p.period_id,
      label: formatPeriodRange(p.period_start, p.period_end),
    })),
  ];

  const items = leaderboard ?? [];
  const totalPages = 1;
  const currentPage = filters.page ?? 1;

  function updateFilter(key: keyof LeaderboardFilters, value: string | number) {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
  }

  return (
    <div className="space-y-4">
      <PageHeader title="Rankings" subtitle="See how your shop compares with others" />

      {/* Filters */}
      <Card className="flex flex-wrap items-center gap-3 p-3">
        <Select
          options={CITY_TIERS}
          value={filters.city_tier ?? ""}
          onChange={(v) => updateFilter("city_tier", v)}
        />
        <Select
          options={STATES}
          value={filters.state ?? ""}
          onChange={(v) => updateFilter("state", v)}
        />
        <Select
          options={periodOptions}
          value={filters.period_id ?? ""}
          onChange={(v) => updateFilter("period_id", v)}
        />
      </Card>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-border px-4 py-3"
              >
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="No merchants found"
            description="Try adjusting your filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1"># <InfoTooltip text="Branch ranking based on overall score. Updates live." /></span>
                  </th>
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">Dukaan <InfoTooltip text="Business name of the branch." /></span>
                  </th>
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center gap-1">Category <InfoTooltip text="Type of business — kirana, pharmacy, electronics, etc." /></span>
                  </th>
                  <th className="px-3 py-2 text-left font-mono text-xs font-medium text-muted-foreground">
                    City
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">Score <InfoTooltip text="Overall performance score out of 100." /></span>
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">Change <InfoTooltip text="Score change since last period." /></span>
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">Reward <InfoTooltip text="Reward earned for this period. Top merchants earn cash rewards." /></span>
                  </th>
                  <th className="px-3 py-2 text-right font-mono text-xs font-medium text-muted-foreground">
                    <span className="flex items-center justify-end gap-1">Trend <InfoTooltip text="Score trend over recent periods." /></span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((entry) => {
                  const isMe = entry.branch_id === currentBranchId;
                  return (
                    <tr
                      key={entry.branch_id}
                      className={cn(
                        "border-b border-border transition-colors",
                        isMe
                          ? "bg-accent/5 border-l-2 border-l-accent"
                          : "hover:bg-card-hover",
                      )}
                    >
                      {/* Rank */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-foreground">
                            {entry.rank}
                          </span>
                          <ChangeIndicator value={entry.rank_movement} suffix="" />
                          <RankBadge
                            rank={entry.rank}
                            totalBranches={TOTAL_BRANCHES}
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-medium",
                              isMe ? "text-accent" : "text-foreground",
                            )}
                          >
                            {entry.business_name}
                          </span>
                          {isMe && (
                            <Badge variant="accent">You</Badge>
                          )}
                        </div>
                      </td>

                      {/* Sector */}
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {entry.sector_name}
                      </td>

                      {/* City */}
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {entry.city_name}
                      </td>

                      {/* Score */}
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-foreground">
                        {formatScore(entry.composite_score)}
                      </td>

                      {/* Change */}
                      <td className="px-3 py-2 text-right">
                        <ChangeIndicator value={entry.score_change} suffix="" />
                      </td>

                      {/* Payout */}
                      <td className="px-3 py-2 text-right">
                        {entry.payout_status === "paid" ? (
                          <Badge variant="gain">{formatINR(entry.payout_amount)}</Badge>
                        ) : entry.payout_status === "non_monetary" ? (
                          <Badge variant="neutral">Non-monetary</Badge>
                        ) : (
                          <span className="font-mono text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Sparkline */}
                      <td className="px-3 py-2 text-right">
                        {entry.sparkline_data.length > 0 && (
                          <div className="ml-auto w-[100px]">
                            <SparklineChart
                              data={entry.sparkline_data}
                              width={100}
                              height={28}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
            {items.length > 0 && ` · ${items.length} merchants`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: currentPage - 1 }))}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: currentPage + 1 }))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
