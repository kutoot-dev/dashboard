"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/ui/data-table";
import { TransactionChart } from "@/components/charts/transaction-chart";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import { getTransactions, type Transaction } from "@/lib/api/services/merchant.service";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function today() { return new Date().toISOString().slice(0, 10); }
function thirtyDaysAgo() { return new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10); }

function txnStatusVariant(status: string): "gain" | "loss" | "neutral" {
  if (["paid", "completed"].includes(status)) return "gain";
  if (["failed", "refunded"].includes(status)) return "loss";
  return "neutral";
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [from, setFrom] = useState(thirtyDaysAgo());
  const [to, setTo] = useState(today());

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", branchId, page, status, search, from, to],
    queryFn: () => getTransactions(branchId, { page, limit: PAGE_SIZE, status: status || undefined, search: search || undefined, from, to }),
    enabled: !!branchId,
    select: (res) => res.data,
  });

  const rows: Transaction[] = data?.rows ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;

  // Aggregate transactions by date for chart
  const chartData = useMemo(() => {
    if (!rows.length) return [];
    const byDate: Record<string, { count: number; amount: number }> = {};
    rows.forEach((row) => {
      const day = new Date(row.created_at).toISOString().slice(0, 10);
      if (!byDate[day]) byDate[day] = { count: 0, amount: 0 };
      byDate[day].count += 1;
      byDate[day].amount += row.bill_amount ?? 0;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({ date, count: v.count, amount: v.amount }));
  }, [rows]);

  const [chartKey, setChartKey] = useState<"count" | "amount">("count");

  const columns = [
    {
      key: "created_at",
      header: "Date",
      render: (_: unknown, row: Transaction) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "2-digit" })}
        </span>
      ),
    },
    {
      key: "customer_name",
      header: "Customer",
      render: (_: unknown, row: Transaction) => (
        <div>
          <p className="text-xs font-semibold">{row.customer_name ?? "—"}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.customer_phone ?? ""}</p>
        </div>
      ),
    },
    {
      key: "bill_amount",
      header: "Bill",
      align: "right" as const,
      render: (v: unknown) => <span className="font-mono text-xs">{formatINR(v as number)}</span>,
    },
    {
      key: "discount",
      header: "Discount",
      align: "right" as const,
      render: (v: unknown) => <span className="font-mono text-xs text-primary">{v ? `- ${formatINR(v as number)}` : "—"}</span>,
    },
    {
      key: "total_paid",
      header: "Paid",
      align: "right" as const,
      render: (v: unknown) => <span className="font-mono text-sm font-bold">{formatINR(v as number)}</span>,
    },
    {
      key: "coupon_code",
      header: "Coupon",
      render: (v: unknown) => v ? <Badge variant="neutral" className="text-[10px]">{v as string}</Badge> : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (v: unknown) => <Badge variant={txnStatusVariant(v as string)} className="uppercase text-[10px]">{v as string}</Badge>,
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="TRANSACTIONS" subtitle={`${total.toLocaleString()} total transactions`} />

      {/* Filters */}
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
          <Select
            options={STATUS_OPTIONS}
            value={status}
            onChange={(v) => { setStatus(v); setPage(1); }}
            className="w-36"
          />
          <div className="flex gap-2 flex-1 min-w-48">
            <Input
              placeholder="Search customer name / phone"
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

      {/* Transaction Chart */}
      {rows.length > 0 && chartData.length > 1 && (
        <Card className="p-3">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Transaction Trend
            </h3>
            <div className="flex gap-1 rounded-lg border border-glass-border p-0.5">
              {(["count", "amount"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setChartKey(k)}
                  className={cn(
                    "rounded-md px-2.5 py-1 font-mono text-[10px] uppercase transition-all",
                    chartKey === k
                      ? "bg-accent/10 text-accent"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {k === "count" ? "# Count" : "₹ Amount"}
                </button>
              ))}
            </div>
          </div>
          <TransactionChart
            data={chartData}
            dataKey={chartKey}
            color={chartKey === "count" ? "var(--accent)" : "var(--gain)"}
            height={180}
          />
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-md" />)}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState title="No transactions found" description="Try adjusting the date range or filters." />
      ) : (
        <Card className="overflow-hidden">
          <DataTable columns={columns as Parameters<typeof DataTable>[0]["columns"]} data={rows as unknown as Record<string, unknown>[]} />
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-border p-3">
              <span className="text-xs text-muted-foreground font-mono">
                Page {page} of {pages}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
