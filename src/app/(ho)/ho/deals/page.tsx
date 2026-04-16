"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { formatINR } from "@/lib/utils/format";
import { getHoDeals, type Deal } from "@/lib/api/services/merchant.service";

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

function statusVariant(status: string): "gain" | "loss" | "neutral" | "warning" {
  if (status === "approved") return "gain";
  if (status === "rejected") return "loss";
  if (status === "pending") return "neutral";
  return "warning";
}

export default function HoDealsPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["ho-deals", hoId, page, statusFilter],
    queryFn: () => getHoDeals(hoId, { page, limit: PAGE_SIZE, status: statusFilter || undefined }),
    enabled: !!hoId,
    select: (res) => res.data,
  });

  const deals: Deal[] = data?.deals ?? [];
  const total = data?.total ?? 0;
  const pages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <PageHeader title="ALL DEALS" subtitle={`${total} deals across all branches`}>
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={(v) => { setStatusFilter(v); setPage(1); }}
          className="w-36"
        />
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState title="No deals found" description="No branches have created deals yet." />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {deals.map((deal) => (
              <Card key={deal.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-mono text-sm font-semibold text-foreground">{deal.title}</h3>
                    {deal.branch_name && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{deal.branch_name}</p>
                    )}
                  </div>
                  <Badge variant={statusVariant(deal.status)} className="shrink-0 uppercase text-[10px]">
                    {deal.status}
                  </Badge>
                </div>

                <div className="text-2xl font-bold text-primary font-mono">
                  {deal.discount_type === "percentage"
                    ? `${deal.discount_value}% OFF`
                    : `₹${deal.discount_value} OFF`}
                </div>

                <div className="space-y-1 text-xs text-muted-foreground font-mono">
                  {deal.code && <p>Code: <span className="text-foreground font-semibold">{deal.code}</span></p>}
                  {deal.min_order_value && <p>Min order: {formatINR(deal.min_order_value)}</p>}
                  {deal.expires_at && <p>Expires: {new Date(deal.expires_at).toLocaleDateString("en-IN")}</p>}
                  {deal.created_at && (
                    <p>Created: {new Date(deal.created_at).toLocaleDateString("en-IN")}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground font-mono">Page {page} of {pages}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
