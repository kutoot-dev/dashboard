"use client";

import { useFraudFlags, useForceMajeure, useCohortHealth } from "@/lib/hooks/use-admin";
import { useLeaderboard } from "@/lib/hooks/use-leaderboard";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore, formatDate } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { ADMIN_OVERVIEW } from "@/lib/constants/strings";
import Link from "next/link";

export default function AdminOverviewPage() {
  const { data: fraudFlags, isLoading: fraudLoading } = useFraudFlags();
  const { data: forceEvents, isLoading: forceLoading } = useForceMajeure();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const { data: periods, isLoading: periodsLoading } = useScoringPeriods();
  const { data: cohortHealth, isLoading: cohortLoading } = useCohortHealth();

  const openFraudFlags = fraudFlags?.filter((f) => f.investigation_status === "open") ?? [];
  const activeForceEvents = forceEvents?.filter(
    (e) => new Date(e.end_timestamp) > new Date()
  ) ?? [];
  const currentPeriod = periods?.find((p) => p.status === "open") ?? periods?.[0];
  const entries = leaderboard?.items ?? [];
  const branchCount = entries.length;

  // Platform health metrics
  const scores = entries.map((m) => m.composite_score).filter(Boolean);
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const stdDev = scores.length > 0
    ? Math.sqrt(scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length)
    : 0;
  const flaggedPercent = branchCount > 0 ? ((openFraudFlags.length / branchCount) * 100) : 0;

  const isLoading = fraudLoading || forceLoading || leaderboardLoading || periodsLoading;

  return (
    <div className="space-y-4">
      <PageHeader title={ADMIN_OVERVIEW.TITLE} subtitle={ADMIN_OVERVIEW.SUBTITLE} />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.ACTIVE_BRANCHES}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.ACTIVE_BRANCHES_TIP} />
          </div>
          {leaderboardLoading ? (
            <Skeleton className="h-10 w-20" />
          ) : (
            <span className="font-mono text-4xl font-bold text-foreground">{branchCount}</span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.FRAUD_FLAGS_OPEN}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.FRAUD_FLAGS_OPEN_TIP} />
          </div>
          {fraudLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <span className={cn("font-mono text-4xl font-bold", openFraudFlags.length > 0 ? "text-loss" : "text-gain")}>
              {openFraudFlags.length}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.FORCE_MAJEURE_ACTIVE}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.FORCE_MAJEURE_ACTIVE_TIP} />
          </div>
          {forceLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <span className={cn("font-mono text-4xl font-bold", activeForceEvents.length > 0 ? "text-warning" : "text-gain")}>
              {activeForceEvents.length}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.POOL_THIS_PERIOD}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.POOL_THIS_PERIOD_TIP} />
          </div>
          {periodsLoading ? (
            <Skeleton className="h-10 w-28" />
          ) : (
            <span className="font-mono text-4xl font-bold text-accent">
              {currentPeriod ? formatINR(currentPeriod.pool_amount) : "—"}
            </span>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {ADMIN_OVERVIEW.ACTIVITY_TITLE}
        </h2>
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-6" />
              ))}
            </div>
          ) : (
            <>
              {openFraudFlags.length > 0 && (
                <Link
                  href="/admin/fraud"
                  className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-card-hover transition-colors"
                >
                  <Badge variant="loss">{openFraudFlags.length}</Badge>
                  <span className="text-foreground">{ADMIN_OVERVIEW.FRAUD_FLAGS_NEED_REVIEW}</span>
                </Link>
              )}
              {currentPeriod && (
                <div className="flex items-center gap-2 rounded-md p-2 text-sm">
                  <Badge variant="accent">{currentPeriod.status}</Badge>
                  <span className="text-foreground">
                    Current period: {currentPeriod.period_id} ({formatDate(currentPeriod.period_start)} – {formatDate(currentPeriod.period_end)})
                  </span>
                </div>
              )}
              {activeForceEvents.length > 0 && (
                <Link
                  href="/admin/force-majeure"
                  className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-card-hover transition-colors"
                >
                  <Badge variant="warning">{activeForceEvents.length}</Badge>
                  <span className="text-foreground">{ADMIN_OVERVIEW.FORCE_MAJEURE_EVENTS_ACTIVE}</span>
                </Link>
              )}
              <Link
                href="/admin/payouts"
                className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-card-hover transition-colors"
              >
                <Badge variant="neutral">→</Badge>
                <span className="text-foreground">{ADMIN_OVERVIEW.RUN_PAYOUT_SIM}</span>
              </Link>
            </>
          )}
        </div>
      </Card>

      {/* Platform Health */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.AVG_COMPOSITE_SCORE}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.AVG_COMPOSITE_SCORE_TIP} />
          </div>
          {cohortLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <span className="font-mono text-2xl font-bold text-foreground">
              {formatScore(avgScore)}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.SCORE_STD_DEVIATION}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.SCORE_STD_DEVIATION_TIP} />
          </div>
          {cohortLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <span className="font-mono text-2xl font-bold text-foreground">
              {stdDev.toFixed(1)}
            </span>
          )}
        </Card>

        <Card>
          <div className="mb-1 flex items-center gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {ADMIN_OVERVIEW.FLAGGED_RATE}
            </p>
            <InfoTooltip text={ADMIN_OVERVIEW.FLAGGED_RATE_TIP} />
          </div>
          {isLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span className={cn("font-mono text-2xl font-bold", flaggedPercent > 10 ? "text-loss" : "text-foreground")}>
              {flaggedPercent.toFixed(1)}%
            </span>
          )}
        </Card>
      </div>
    </div>
  );
}
