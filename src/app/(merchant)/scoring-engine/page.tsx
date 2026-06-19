"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getScoringEngineOverview } from "@/lib/api/services/scoring-engine.service";
import { ScoringEngineFlowchart } from "@/components/scoring-engine/scoring-engine-flowchart";
import { ScoringEngineConfig } from "@/components/scoring-engine/scoring-engine-config";
import { ScoringEngineCommands } from "@/components/scoring-engine/scoring-engine-commands";
import { ScoringEngineFormulaGuide } from "@/components/scoring-engine/scoring-engine-formula-guide";
import { ScoringEngineSchedule } from "@/components/scoring-engine/scoring-engine-schedule";
import { canAccessScoringEngine } from "@/lib/utils/scoring-engine-access";
import { formatINRDecimal } from "@/lib/utils/format";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";

function formatRank(rank: number | null | undefined) {
  return typeof rank === "number" ? `#${rank}` : "—";
}

export default function ScoringEnginePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const scoringEngineEnabled = canAccessScoringEngine(user);

  useEffect(() => {
    if (!authLoading && user && !scoringEngineEnabled) {
      router.replace("/dashboard");
    }
  }, [authLoading, user, scoringEngineEnabled, router]);

  const overviewQuery = useQuery({
    queryKey: ["scoring-engine"],
    queryFn: getScoringEngineOverview,
    enabled: scoringEngineEnabled,
    refetchInterval: 60_000,
  });

  const showSkeleton = useQuerySkeleton(overviewQuery);
  const data = overviewQuery.data?.success ? overviewQuery.data.data : null;

  if (authLoading || (!scoringEngineEnabled && user)) {
    return (
      <main className="flex min-h-[40vh] items-center justify-center">
        <p className="font-mono text-xs text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (!scoringEngineEnabled) {
    return null;
  }

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Score & Payout Lab"
        subtitle="Demo only — live configuration from scoring_parameters, run scoring/payout jobs, and inspect today's pool."
      />

      {showSkeleton || !data ? (
        <StatCardsSkeleton count={4} />
      ) : (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                label: "Today's bonus pool",
                value: formatINRDecimal(data.today.pool),
                hint: `${data.today.txn_count} txns · ${formatINRDecimal(data.today.accumulated_net)} kutoot net`,
              },
              {
                label: "Your projected share",
                value: formatINRDecimal(data.today.your_share),
                hint: `Live rank ${formatRank(data.today.live_rank)} · composite ${data.today.live_composite?.toFixed(4) ?? "—"}`,
              },
              {
                label: "Projected distributed",
                value: formatINRDecimal(data.today.projected_distributed),
                hint: data.today.projected_distributed < data.today.pool ? "Pool leftover possible" : "Full pool allocated",
              },
              {
                label: "Live composite",
                value: data.today.live_composite?.toFixed(4) ?? "—",
                hint: data.today.last_updated_at
                  ? `Updated ${new Date(data.today.last_updated_at).toLocaleTimeString()}`
                  : "—",
              },
            ].map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 font-mono text-xl font-semibold text-foreground">{stat.value}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">{stat.hint}</p>
              </Card>
            ))}
          </section>

          <Card className="p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-accent">
                Flow
              </h2>
              <Badge variant="accent" className="font-mono text-[10px]">
                DB-driven
              </Badge>
            </div>
            <div className="mt-4">
              <ScoringEngineFlowchart rules={data.payout_rules} />
            </div>
          </Card>

          <ScoringEngineSchedule
            schedule={data.schedule}
            allowedCommands={data.allowed_commands}
          />

          <div className="grid gap-6 xl:grid-cols-2">
            <ScoringEngineCommands defaultDate={data.today.date} />

            <div className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-secondary">
                    Projected payouts today (all branches)
                  </h3>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {data.today.active_branch_count} active · pool {formatINRDecimal(data.today.pool)}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Live estimate using the same rules as payouts:distribute-daily. ₹0 share means
                  below min score or zero composite weight.
                </p>
                <div className="mt-3 max-h-[420px] overflow-auto">
                  <table className="w-full min-w-[400px] font-mono text-[11px]">
                    <thead className="sticky top-0 bg-card">
                      <tr className="border-b border-glass-border text-left text-muted-foreground">
                        <th className="py-2 pr-2">Rank</th>
                        <th className="py-2 pr-2">Merchant / branch</th>
                        <th className="py-2 pr-2 text-right">Score</th>
                        <th className="py-2 pr-2 text-right">% pool</th>
                        <th className="py-2 text-right">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.projection_all ?? data.projection_top).map((row) => (
                        <tr key={row.branch_id} className="border-b border-glass-border/50">
                          <td className="py-2 pr-2 text-accent">{formatRank(row.live_rank)}</td>
                          <td className="py-2 pr-2 max-w-[180px]">
                            <p className="truncate text-foreground">
                              {row.merchant_name ?? "—"}
                              {row.branch_id === data.branch.id ? (
                                <span className="ml-1 text-gain">(you)</span>
                              ) : null}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {row.branch_name}
                            </p>
                          </td>
                          <td className="py-2 pr-2 text-right text-muted-foreground">
                            {row.composite.toFixed(4)}
                          </td>
                          <td className="py-2 pr-2 text-right text-muted-foreground">
                            {row.pool_pct > 0 ? `${row.pool_pct.toFixed(1)}%` : "—"}
                          </td>
                          <td className="py-2 text-right font-semibold text-gain">
                            {formatINRDecimal(row.projected_share)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent settled periods
                </h3>
                <ul className="mt-3 space-y-2">
                  {data.recent_periods.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-glass-border bg-glass-bg/40 px-3 py-2 font-mono text-[11px]"
                    >
                      <span className="text-foreground">{p.date}</span>
                      <span className="text-muted-foreground">{p.status}</span>
                      <span className="text-gain">{formatINRDecimal(p.pool_amount)}</span>
                      <span className="text-muted-foreground">{p.payout_count} branches</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ScoringEngineFormulaGuide
              weights={data.config.weights}
              payoutRules={data.payout_rules}
            />
            <ScoringEngineConfig config={data.config} payoutRules={data.payout_rules} />
          </div>
        </>
      )}

      {overviewQuery.isError ? (
        <Card className="border-loss/40 bg-loss/10 p-4">
          <p className="text-sm text-loss">
            Could not load scoring engine data. Use the demo merchant or demo-ops hub account.
          </p>
        </Card>
      ) : null}
    </div>
  );
}
