"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import {
  archiveDeal,
  createDeal,
  getDeals,
  pauseDeal,
  resumeDeal,
  updateDeal,
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";

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

const METRIC_PRESET_MAP: Record<string, string[]> = {
  discount_aggression_score: ["flat-10", "flat-15", "flat-20-cap-200"],
  user_growth_score: ["welcome-25", "weekend-30", "happy-hour"],
  repeat_rate_score: ["flat-15", "save-50", "save-100"],
  gmv_score: ["family-combo", "weekend-30", "mega-35"],
  platform_capture_score: ["happy-hour", "flat-15", "save-50"],
};

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

function formatMetricName(metric: string) {
  return metric
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDealDate(value: string | null | undefined) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-IN", { month: "short" });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export default function DealsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [status, setStatus] = useState("all");
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const showRecommended = searchParams.get("recommended") === "1";
  const source = searchParams.get("source") ?? "";
  const metric = searchParams.get("metric") ?? "";

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

  const editMutation = useMutation({
    mutationFn: (input: { dealId: number; payload: Partial<CreateDealPayload> }) =>
      updateDeal(branchId, input.dealId, input.payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals", branchId] });
      pushToast({ title: "Deal updated", variant: "success" });
      setEditingDeal(null);
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
  const totalDeals = rows.length;
  const activeDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "active").length;
  const pausedDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "paused").length;
  const archivedDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "archived").length;
  const totalVisits = rows.reduce((acc, deal) => acc + Number(deal.visit_count ?? 0), 0);
  const totalNetSales = rows.reduce((acc, deal) => acc + Number(deal.net_sales ?? 0), 0);
  const totalDiscountGiven = rows.reduce((acc, deal) => acc + Number(deal.discount_amount ?? 0), 0);
  const metricRecommendedIds = METRIC_PRESET_MAP[metric] ?? [];
  const recommendedPresets = (
    metricRecommendedIds.length > 0
      ? DEAL_PRESETS.filter((preset) => metricRecommendedIds.includes(preset.id))
      : DEAL_PRESETS
  ).slice(0, 6);
  const sourceText = source === "scoring" ? "from scoring fix" : source === "quick-action" ? "from quick action" : "for you";

  return (
    <div className="space-y-6">
      <PageHeader title="Deals" subtitle="Create, monitor, and optimize offers with clear business impact.">
        <div className="w-full max-w-full rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-left sm:w-auto">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">Merchant Tip</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Keep 2-3 active deals at a time and rotate low-performing ones every week.
          </p>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card className="border border-emerald-300/20 bg-emerald-500/5">
          <p className="text-[10px] uppercase tracking-wide text-emerald-200">Active</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{activeDeals}</p>
          <p className="mt-1 text-xs text-muted-foreground">Currently running</p>
        </Card>
        <Card className="border border-amber-300/20 bg-amber-500/5">
          <p className="text-[10px] uppercase tracking-wide text-amber-200">Paused</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{pausedDeals}</p>
          <p className="mt-1 text-xs text-muted-foreground">Can be resumed</p>
        </Card>
        <Card className="border border-border bg-muted/30">
          <p className="text-[10px] uppercase tracking-wide text-foreground">Archived</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{archivedDeals}</p>
          <p className="mt-1 text-xs text-muted-foreground">Not editable</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total deals</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{totalDeals}</p>
          <p className="mt-1 text-xs text-muted-foreground">For selected filter</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Net sales</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{formatCompactMoney(totalNetSales)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Generated by deals</p>
        </Card>
        <Card>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Coupon visits</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{totalVisits.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Discounts {formatCompactMoney(totalDiscountGiven)}
          </p>
        </Card>
      </div>

      {showRecommended && (
        <Card id="recommended-presets" className="border border-primary/30 bg-primary/5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">Recommended Preset Deals</p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                Best presets {sourceText}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap any card to create instantly.
              </p>
            </div>
            {metric && (
              <Badge variant="neutral">
                Metric: {formatMetricName(metric)}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {recommendedPresets.map((preset) => (
              <button
                key={`recommended-${preset.id}`}
                type="button"
                onClick={() => createFromPreset(preset)}
                disabled={createMutation.isPending}
                className="rounded-xl border border-primary/25 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
              >
                <p className="font-semibold text-foreground">{preset.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">{preset.hint}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {createMutation.isPending ? "Creating..." : "Create this deal instantly"}
                </p>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quick create presets</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Launch proven deal formats in one click. You can edit them later anytime.
            </p>
          </div>
          <Badge variant="neutral">10 templates</Badge>
        </div>
        <div className="flex max-w-full flex-wrap gap-2">
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
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Lifecycle</p>
          <div className="w-44">
            <Select options={STATUS_OPTIONS} value={status} onChange={setStatus} />
          </div>
        </div>

        {dealsQuery.isLoading && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl border border-border/60 bg-muted/20" />
            ))}
          </div>
        )}

        {!dealsQuery.isLoading && rows.length > 0 && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rows.map((deal) => {
              const lifecycle = deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused");

              return (
                <div
                  key={deal.id}
                  className="group flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
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

                  {(deal.starts_at || deal.expires_at) && (
                    <div className="mb-3 rounded-lg border border-border/60 bg-background/30 p-2">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Offer duration</p>
                      <p className="mt-1 text-xs text-foreground">
                        Starts {deal.starts_at ? formatDealDate(deal.starts_at) : "Immediately"}
                      </p>
                      <p className="text-xs text-foreground">
                        Ends {deal.expires_at ? formatDealDate(deal.expires_at) : "No expiry"}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <p className="text-xs text-muted-foreground">
                      Created {formatDealDate(deal.created_at)}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lifecycle !== "archived" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingDeal(deal)}
                        >
                          Edit
                        </Button>
                      )}
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

                  <div className="mt-3 border-t border-border/60 pt-3">
                    <p className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">Performance Snapshot</p>
                    <div className="grid grid-cols-2 gap-2">
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

      <Modal
        isOpen={Boolean(editingDeal)}
        onClose={() => setEditingDeal(null)}
        title={editingDeal ? `Edit ${editingDeal.title || `Deal #${editingDeal.id}`}` : "Edit deal"}
      >
        {editingDeal && (
          <EditDealForm
            key={editingDeal.id}
            deal={editingDeal}
            onCancel={() => setEditingDeal(null)}
            onSubmit={(payload) => {
              editMutation.mutate({ dealId: editingDeal.id, payload });
            }}
            isSubmitting={editMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
}

interface EditDealFormProps {
  deal: Deal;
  onCancel: () => void;
  onSubmit: (payload: Partial<CreateDealPayload>) => void;
  isSubmitting: boolean;
}

function EditDealForm({ deal, onCancel, onSubmit, isSubmitting }: EditDealFormProps) {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(deal.discount_type);
  const [discountValue, setDiscountValue] = useState(String(deal.discount_value ?? ""));
  const [minOrder, setMinOrder] = useState(deal.min_order_value != null ? String(deal.min_order_value) : "");
  const [maxDiscount, setMaxDiscount] = useState(deal.max_discount_amount != null ? String(deal.max_discount_amount) : "");
  const [code, setCode] = useState(deal.code ?? "");
  const [expiresAt, setExpiresAt] = useState(deal.expires_at ? deal.expires_at.slice(0, 16) : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = Number(discountValue);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) return;

    const payload: Partial<CreateDealPayload> = {
      discount_type: discountType,
      discount_value: parsedValue,
      min_order_value: minOrder.trim() === "" ? null : Number(minOrder),
      max_discount_amount: maxDiscount.trim() === "" ? null : Number(maxDiscount),
      code: code.trim() === "" ? null : code.trim().toUpperCase(),
      expires_at: expiresAt.trim() === "" ? null : new Date(expiresAt).toISOString(),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Discount type</label>
          <Select
            options={[
              { value: "percentage", label: "Percentage" },
              { value: "fixed", label: "Fixed (Rs)" },
            ]}
            value={discountType}
            onChange={(v) => setDiscountType(v as "percentage" | "fixed")}
          />
        </div>
        <Input
          label={discountType === "percentage" ? "Discount %" : "Discount Rs"}
          type="number"
          min={0}
          step="0.01"
          value={discountValue}
          onChange={(e) => setDiscountValue(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Min order (Rs)"
          type="number"
          min={0}
          step="1"
          value={minOrder}
          onChange={(e) => setMinOrder(e.target.value)}
          placeholder="No minimum"
        />
        <Input
          label="Max discount cap (Rs)"
          type="number"
          min={0}
          step="1"
          value={maxDiscount}
          onChange={(e) => setMaxDiscount(e.target.value)}
          placeholder="No cap"
        />
      </div>

      <Input
        label="Coupon code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="AUTO"
      />

      <Input
        label="Expires at"
        type="datetime-local"
        value={expiresAt}
        onChange={(e) => setExpiresAt(e.target.value)}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
