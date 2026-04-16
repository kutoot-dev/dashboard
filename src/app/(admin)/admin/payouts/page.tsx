"use client";

import { useState, useMemo, useEffect } from "react";
import { usePayoutSimulation } from "@/lib/hooks/use-admin";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { useDateRange, DEFAULT_DATE_RANGE } from "@/lib/hooks/use-date-range";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { AreaChart } from "@/components/charts/area-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR, formatScore, formatPeriodRange } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { getPayoutRecords, markPayoutPaid } from "@/lib/api/services/admin.service";
import { getScoringPeriods } from "@/lib/api/services/scores.service";
import type { PayoutSimulationResult, PayoutSimulationEntry, PayoutRecord } from "@/lib/api/services/admin.service";

type Row = Record<string, unknown>;

export default function PayoutSimulationPage() {
  const queryClient = useQueryClient();
  const { data: periods } = useScoringPeriods();
  const simulationMutation = usePayoutSimulation();

  const { dateRange, setDateRange } = useDateRange(DEFAULT_DATE_RANGE);
  const [poolAmount, setPoolAmount] = useState("500000");
  const [alpha, setAlpha] = useState("1.8");
  const [threshold, setThreshold] = useState("50");
  const [activeView, setActiveView] = useState<"simulation" | "management">("management");
  const [selectedPayoutPeriod, setSelectedPayoutPeriod] = useState("");
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<string[]>([]);

  // Payout records from backend
  const { data: payoutRecords, isLoading: payoutsLoading } = useQuery({
    queryKey: ["payoutRecords", selectedPayoutPeriod],
    queryFn: async () => {
      const res = await getPayoutRecords(selectedPayoutPeriod || undefined);
      return (res.data ?? []) as PayoutRecord[];
    },
  });

  const { data: periodsForSelect } = useQuery({
    queryKey: ["scoringPeriodsForPayouts"],
    queryFn: async () => {
      const res = await getScoringPeriods();
      return res.data ?? [];
    },
  });

  const periodSelectOptions = useMemo(
    () => [
      { value: "", label: "All Periods" },
      ...(periodsForSelect ?? []).map((p) => ({
        value: p.period_id,
        label: formatPeriodRange(p.period_start, p.period_end),
      })),
    ],
    [periodsForSelect]
  );

  // Set default period
  useEffect(() => {
    if (periodsForSelect?.length && !selectedPayoutPeriod) {
      setSelectedPayoutPeriod(periodsForSelect[0].period_id);
    }
  }, [periodsForSelect, selectedPayoutPeriod]);

  const markPaidMutation = useMutation({
    mutationFn: (ids: string[]) => markPayoutPaid(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payoutRecords"] });
      setSelectedPayoutIds([]);
    },
  });

  const handleToggleSelect = (id: string) => {
    setSelectedPayoutIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllAllocated = () => {
    const allocatedIds = (payoutRecords ?? []).filter((p) => p.status === "allocated").map((p) => p.id);
    setSelectedPayoutIds(allocatedIds);
  };

  const handleMarkPaid = () => {
    if (selectedPayoutIds.length === 0) return;
    markPaidMutation.mutate(selectedPayoutIds);
  };

  // Stats
  const totalAllocated = (payoutRecords ?? []).reduce((sum, p) => sum + p.allocated_amount, 0);
  const paidCount = (payoutRecords ?? []).filter((p) => p.status === "paid").length;
  const allocatedCount = (payoutRecords ?? []).filter((p) => p.status === "allocated").length;
  const paidAmount = (payoutRecords ?? []).filter((p) => p.status === "paid").reduce((sum, p) => sum + p.allocated_amount, 0);

  // Find the latest closed period within the selected date range
  const resolvedPeriodId = useMemo(() => {
    if (!periods) return undefined;
    const rangeStart = dateRange.start ? new Date(`${dateRange.start}T00:00:00Z`) : new Date(0);
    const rangeEnd = dateRange.end ? new Date(`${dateRange.end}T23:59:59Z`) : new Date();
    const inRange = periods
      .filter((p) => {
        const pStart = new Date(p.period_start);
        const pEnd = new Date(p.period_end);
        return p.status === "closed" && pStart <= rangeEnd && pEnd >= rangeStart;
      })
      .sort((a, b) => b.period_start.localeCompare(a.period_start));
    return inRange[0]?.period_id ?? periods.find((p) => p.status === "closed")?.period_id;
  }, [periods, dateRange]);

  const handleRunSimulation = () => {
    if (!resolvedPeriodId) return;
    simulationMutation.mutate({
      periodId: resolvedPeriodId,
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
      header: "Branch",
      render: (_: unknown, row: Row) => (
        <span className="text-sm text-foreground">{String(row.business_name ?? row.branch_id ?? "—")}</span>
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

  const payoutMgmtColumns = [
    {
      key: "select",
      header: "",
      render: (_: unknown, row: Row) =>
        (row as unknown as PayoutRecord).status === "allocated" ? (
          <input
            type="checkbox"
            checked={selectedPayoutIds.includes((row as unknown as PayoutRecord).id)}
            onChange={() => handleToggleSelect((row as unknown as PayoutRecord).id)}
            className="h-4 w-4 rounded border-border accent-accent"
          />
        ) : null,
    },
    {
      key: "branch_name",
      header: "Merchant / Branch",
      render: (_: unknown, row: Row) => {
        const r = row as unknown as PayoutRecord;
        return (
          <div>
            <span className="text-sm font-medium text-foreground">{r.branch_name}</span>
            {r.ho_name && <span className="ml-2 text-xs text-muted-foreground">({r.ho_name})</span>}
          </div>
        );
      },
    },
    {
      key: "allocated_amount",
      header: "Allocated",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-sm font-bold text-foreground">{formatINR((row as unknown as PayoutRecord).allocated_amount)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (_: unknown, row: Row) => {
        const r = row as unknown as PayoutRecord;
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              r.status === "paid"
                ? "bg-gain/10 text-gain"
                : "bg-yellow-500/10 text-yellow-500"
            )}
          >
            {r.status === "paid" ? "✓ Paid" : "Pending"}
          </span>
        );
      },
    },
    {
      key: "paid_at",
      header: "Paid On",
      render: (_: unknown, row: Row) => {
        const r = row as unknown as PayoutRecord;
        return r.paid_at ? (
          <span className="text-xs text-muted-foreground">{new Date(r.paid_at).toLocaleDateString("en-IN")}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Payouts" subtitle="Manage merchant payouts and simulate distributions">
        <InfoTooltip text="View allocated payout amounts per merchant, mark payouts as paid, or simulate new distributions." />
      </PageHeader>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant={activeView === "management" ? "primary" : "ghost"}
          onClick={() => setActiveView("management")}
        >
          Payout Management
        </Button>
        <Button
          size="sm"
          variant={activeView === "simulation" ? "primary" : "ghost"}
          onClick={() => setActiveView("simulation")}
        >
          Simulation
        </Button>
      </div>

      {/* ── Payout Management View ── */}
      {activeView === "management" && (
        <>
          {/* Period Selector & Summary */}
          <Card>
            <div className="flex flex-wrap items-end gap-4">
              <div className="w-64">
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Scoring Period</label>
                <Select
                  options={periodSelectOptions}
                  value={selectedPayoutPeriod}
                  onChange={setSelectedPayoutPeriod}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={handleSelectAllAllocated} disabled={allocatedCount === 0}>
                  Select All Pending ({allocatedCount})
                </Button>
                <Button
                  size="sm"
                  onClick={handleMarkPaid}
                  disabled={selectedPayoutIds.length === 0 || markPaidMutation.isPending}
                >
                  {markPaidMutation.isPending ? "Marking…" : `Mark ${selectedPayoutIds.length} as Paid`}
                </Button>
              </div>
            </div>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Total Allocated</p>
              <span className="font-mono text-2xl font-bold text-accent">{formatINR(totalAllocated)}</span>
            </Card>
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Paid Out</p>
              <span className="font-mono text-2xl font-bold text-gain">{formatINR(paidAmount)}</span>
            </Card>
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pending</p>
              <span className="font-mono text-2xl font-bold text-yellow-500">{allocatedCount}</span>
            </Card>
            <Card>
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Paid</p>
              <span className="font-mono text-2xl font-bold text-gain">{paidCount}</span>
            </Card>
          </div>

          {/* Payout Table */}
          {payoutsLoading ? (
            <Skeleton variant="rect" className="h-[300px]" />
          ) : (payoutRecords ?? []).length > 0 ? (
            <div>
              <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Merchant Payouts ({(payoutRecords ?? []).length})
              </h2>
              <DataTable columns={payoutMgmtColumns} data={(payoutRecords ?? []) as unknown as Row[]} />
            </div>
          ) : (
            <Card>
              <EmptyState title="No payouts" description="No payout records found for the selected period." />
            </Card>
          )}
        </>
      )}

      {/* ── Simulation View ── */}
      {activeView === "simulation" && (
        <>
          {/* Controls */}
          <Card>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Simulation Controls
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date Range</label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
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
            disabled={!resolvedPeriodId}
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
        </>
      )}
    </div>
  );
}
