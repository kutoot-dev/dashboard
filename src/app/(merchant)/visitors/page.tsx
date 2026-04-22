"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { TransactionChart } from "@/components/charts/transaction-chart";
import { formatINR } from "@/lib/utils/format";
import { getVisitors, type Visitor } from "@/lib/api/services/merchant.service";

const PAGE_SIZE = 20;

function today() { return new Date().toISOString().slice(0, 10); }
function thirtyDaysAgo() { return new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10); }

export default function VisitorsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [from, setFrom] = useState(thirtyDaysAgo());
  const [to, setTo] = useState(today());

  const { data, isLoading } = useQuery({
    queryKey: ["visitors", branchId, page, search, from, to],
    queryFn: () => getVisitors(branchId, { page, limit: PAGE_SIZE, search: search || undefined, from, to }),
    enabled: !!branchId,
    select: (res) => res.data,
  });

  const rows: Visitor[] = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Aggregate visitors by last_visited date for chart
  const visitorChartData = useMemo(() => {
    if (!rows.length) return [];
    const byDate: Record<string, { count: number; amount: number }> = {};
    rows.forEach((row) => {
      const day = row.last_visited
        ? new Date(row.last_visited).toISOString().slice(0, 10)
        : null;
      if (!day) return;
      if (!byDate[day]) byDate[day] = { count: 0, amount: 0 };
      byDate[day].count += 1;
      byDate[day].amount += row.total_spend ?? 0;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, count: v.count, amount: v.amount }));
  }, [rows]);

  const columns = [
    {
      key: "name",
      header: "Customer",
      render: (_: unknown, row: Visitor) => (
        <div>
          <p className="text-xs font-semibold">{row.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.phone}</p>
        </div>
      ),
    },
    {
      key: "visit_count",
      header: "Visits",
      align: "center" as const,
      render: (v: unknown) => (
        <span className="font-mono text-sm font-bold">{v as number}</span>
      ),
    },
    {
      key: "last_visited",
      header: "Last Visited",
      render: (v: unknown) => (
        <span className="font-mono text-xs text-muted-foreground">
          {v ? new Date(v as string).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
        </span>
      ),
    },
    {
      key: "total_spend",
      header: "Total Spend",
      align: "right" as const,
      render: (v: unknown) => <span className="font-mono text-xs font-semibold">{formatINR(v as number)}</span>,
    },
    {
      key: "redeemed",
      header: "Coupon Used",
      align: "center" as const,
      render: (v: unknown) => (
        <Badge variant={v ? "gain" : "neutral"} className="text-[10px]">
          {v ? "Yes" : "No"}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="VISITORS" subtitle={`${total.toLocaleString()} unique customers`} />

      <Card className="p-3">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">From</label>
            <input
              type="date"
              className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none"
              value={from}
              onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">To</label>
            <input
              type="date"
              className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none"
              value={to}
              onChange={(e) => { setTo(e.target.value); setPage(1); }}
            />
          </div>
          <div className="flex gap-2 flex-1 min-w-48">
            <Input
              placeholder="Search by name or phone"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              className="flex-1"
            />
            <Button size="sm" variant="secondary" onClick={() => { setSearch(searchInput); setPage(1); }}>
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Visitor Trend Chart */}
      {rows.length > 0 && visitorChartData.length > 1 && (
        <Card className="p-3">
          <TransactionChart
            data={visitorChartData}
            dataKey="count"
            color="var(--accent)"
            height={180}
            label="Daily Visitors"
          />
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No visitors found" description="Adjust the date range or search term." />
      ) : (
        <Card className="overflow-hidden">
          <DataTable columns={columns as Parameters<typeof DataTable>[0]["columns"]} data={rows as unknown as Record<string, unknown>[]} />
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-3">
              <span className="text-xs text-muted-foreground font-mono">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
