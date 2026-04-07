"use client";

import { useState } from "react";
import { usePayoutSimulation } from "@/lib/hooks/use-admin";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AreaChart } from "@/components/charts/area-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore, formatPeriodRange } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { PayoutSimulationResult, PayoutSimulationEntry } from "@/lib/api/services/admin.service";

type Row = Record<string, unknown>;

export default function PayoutSimulationPage() {
  const { data: periods, isLoading: periodsLoading } = useScoringPeriods();
  const simulationMutation = usePayoutSimulation();

  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [poolAmount, setPoolAmount] = useState("500000");
  const [alpha, setAlpha] = useState("1.8");
  const [threshold, setThreshold] = useState("50");

  const periodOptions = (periods ?? []).map((p) => ({
    value: p.period_id,
    label: formatPeriodRange(p.period_start, p.period_end),
  }));

  const handleRunSimulation = () => {
    const periodId = selectedPeriod || periods?.[0]?.period_id;
    if (!periodId) return;
    simulationMutation.mutate({
      periodId,
      params: {
        pool_override: parseFloat(poolAmount) || undefined,
        top_n: 20,
      },
    });
  };

  const results = simulationMutation.data?.data as PayoutSimulationResult | undefined;
  const payouts = results?.entries ?? [];
  const totalPool = results?.pool_amount ?? 0;
  const qualifiedCount = payouts.length;
  const minPayout = parseFloat(threshold);

  // Build distribution chart data
  const chartData = payouts.map((p, i) => ({
    time: `2026-01-${String(i + 1).padStart(2, "0")}`,
    value: p.payout_amount,
  }));

  const resultColumns = [
    {
      key: "rank",
      header: "#",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs font-bold text-foreground">{String(row.rank)}</span>
      ),
    },
    {
      key: "business_name",
      header: "Merchant",
      render: (_: unknown, row: Row) => (
        <span className="text-sm text-foreground">{String(row.business_name ?? row.merchant_id ?? "—")}</span>
      ),
    },
    {
      key: "composite_score",
      header: "Score",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-sm text-foreground">{formatScore(Number(row.composite_score ?? 0))}</span>
      ),
    },
    {
      key: "payout_amount",
      header: "Payout",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-sm font-bold text-gain">{formatINR(Number(row.payout_amount ?? 0))}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Payout Simulation" subtitle="Model payout distributions before committing">
        <InfoTooltip text="Simulate how the reward pool would be distributed among merchants for a specific period. Adjust the pool amount, power-law alpha, and minimum threshold to see projected payouts before committing." />
      </PageHeader>

      {/* Controls */}
      <Card>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Simulation Controls
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Period</label>
            {periodsLoading ? (
              <Skeleton className="h-9" />
            ) : (
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                placeholder="Select period"
              />
            )}
          </div>
          <Input
            label="Pool Amount (₹)"
            type="number"
            value={poolAmount}
            onChange={(e) => setPoolAmount(e.target.value)}
          />
          <Input
            label="Alpha (power-law)"
            type="number"
            step="0.1"
            value={alpha}
            onChange={(e) => setAlpha(e.target.value)}
          />
          <Input
            label="Min Threshold (₹)"
            type="number"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleRunSimulation}
            loading={simulationMutation.isPending}
            disabled={!periods?.length}
          >
            Run Simulation
          </Button>
        </div>
      </Card>

      {/* Results */}
      {simulationMutation.isPending && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rect" className="h-24" />
            ))}
          </div>
          <Skeleton variant="rect" className="h-[200px]" />
        </div>
      )}

      {results && !simulationMutation.isPending && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Total Pool
              </p>
              <span className="font-mono text-3xl font-bold text-accent">{formatINR(totalPool)}</span>
            </Card>
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Qualified Merchants
              </p>
              <span className="font-mono text-3xl font-bold text-foreground">{qualifiedCount}</span>
            </Card>
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Min Payout
              </p>
              <span className="font-mono text-3xl font-bold text-muted-foreground">{formatINR(minPayout)}</span>
            </Card>
          </div>

          {/* Distribution Chart */}
          {chartData.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 pb-0">
                <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Payout Distribution
                </h2>
              </div>
              <AreaChart data={chartData} height={200} />
            </Card>
          )}

          {/* Payout Table */}
          {payouts.length > 0 ? (
            <div>
              <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Top {payouts.length} Payouts
              </h2>
              <DataTable columns={resultColumns} data={payouts as unknown as Row[]} />
            </div>
          ) : (
            <Card>
              <EmptyState title="No payouts" description="No merchants qualified for payout in this simulation." />
            </Card>
          )}
        </>
      )}

      {!results && !simulationMutation.isPending && (
        <Card>
          <EmptyState
            title="Run a simulation"
            description="Configure the parameters above and click Run Simulation to see projected payout distributions."
          />
        </Card>
      )}
    </div>
  );
}
