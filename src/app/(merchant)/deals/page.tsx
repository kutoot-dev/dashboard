"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveDeal,
  createDeal,
  getDeals,
  pauseDeal,
  resumeDeal,
  type CreateDealPayload,
  type Deal,
} from "@/lib/api/services/merchant.service";
import { useAuth } from "@/components/providers/auth-provider";
import { useToastStore } from "@/lib/stores/toast.store";
import { ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
];

function lifecycleBadgeVariant(status: Deal["lifecycle_status"]) {
  if (status === "archived") return "warning" as const;
  if (status === "paused") return "neutral" as const;
  return "gain" as const;
}

function moneyOrDash(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "--";
  return `Rs ${value.toFixed(2)}`;
}

export default function DealsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [status, setStatus] = useState("all");
  const [form, setForm] = useState<CreateDealPayload>({
    discount_type: "percentage",
    discount_value: 10,
    min_order_value: null,
    max_discount_amount: null,
    code: null,
    starts_at: null,
    expires_at: null,
  });

  const params = useMemo(() => {
    const next: { limit: number; status?: string } = { limit: 100 };
    if (status !== "all") next.status = status;
    return next;
  }, [status]);

  const dealsQuery = useQuery({
    queryKey: ["deals", branchId, params],
    queryFn: () => getDeals(branchId, params),
    enabled: Boolean(branchId),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(branchId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals", branchId] });
      pushToast({ title: "Deal created", variant: "success" });
      setForm((prev) => ({ ...prev, code: null }));
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to create deal";
      pushToast({ title: "Create failed", description: message, variant: "error" });
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (input: { action: "pause" | "resume" | "archive"; dealId: number }) => {
      if (input.action === "pause") return pauseDeal(branchId, input.dealId);
      if (input.action === "resume") return resumeDeal(branchId, input.dealId);
      return archiveDeal(branchId, input.dealId);
    },
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: ["deals", branchId] });
      pushToast({ title: `Deal ${vars.action}d`, variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "Unable to update deal";
      pushToast({ title: "Update failed", description: message, variant: "error" });
    },
  });

  function submitCreateDeal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.discount_value || form.discount_value <= 0) {
      pushToast({ title: "Invalid discount", description: "Discount value must be greater than 0", variant: "warning" });
      return;
    }
    createMutation.mutate(form);
  }

  const rows = dealsQuery.data?.success ? dealsQuery.data.data.deals : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" subtitle="Create and manage active, paused, and archived offers." />

      <Card>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={submitCreateDeal}>
          <Select
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed Amount" },
            ]}
            value={form.discount_type}
            onChange={(value) => setForm((prev) => ({ ...prev, discount_type: value as "percentage" | "fixed" }))}
          />
          <Input
            label="Discount value"
            type="number"
            min="0"
            step="0.01"
            value={form.discount_value}
            onChange={(e) => setForm((prev) => ({ ...prev, discount_value: Number(e.target.value) || 0 }))}
          />
          <Input
            label="Code (optional)"
            value={form.code ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value || null }))}
            placeholder="AUTO if empty"
          />
          <Input
            label="Min order (optional)"
            type="number"
            min="0"
            step="0.01"
            value={form.min_order_value ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, min_order_value: e.target.value ? Number(e.target.value) : null }))}
          />
          <Input
            label="Max discount (optional)"
            type="number"
            min="0"
            step="0.01"
            value={form.max_discount_amount ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, max_discount_amount: e.target.value ? Number(e.target.value) : null }))}
          />
          <div className="flex items-end">
            <Button type="submit" loading={createMutation.isPending} className="w-full">
              Create deal
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lifecycle</p>
          <div className="w-44">
            <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Deal</th>
                <th className="px-2 py-2">Discount</th>
                <th className="px-2 py-2">Thresholds</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((deal) => {
                const lifecycle = deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused");

                return (
                  <tr key={deal.id} className="border-b border-border/60 align-top">
                    <td className="px-2 py-3">
                      <p className="font-medium text-foreground">{deal.title || `Deal #${deal.id}`}</p>
                      <p className="text-xs text-muted-foreground">Code: {deal.code || "AUTO"}</p>
                      <p className="text-xs text-muted-foreground">Created: {new Date(deal.created_at).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className="px-2 py-3">
                      <p className="font-mono text-foreground">
                        {deal.discount_type === "percentage" ? `${deal.discount_value}%` : moneyOrDash(deal.discount_value)}
                      </p>
                    </td>
                    <td className="px-2 py-3 text-xs text-muted-foreground">
                      <p>Min: {moneyOrDash(deal.min_order_value)}</p>
                      <p>Max: {moneyOrDash(deal.max_discount_amount)}</p>
                    </td>
                    <td className="px-2 py-3">
                      <Badge variant={lifecycleBadgeVariant(lifecycle)}>{lifecycle.toUpperCase()}</Badge>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        {lifecycle === "active" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => actionMutation.mutate({ action: "pause", dealId: deal.id })}
                            loading={actionMutation.isPending}
                          >
                            Pause
                          </Button>
                        )}
                        {lifecycle === "paused" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => actionMutation.mutate({ action: "resume", dealId: deal.id })}
                            loading={actionMutation.isPending}
                          >
                            Resume
                          </Button>
                        )}
                        {lifecycle !== "archived" && (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => actionMutation.mutate({ action: "archive", dealId: deal.id })}
                            loading={actionMutation.isPending}
                          >
                            Archive
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!dealsQuery.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No deals found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
