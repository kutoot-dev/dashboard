"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminBranches, getAdminOverrides, createAdminOverride } from "@/lib/api/services/admin.service";
import { getScoringPeriods } from "@/lib/api/services/scores.service";
import { formatPeriodRange } from "@/lib/utils/format";

export default function ManualOverridesPage() {
  const queryClient = useQueryClient();
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [overrideScore, setOverrideScore] = useState("");
  const [reason, setReason] = useState("");

  const { data: branchesRes, isLoading: branchesLoading } = useQuery({
    queryKey: ["adminBranches"],
    queryFn: async () => {
      const res = await getAdminBranches();
      return res.data ?? [];
    },
  });

  const { data: periodsRes, isLoading: periodsLoading } = useQuery({
    queryKey: ["scoringPeriods"],
    queryFn: async () => {
      const res = await getScoringPeriods();
      return res.data ?? [];
    },
  });

  const { data: overridesRes } = useQuery({
    queryKey: ["adminOverrides"],
    queryFn: async () => {
      const res = await getAdminOverrides();
      return res.data ?? [];
    },
  });

  const branchOptions = useMemo(
    () =>
      (branchesRes ?? []).map((b) => ({
        value: b.branch_id,
        label: `${b.business_name} (${b.branch_id})`,
      })),
    [branchesRes]
  );

  const periodOptions = useMemo(
    () =>
      (periodsRes ?? []).map((p) => ({
        value: p.period_id,
        label: formatPeriodRange(p.period_start, p.period_end),
      })),
    [periodsRes]
  );

  // Set default period when data loads
  useEffect(() => {
    if (periodsRes?.length && !selectedPeriod) {
      setSelectedPeriod(periodsRes[0].period_id);
    }
  }, [periodsRes, selectedPeriod]);

  const overrideMutation = useMutation({
    mutationFn: (payload: { branch_ids: string[]; period_id: string; override_score: number; reason: string }) =>
      createAdminOverride(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOverrides"] });
      setSelectedBranches([]);
      setOverrideScore("");
      setReason("");
    },
  });

  const handleApply = () => {
    if (selectedBranches.length === 0 || !overrideScore || !reason) return;
    overrideMutation.mutate({
      branch_ids: selectedBranches,
      period_id: selectedPeriod,
      override_score: parseFloat(overrideScore),
      reason,
    });
  };

  // Map override history data for the table
  const overrideHistory = (overridesRes ?? []).map((o) => ({
    branch: o.branch_name ?? o.branch_id,
    original_score: o.original_score != null ? Number(o.original_score).toFixed(1) : "—",
    override_score: Number(o.override_score).toFixed(1),
    reason: o.reason,
    applied_by: o.applied_by ?? "Admin",
    date: o.created_at ? new Date(o.created_at).toLocaleDateString("en-IN") : "—",
  }));

  const columns = [
    { key: "branch", header: "Branch" },
    { key: "original_score", header: "Original Score", align: "right" as const },
    { key: "override_score", header: "Override Score", align: "right" as const },
    { key: "reason", header: "Reason" },
    { key: "applied_by", header: "Applied By" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Manual Overrides"
        subtitle="Adjust branch scores for exceptional circumstances"
      >
        <InfoTooltip text="Select one or more branches from the dropdown, choose the scoring period, enter the override score (0–100), and provide a reason. All overrides are logged for audit." />
      </PageHeader>

      {/* Create Override */}
      <Card>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          New Override
        </h2>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              Select Branches
              <InfoTooltip text="Choose one or more branches to apply the same override score. Use search to filter the list." />
            </label>
            <MultiSelect
              options={branchOptions}
              value={selectedBranches}
              onChange={setSelectedBranches}
              placeholder="Search and select branches..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Scoring Period
                <InfoTooltip text="Select the scoring period to apply the override for." />
              </label>
              <Select
                options={periodOptions}
                value={selectedPeriod}
                onChange={setSelectedPeriod}
              />
            </div>
            <div>
              <Input
                label="Override Score (0–100)"
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={overrideScore}
                onChange={(e) => setOverrideScore(e.target.value)}
                placeholder="e.g. 75.5"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Explain why this override is necessary..."
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <Button
            size="sm"
            onClick={handleApply}
            disabled={selectedBranches.length === 0 || !overrideScore || !reason || overrideMutation.isPending}
          >
            {overrideMutation.isPending ? "Applying…" : `Apply Override to ${selectedBranches.length || "…"} Branch${selectedBranches.length !== 1 ? "es" : ""}`}
          </Button>
          {overrideMutation.isError && (
            <p className="text-xs text-red-500">Failed to apply override. Please try again.</p>
          )}
          {overrideMutation.isSuccess && (
            <p className="text-xs text-green-500">Override applied successfully.</p>
          )}
        </div>
      </Card>

      {/* Override History Table */}
      <div>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Override History
        </h2>
        <DataTable columns={columns} data={overrideHistory} />
        {overrideHistory.length === 0 && (
        <Card className="mt-4">
          <EmptyState
            title="No overrides yet"
            description="Manual score overrides will appear here once applied."
          />
        </Card>
        )}
      </div>

      {/* Info Card */}
      <Card className="border-accent/20">
        <div className="flex gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold text-foreground">About Manual Overrides</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Manual overrides allow administrators to adjust branch scores for exceptional
              circumstances not covered by the automated scoring system. Common use cases include
              data migration issues, system errors affecting transaction records, or verified
              disputes. All overrides are logged with the administrator&apos;s identity, timestamp,
              and reasoning for audit purposes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
