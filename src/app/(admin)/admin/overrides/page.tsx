"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";

export default function ManualOverridesPage() {
  const [search, setSearch] = useState("");

  const columns = [
    { key: "merchant", header: "Merchant" },
    { key: "original_score", header: "Original Score", align: "right" as const },
    { key: "override_score", header: "Override Score", align: "right" as const },
    { key: "reason", header: "Reason" },
    { key: "applied_by", header: "Applied By" },
    { key: "date", header: "Date" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Manual Overrides" subtitle="Adjust merchant scores for exceptional circumstances" />

      {/* Search */}
      <Input
        label="Search merchant by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Enter merchant name..."
      />

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
              Manual overrides allow administrators to adjust merchant scores for exceptional
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
