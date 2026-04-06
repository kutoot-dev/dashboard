"use client";

import { useState } from "react";
import { useCohortHealth } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatScore } from "@/lib/utils/format";
import type { CohortHealthMetric } from "@/lib/api/services/admin.service";

function getHealthColor(spread: number): string {
  if (spread <= 10) return "text-gain";
  if (spread <= 25) return "text-warning";
  return "text-loss";
}

function getHealthIndicatorBg(spread: number): string {
  if (spread <= 10) return "bg-gain/20";
  if (spread <= 25) return "bg-warning/20";
  return "bg-loss/20";
}

export default function CohortHealthPage() {
  const [sectorFilter, setSectorFilter] = useState("");
  const { data: cohorts, isLoading } = useCohortHealth(sectorFilter || undefined);

  const sectorOptions = [
    { value: "", label: "All Sectors" },
    ...(cohorts?.map((c) => ({
      value: c.sector_id,
      label: c.sector_name,
    })) ?? []),
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Cohort Health" subtitle="Sector-level performance monitoring">
        <Select
          options={sectorOptions}
          value={sectorFilter}
          onChange={setSectorFilter}
          placeholder="All Sectors"
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rect" className="h-48" />
          ))}
        </div>
      ) : cohorts && cohorts.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cohorts.map((cohort) => {
            const spread = cohort.top_quartile_avg - cohort.bottom_quartile_avg;

            return (
              <Card key={cohort.sector_id} hover className="relative overflow-hidden">
                {/* Health indicator bar */}
                <div className={cn("absolute left-0 top-0 h-1 w-full", getHealthIndicatorBg(spread))} />

                <div className="flex items-start justify-between">
                  <h3 className="font-mono text-sm font-bold text-foreground">{cohort.sector_name}</h3>
                  <span className={cn("font-mono text-xs font-semibold", getHealthColor(spread))}>
                    Δ {spread.toFixed(1)}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Avg Score</p>
                    <p className="font-mono text-xl font-bold text-foreground">{formatScore(cohort.avg_score)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Merchants</p>
                    <p className="font-mono text-xl font-bold text-foreground">{cohort.merchant_count}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Median</p>
                    <p className="font-mono text-sm text-foreground">{formatScore(cohort.median_score)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dormant</p>
                    <p className="font-mono text-sm text-foreground">{cohort.dormant_count}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Top Q Avg</p>
                    <p className="font-mono text-sm text-gain">{formatScore(cohort.top_quartile_avg)}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bottom Q Avg</p>
                    <p className="font-mono text-sm text-loss">{formatScore(cohort.bottom_quartile_avg)}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            title="No cohort data"
            description="Sector cohort health data will appear once scoring periods are calculated."
          />
        </Card>
      )}
    </div>
  );
}
