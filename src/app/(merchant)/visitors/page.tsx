"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVisitors } from "@/lib/api/services/merchant.service";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/format";
import { TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { DEFAULT_FILTER_DATE_RANGE } from "@/lib/utils/date-range";

export default function VisitorsPage() {
  const { user } = useAuth();
  const branchId = useEffectiveBranchId();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState(DEFAULT_FILTER_DATE_RANGE);

  const filters = useMemo(() => {
    const next: {
      page: number;
      limit: number;
      search?: string;
      from?: string;
      to?: string;
    } = {
      page,
      limit: 20,
    };

    if (search.trim()) next.search = search.trim();
    if (range.start) next.from = range.start;
    if (range.end) next.to = range.end;

    return next;
  }, [page, range.end, range.start, search]);

  const visitorsQuery = useQuery({
    queryKey: ["visitors", branchId, filters],
    queryFn: () => getVisitors(branchId, filters),
    enabled: Boolean(branchId),
    retry: false,
  });

  const rows = visitorsQuery.data?.success ? visitorsQuery.data.data.rows : [];
  const total = visitorsQuery.data?.success ? visitorsQuery.data.data.total : 0;
  const pages = visitorsQuery.data?.success ? visitorsQuery.data.data.pages : 1;
  const showSkeleton = useQuerySkeleton(visitorsQuery);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visitors"
        subtitle="Track repeat customer footfall, spend, and redemption behavior."
      />

      <Card className="space-y-3 overflow-visible">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 w-full flex-1 sm:min-w-[12rem]">
            <Input
              label="Search visitor"
              placeholder="Name or phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <DateRangePicker
            label="Date range"
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
          />
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Visitor list ({total})</p>
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(1, pages)}</p>
        </div>

        {showSkeleton ? (
          <TableRowsSkeleton rows={8} columns={6} minWidth="min-w-[900px]" />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Visitor</th>
                <th className="px-2 py-2">Phone</th>
                <th className="px-2 py-2">Visits</th>
                <th className="px-2 py-2">Last visited</th>
                <th className="px-2 py-2">Total spend</th>
                <th className="px-2 py-2">Redeemed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="px-2 py-3 font-medium text-foreground">{row.name || "Unknown"}</td>
                  <td className="px-2 py-3 text-muted-foreground">{row.phone || "--"}</td>
                  <td className="px-2 py-3 font-mono text-foreground">{row.visit_count}</td>
                  <td className="px-2 py-3 text-xs text-muted-foreground">
                    {row.last_visited ? new Date(row.last_visited).toLocaleString("en-IN") : "--"}
                  </td>
                  <td className="px-2 py-3 font-mono text-foreground">{formatINR(row.total_spend)}</td>
                  <td className="px-2 py-3">
                    <span className={row.redeemed ? "text-gain" : "text-muted-foreground"}>
                      {row.redeemed ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No visitors found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
