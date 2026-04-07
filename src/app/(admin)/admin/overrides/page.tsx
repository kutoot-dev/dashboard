"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import { MOCK_SCORING_PERIODS } from "@/lib/mock/scoring-periods";
import { formatPeriodRange } from "@/lib/utils/format";

export default function ManualOverridesPage() {
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(MOCK_SCORING_PERIODS[0]?.period_id ?? "");
  const [overrideScore, setOverrideScore] = useState("");
  const [reason, setReason] = useState("");

  const branchOptions = useMemo(
    () =>
      MOCK_BRANCHES.map((m) => ({
        value: m.branch_id,
        label: `${m.business_name} (${m.branch_id})`,
      })),
    []
  );

  const periodOptions = useMemo(
    () =>
      MOCK_SCORING_PERIODS.map((p) => ({
        value: p.period_id,
        label: formatPeriodRange(p.period_start, p.period_end),
      })),
    []
  );

  const handleApply = () => {
    // TODO: wire to real API
    alert(
      `Override applied:\nBranches: ${selectedBranches.join(", ")}\nPeriod: ${selectedPeriod}\nScore: ${overrideScore}\nReason: ${reason}`
    );
    setSelectedBranches([]);
    setOverrideScore("");
    setReason("");
  };

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
            disabled={selectedBranches.length === 0 || !overrideScore || !reason}
          >
            Apply Override to {selectedBranches.length || "…"} Branch{selectedBranches.length !== 1 ? "es" : ""}
          </Button>
        </div>
      </Card>

      {/* Override History Table */}
      <div>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Override History
        </h2>
        <DataTable columns={columns} data={[]} />
        <Card className="mt-4">
          <EmptyState
            title="No overrides yet"
            description="Manual score overrides will appear here once applied. This feature is under development."
          />
        </Card>
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
