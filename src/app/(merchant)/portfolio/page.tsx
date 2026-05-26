"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useSelectedLocationStore } from "@/lib/stores/selected-location.store";
import {
  getOpsHubLocations,
  getOpsHubMe,
  getOpsHubSummary,
  type OpsHubLocationRow,
} from "@/lib/api/services/ops-hub.service";
import { formatINR } from "@/lib/utils/format";
import type { DateRange } from "@/lib/hooks/use-date-range";

function defaultRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function PortfolioPage() {
  const router = useRouter();
  const { user } = useAuth();
  const setSelectedLocationId = useSelectedLocationStore((s) => s.setSelectedLocationId);
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const filters = useMemo(
    () => ({
      from: range.from,
      to: range.to,
      search: search.trim() || undefined,
      merchant_category_id: categoryId ? Number(categoryId) : undefined,
    }),
    [range, search, categoryId],
  );

  const meQuery = useQuery({
    queryKey: ["ops-hub-me"],
    queryFn: getOpsHubMe,
    enabled: user?.role === "operations_hub",
  });

  const summaryQuery = useQuery({
    queryKey: ["ops-hub-summary", filters],
    queryFn: () => getOpsHubSummary(filters),
    enabled: user?.role === "operations_hub",
  });

  const locationsQuery = useQuery({
    queryKey: ["ops-hub-locations", filters],
    queryFn: () => getOpsHubLocations(filters),
    enabled: user?.role === "operations_hub",
  });

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const loc of user?.attached_locations ?? []) {
      if (loc.merchant_category_id) {
        seen.set(String(loc.merchant_category_id), loc.category ?? `Category ${loc.merchant_category_id}`);
      }
    }
    return [{ value: "", label: "All categories" }, ...Array.from(seen.entries()).map(([v, l]) => ({ value: v, label: l }))];
  }, [user?.attached_locations]);

  if (user?.role !== "operations_hub") {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Portfolio is available for operations hub accounts only.</p>
      </div>
    );
  }

  const plan = meQuery.data?.data?.plan;
  const summary = summaryQuery.data?.data;
  const rows: OpsHubLocationRow[] = locationsQuery.data?.data?.data ?? [];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <PageHeader title="Portfolio" subtitle="All merchant locations attached to your operations hub" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Your plan</h2>
          {plan?.has_plan ? (
            <div className="mt-2 space-y-1 text-sm">
              <p className="text-lg font-semibold">{plan.plan_name}</p>
              <p>Hub share: {plan.commission_share_percentage}% of commission</p>
              <p>
                Locations: {plan.active_locations}
                {plan.max_merchant_locations != null ? ` / ${plan.max_merchant_locations}` : " (unlimited)"}
              </p>
              {plan.category_restriction_enabled && plan.category_usage?.length ? (
                <ul className="mt-2 list-disc pl-4 text-muted-foreground">
                  {plan.category_usage.map((c) => (
                    <li key={c.merchant_category_id}>
                      {c.category_name}: {c.used}/{c.max_locations} used
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">No active plan assigned.</p>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Period totals</h2>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground">Commission</p>
              <p className="font-semibold">{formatINR(summary?.total_commission ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Your hub share</p>
              <p className="font-semibold">{formatINR(summary?.total_hub_share ?? 0)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transactions</p>
              <p className="font-semibold">{summary?.transaction_count ?? 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg rank</p>
              <p className="font-semibold">{summary?.average_rank ?? "—"}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-end gap-3">
          <DateRangePicker value={range} onChange={setRange} label="Date range" />
          <Select
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryOptions}
          />
          <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Store name" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-2 pr-4">Store</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Rank</th>
                <th className="py-2 pr-4">Txns</th>
                <th className="py-2 pr-4">Commission</th>
                <th className="py-2 pr-4">Hub share</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.location_id}
                  className="cursor-pointer border-b border-border/60 hover:bg-card/60"
                  onClick={() => {
                    setSelectedLocationId(String(row.location_id));
                    router.push("/dashboard");
                  }}
                >
                  <td className="py-3 pr-4 font-medium">{row.branch_name}</td>
                  <td className="py-3 pr-4">{row.category ?? "—"}</td>
                  <td className="py-3 pr-4">
                    {row.current_rank ?? "—"}
                    {row.rank_movement != null && row.rank_movement !== 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({row.rank_movement > 0 ? "+" : ""}
                        {row.rank_movement})
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">{row.transaction_count}</td>
                  <td className="py-3 pr-4">{formatINR(row.total_commission)}</td>
                  <td className="py-3 pr-4">{formatINR(row.hub_share_earned)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !locationsQuery.isLoading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No locations match your filters.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
