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

const DEAL_PRESETS: Array<{
  id: string;
  label: string;
  hint: string;
  payload: CreateDealPayload;
}> = [
  {
    id: "flat-10",
    label: "10% OFF",
    hint: "All bills",
    payload: { discount_type: "percentage", discount_value: 10, min_order_value: null, max_discount_amount: null, code: null, starts_at: null, expires_at: null },
  },
  {
    id: "flat-15",
    label: "15% OFF",
    hint: "All bills",
    payload: { discount_type: "percentage", discount_value: 15, min_order_value: null, max_discount_amount: null, code: null, starts_at: null, expires_at: null },
  },
  {
    id: "flat-20-cap-200",
    label: "20% OFF",
    hint: "Cap Rs 200",
    payload: { discount_type: "percentage", discount_value: 20, min_order_value: null, max_discount_amount: 200, code: null, starts_at: null, expires_at: null },
  },
  {
    id: "welcome-25",
    label: "Welcome 25%",
    hint: "Min Rs 299",
    payload: { discount_type: "percentage", discount_value: 25, min_order_value: 299, max_discount_amount: 250, code: "WELCOME25", starts_at: null, expires_at: null },
  },
  {
    id: "weekend-30",
    label: "Weekend 30%",
    hint: "Min Rs 499",
    payload: { discount_type: "percentage", discount_value: 30, min_order_value: 499, max_discount_amount: 300, code: "WEEKEND30", starts_at: null, expires_at: null },
  },
  {
    id: "save-50",
    label: "Save Rs 50",
    hint: "Min Rs 299",
    payload: { discount_type: "fixed", discount_value: 50, min_order_value: 299, max_discount_amount: null, code: "SAVE50", starts_at: null, expires_at: null },
  },
  {
    id: "save-100",
    label: "Save Rs 100",
    hint: "Min Rs 799",
    payload: { discount_type: "fixed", discount_value: 100, min_order_value: 799, max_discount_amount: null, code: "SAVE100", starts_at: null, expires_at: null },
  },
  {
    id: "happy-hour",
    label: "Happy Hour",
    hint: "18% OFF cap Rs 180",
    payload: { discount_type: "percentage", discount_value: 18, min_order_value: 199, max_discount_amount: 180, code: "HAPPYHOUR", starts_at: null, expires_at: null },
  },
  {
    id: "family-combo",
    label: "Family Combo",
    hint: "Rs 150 OFF over Rs 1200",
    payload: { discount_type: "fixed", discount_value: 150, min_order_value: 1200, max_discount_amount: null, code: "FAMILY150", starts_at: null, expires_at: null },
  },
  {
    id: "mega-35",
    label: "Mega 35%",
    hint: "Min Rs 999 cap Rs 400",
    payload: { discount_type: "percentage", discount_value: 35, min_order_value: 999, max_discount_amount: 400, code: "MEGA35", starts_at: null, expires_at: null },
  },
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

function formatCompactMoney(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Rs 0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function DealsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [status, setStatus] = useState("all");

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

  function createFromPreset(preset: (typeof DEAL_PRESETS)[number]) {
    if (createMutation.isPending) return;
    createMutation.mutate(preset.payload, {
      onSuccess: () => {
        pushToast({
          title: "Preset deal created",
          description: `${preset.label} is now live.`,
          variant: "success",
        });
      },
    });
  }

  const rows = dealsQuery.data?.success ? dealsQuery.data.data.deals : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" subtitle="Create and manage active, paused, and archived offers.">
        <div className="flex max-w-full flex-wrap justify-end gap-2">
          {DEAL_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              size="sm"
              variant="secondary"
              loading={createMutation.isPending}
              onClick={() => createFromPreset(preset)}
              className="h-auto min-h-9 px-3 py-1.5 text-left"
            >
              <span className="flex flex-col leading-tight">
                <span className="font-mono text-[11px]">{preset.label}</span>
                <span className="text-[10px] text-muted-foreground">{preset.hint}</span>
              </span>
            </Button>
          ))}
        </div>
      </PageHeader>

      <Card>
        <p className="text-sm text-muted-foreground">
          Use quick actions in the header to launch ready-made deal presets instantly.
        </p>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lifecycle</p>
          <div className="w-44">
            <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>
        </div>

        {dealsQuery.isLoading && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
            ))}
          </div>
        )}

        {!dealsQuery.isLoading && rows.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.map((deal) => {
              const lifecycle = deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused");

              return (
                <div
                  key={deal.id}
                  className="group rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-semibold text-foreground">{deal.title || `Deal #${deal.id}`}</p>
                      <p className="text-xs text-muted-foreground">Code: {deal.code || "AUTO"}</p>
                    </div>
                    <Badge variant={lifecycleBadgeVariant(lifecycle)}>{lifecycle.toUpperCase()}</Badge>
                  </div>

                  <div className="mb-3 rounded-lg border border-border/60 bg-muted/20 p-2">
                    <p className="font-mono text-sm text-foreground">
                      {deal.discount_type === "percentage" ? `${deal.discount_value}% OFF` : `${moneyOrDash(deal.discount_value)} OFF`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Min order {moneyOrDash(deal.min_order_value)} | Max discount {moneyOrDash(deal.max_discount_amount)}
                    </p>
                  </div>

                  <div className="mb-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total amount</p>
                      <p className="text-sm font-semibold text-foreground">{formatCompactMoney(deal.total_amount)}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Discount amount</p>
                      <p className="text-sm font-semibold text-foreground">{formatCompactMoney(deal.discount_amount)}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Net sales</p>
                      <p className="text-sm font-semibold text-foreground">{formatCompactMoney(deal.net_sales)}</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background/40 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Coupon visits</p>
                      <p className="text-sm font-semibold text-foreground">{deal.visit_count ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(deal.created_at).toLocaleDateString("en-IN")}
                    </p>
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
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!dealsQuery.isLoading && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/80 px-4 py-8 text-center text-sm text-muted-foreground">
            No deals found for this filter.
          </div>
        )}
      </Card>
    </div>
  );
}
