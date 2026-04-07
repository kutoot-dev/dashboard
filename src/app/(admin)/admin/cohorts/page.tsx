"use client";

import { useState, useMemo } from "react";
import { useCohortHealth } from "@/lib/hooks/use-admin";
import { useScoringPeriods } from "@/lib/hooks/use-scores";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { cn } from "@/lib/utils/cn";
import { formatScore, formatPeriodRange } from "@/lib/utils/format";
import { COHORT_HEALTH_INFO } from "@/lib/constants/scoring";
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
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const { data: cohorts, isLoading } = useCohortHealth(sectorFilter || undefined);
  const { data: periods } = useScoringPeriods();

  const { minDate, maxDate } = useMemo(() => {
    if (!periods || periods.length === 0) return { minDate: "", maxDate: "" };
    const sorted = [...periods].sort(
      (a, b) => new Date(a.period_start).getTime() - new Date(b.period_start).getTime()
    );
    return {
      minDate: sorted[0]?.period_start?.split("T")[0] ?? "",
      maxDate: sorted[sorted.length - 1]?.period_end?.split("T")[0] ?? "",
    };
  }, [periods]);

  // Set default date range to latest period
  const defaultDateRange = useMemo(() => {
    if (!periods || periods.length === 0) return { start: "", end: "" };
    const latest = periods[periods.length - 1];
    return {
      start: latest.period_start.split("T")[0],
      end: latest.period_end.split("T")[0],
    };
  }, [periods]);

  const activeRange = dateRange.start && dateRange.end ? dateRange : defaultDateRange;

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
        <InfoTooltip text={COHORT_HEALTH_INFO.concept} />
        <DateRangePicker
          value={activeRange}
          onChange={setDateRange}
          min={minDate}
          max={maxDate}
          placeholder="Select date range"
        />
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
                  <div className="flex items-center gap-1.5">
                    <span className={cn("font-mono text-xs font-semibold", getHealthColor(spread))}>
                      Δ {spread.toFixed(1)}
                    </span>
                    <InfoTooltip text={COHORT_HEALTH_INFO.spread} />
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Avg Score</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.avg_score} />
                    </div>
                    <p className="font-mono text-xl font-bold text-foreground">{formatScore(cohort.avg_score)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Merchants</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.merchant_count} />
                    </div>
                    <p className="font-mono text-xl font-bold text-foreground">{cohort.merchant_count}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Median</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.median_score} />
                    </div>
                    <p className="font-mono text-sm text-foreground">{formatScore(cohort.median_score)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dormant</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.dormant_count} />
                    </div>
                    <p className="font-mono text-sm text-foreground">{cohort.dormant_count}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Top Q Avg</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.top_quartile_avg} />
                    </div>
                    <p className="font-mono text-sm text-gain">{formatScore(cohort.top_quartile_avg)}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Bottom Q Avg</p>
                      <InfoTooltip text={COHORT_HEALTH_INFO.metrics.bottom_quartile_avg} />
                    </div>
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
