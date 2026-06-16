"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getBranchPayoutGuide } from "@/lib/api/services/branches.service";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PAYOUTS } from "@/lib/constants/strings";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function formatGeneratedAt(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PayoutGuideContent() {
  const branchId = useEffectiveBranchId();

  const guideQuery = useQuery({
    queryKey: ["branch-payout-guide", branchId],
    queryFn: () => getBranchPayoutGuide(branchId),
    enabled: Boolean(branchId),
    retry: false,
  });

  const payload = guideQuery.data?.success ? guideQuery.data.data : null;
  const guide = payload?.guide;

  if (guideQuery.isLoading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-muted/30" />;
  }

  if (!guide) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Unable to load payout documentation right now.
      </Card>
    );
  }

  const allocation = guide.allocation;
  const pool = guide.pool;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge variant={payload?.is_payout_eligible ? "gain" : "warning"}>
          {payload?.is_payout_eligible ? PAYOUTS.GUIDE_ELIGIBLE : PAYOUTS.GUIDE_NOT_ELIGIBLE}
        </Badge>
        <p className="text-xs text-muted-foreground">
          {PAYOUTS.GUIDE_REFRESHED}: {formatGeneratedAt(guide.generated_at)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Min score</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            {allocation.min_score_threshold.toFixed(2)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Max branch share</p>
          <p className="mt-1 font-mono text-2xl font-semibold">
            {allocation.max_single_branch_share_percent}%
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Today&apos;s pool</p>
          <p className="mt-1 font-mono text-2xl font-semibold">{formatINR(pool.today_projected_pool)}</p>
        </Card>
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold">{PAYOUTS.GUIDE_SCHEDULE}</h2>
        <div className="space-y-3">
          {guide.schedule.map((row) => (
            <div key={row.command} className="rounded-xl border border-border/60 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="neutral">{row.time}</Badge>
                <code className="text-xs text-muted-foreground">{row.command}</code>
              </div>
              <p className="mt-2 text-muted-foreground">{row.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold">{PAYOUTS.GUIDE_POOL}</h2>
        <p className="text-sm text-muted-foreground">{pool.formula}</p>
        <dl className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Payout wallet</dt>
            <dd className="font-medium">{pool.payout_wallet_name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Pool allocation</dt>
            <dd className="font-medium">
              {pool.payout_wallet_share_percentage != null
                ? `${pool.payout_wallet_share_percentage.toFixed(2)}%`
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Today Kutoot net</dt>
            <dd className="font-mono">{formatINR(pool.today_accumulated_net)}</dd>
          </div>
        </dl>
        {pool.fallback ? (
          <p className="rounded-xl bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{pool.fallback}</p>
        ) : null}
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold">{PAYOUTS.GUIDE_ELIGIBILITY}</h2>
        <p className="text-sm text-muted-foreground">{guide.eligibility.summary}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {guide.eligibility.requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {guide.eligibility.note ? (
          <p className="text-xs text-muted-foreground">{guide.eligibility.note}</p>
        ) : null}
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold">{PAYOUTS.GUIDE_ALLOCATION}</h2>
        <p className="font-mono text-sm">{allocation.formula}</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Approved or active branches with composite score ≥
            {allocation.min_score_threshold.toFixed(2)} enter the weighted split.
          </li>
          <li>Raw share = (your score ÷ sum of eligible scores) × daily pool.</li>
          <li>
            Cap applied: min(raw share, pool × {allocation.max_single_branch_share.toFixed(2)}).
          </li>
        </ol>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {allocation.fallbacks.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold">{PAYOUTS.GUIDE_PARAMETERS}</h2>
        <div className="space-y-3">
          {guide.parameters.map((param) => (
            <div
              key={param.key}
              className={cn("rounded-xl border border-border/60 p-3 text-sm")}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{param.label}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {typeof param.value === "number" ? param.value.toFixed(4) : param.value} {param.unit}
                </p>
              </div>
              <p className="mt-1 text-muted-foreground">{param.description}</p>
            </div>
          ))}
        </div>
      </Card>

      <div>
        <Link
          href="/payouts"
          className="inline-flex h-9 items-center justify-center rounded-xl border border-accent/30 px-4 text-sm font-semibold text-foreground transition-colors hover:bg-accent/10"
        >
          {PAYOUTS.GUIDE_VIEW_BONUS}
        </Link>
      </div>
    </div>
  );
}
