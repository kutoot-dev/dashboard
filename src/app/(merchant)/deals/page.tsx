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
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { useToastStore } from "@/lib/stores/toast.store";
import { ApiError } from "@/lib/api/client";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FilterChip, type FilterChipTone } from "@/components/ui/filter-chip";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CardGridSkeleton, StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import {
  type DealPreset,
  MIN_QUICK_PRESETS,
  selectQuickCreatePresets,
  selectRecommendedPresets,
  suggestCustomDealDraft,
} from "@/lib/deals/deal-presets";

const STATUS_FILTERS: Array<{ value: string; label: string; tone: FilterChipTone }> = [
  { value: "all", label: "All", tone: "accent" },
  { value: "active", label: "Active", tone: "gain" },
  { value: "paused", label: "Paused", tone: "warning" },
  { value: "archived", label: "Archived", tone: "neutral" },
  { value: "approved", label: "Approved", tone: "gain" },
  { value: "pending", label: "Pending", tone: "gold" },
];

function lifecycleBadgeVariant(status: Deal["lifecycle_status"]) {
  if (status === "archived") return "neutral" as const;
  if (status === "paused") return "warning" as const;
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

function formatDiscountHero(deal: Pick<Deal, "discount_type" | "discount_value">) {
  if (deal.discount_type === "percentage") return `${deal.discount_value}%`;
  if (typeof deal.discount_value === "number" && !Number.isNaN(deal.discount_value)) {
    return `₹${deal.discount_value}`;
  }
  return "--";
}

function DealTermChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative z-[1] inline-flex rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[11px] text-white/78">
      {children}
    </span>
  );
}

function DealStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative z-[1] rounded-lg border border-white/10 bg-white/6 px-2.5 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-white/55">{label}</p>
      <p className="mt-0.5 font-tabular text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function DealsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const branchId = useEffectiveBranchId();
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);

  const [status, setStatus] = useState("all");
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [customDealDraft, setCustomDealDraft] = useState<CreateDealPayload | null>(null);
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

  const allDealsQuery = useQuery({
    queryKey: ["deals", branchId, { limit: 100 }],
    queryFn: () => getDeals(branchId, { limit: 100 }),
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

  function createFromPreset(preset: DealPreset) {
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

  function openCustomDealCreator() {
    setCustomDealDraft(suggestCustomDealDraft(allDeals));
  }

  function submitCustomDeal(payload: CreateDealPayload) {
    createMutation.mutate(payload, {
      onSuccess: () => {
        setCustomDealDraft(null);
        pushToast({
          title: "Custom deal created",
          description: "Your offer is live — tweak or pause it anytime below.",
          variant: "success",
        });
      },
    });
  }

  const rows = dealsQuery.data?.success ? dealsQuery.data.data.deals : [];
  const allDeals = allDealsQuery.data?.success ? allDealsQuery.data.data.deals : rows;
  const showDealsSkeleton = useQuerySkeleton(dealsQuery);
  const totalDeals = rows.length;
  const activeDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "active").length;
  const pausedDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "paused").length;
  const archivedDeals = rows.filter((deal) => (deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused")) === "archived").length;
  const totalVisits = rows.reduce((acc, deal) => acc + Number(deal.visit_count ?? 0), 0);
  const totalNetSales = rows.reduce((acc, deal) => acc + Number(deal.net_sales ?? 0), 0);
  const totalDiscountGiven = rows.reduce((acc, deal) => acc + Number(deal.discount_amount ?? 0), 0);
  const quickCreatePresets = useMemo(() => selectQuickCreatePresets(allDeals), [allDeals]);
  const presetsExhausted = !showDealsSkeleton && quickCreatePresets.length === 0;
  const recommendedPresets = useMemo(
    () => (showRecommended ? selectRecommendedPresets(allDeals, metric) : []),
    [allDeals, metric, showRecommended],
  );
  const sourceText = source === "scoring" ? "from scoring fix" : source === "quick-action" ? "from quick action" : "for you";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Deals"
        subtitle="Create offers in one tap, track performance, and keep only your best deals live."
      >
        <div className="w-full max-w-full rounded-xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-secondary/10 px-3 py-2.5 text-left sm:w-auto sm:max-w-xs">
          <p className="font-mono text-[10px] uppercase tracking-widest text-foreground">Tip</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Run 2–3 active deals. Presets below skip offers you already run and stay margin-safe.
          </p>
        </div>
      </PageHeader>

      {showDealsSkeleton ? (
        <StatCardsSkeleton count={6} className="grid-cols-2 md:grid-cols-3 xl:grid-cols-6" />
      ) : (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card className="border border-gain/35 bg-gain/12">
          <p className="text-[10px] uppercase tracking-wide text-gain">Active</p>
          <p className="mt-1 text-xl font-semibold text-foreground">{activeDeals}</p>
          <p className="mt-1 text-xs text-muted-foreground">Currently running</p>
        </Card>
        <Card className="border border-warning/35 bg-warning/12">
          <p className="text-[10px] uppercase tracking-wide text-warning">Paused</p>
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
      )}

      {showRecommended && recommendedPresets.length > 0 && (
        <div id="recommended-presets">
          <Card className="border border-primary/30 bg-primary/5">
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
                className="deal-preset-dark p-4 text-left disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="relative z-[1] flex items-start justify-between gap-2">
                  <p className="font-semibold text-white">{preset.label}</p>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/80">
                    Tap to add
                  </span>
                </div>
                <p className="relative z-[1] mt-1 text-sm text-white/70">{preset.hint}</p>
                <p className="relative z-[1] mt-3 text-xs text-white/55">
                  {createMutation.isPending ? "Creating…" : "One-click create — edit anytime after"}
                </p>
              </button>
            ))}
          </div>
          </Card>
        </div>
      )}

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Quick create</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Scroll presets — tap any card to publish instantly.
            </p>
          </div>
          <Badge variant="neutral">
            {quickCreatePresets.length} ready · min {MIN_QUICK_PRESETS}
          </Badge>
        </div>
        {quickCreatePresets.length > 0 ? (
          <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 snap-x snap-mandatory">
            {quickCreatePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                disabled={createMutation.isPending}
                onClick={() => createFromPreset(preset)}
                className="deal-preset-dark w-[min(100%,220px)] shrink-0 snap-start p-3.5 text-left disabled:cursor-not-allowed disabled:opacity-70"
              >
                <p className="relative z-[1] text-sm font-semibold text-white">{preset.label}</p>
                <p className="relative z-[1] mt-1 text-xs text-white/65">{preset.hint}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-primary/35 bg-primary/5 px-4 py-5 sm:px-5">
            <p className="font-semibold text-foreground">You&apos;ve used all quick presets</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Create your own offer next. We&apos;ll prefill a balanced discount (type, min bill, cap, and coupon
              code) — adjust anything before you publish.
            </p>
            <Button
              type="button"
              variant="primary"
              className="mt-4"
              onClick={openCustomDealCreator}
              disabled={createMutation.isPending}
            >
              Create your own deal
            </Button>
          </div>
        )}
      </Card>

      {presetsExhausted && recommendedPresets.length === 0 && showRecommended && (
        <Card className="border border-primary/25 bg-primary/5 px-4 py-4">
          <p className="text-sm text-muted-foreground">
            No recommended presets left either.{" "}
            <button
              type="button"
              className="font-medium text-primary underline-offset-2 hover:underline"
              onClick={openCustomDealCreator}
            >
              Build a custom deal
            </button>{" "}
            with suggested terms you can edit.
          </p>
        </Card>
      )}

      <Card className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Your deals</p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">
              {totalDeals} {totalDeals === 1 ? "offer" : "offers"}
              {status !== "all" ? ` · ${status}` : ""}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Filter by status, then edit or pause from each card.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Status filter</p>
            <div
              className="-mx-0.5 flex gap-2 overflow-x-auto overflow-y-visible scroll-px-1 py-1.5 scrollbar-hide sm:flex-wrap sm:overflow-visible"
              role="tablist"
              aria-label="Deal status filters"
            >
              {STATUS_FILTERS.map((option) => (
                <FilterChip
                  key={option.value}
                  label={option.label}
                  tone={option.tone}
                  selected={status === option.value}
                  onSelect={() => setStatus(option.value)}
                />
              ))}
            </div>
          </div>
        </div>

        {showDealsSkeleton && <CardGridSkeleton count={6} />}

        {!showDealsSkeleton && rows.length > 0 && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {rows.map((deal) => {
              const lifecycle = deal.lifecycle_status ?? (deal.archived_at ? "archived" : deal.is_active ? "active" : "paused");
              const discountHero = formatDiscountHero(deal);

              return (
                <article
                  key={deal.id}
                  className="deal-card-dark group flex h-full flex-col p-4 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="relative z-[1] mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate font-semibold text-white">{deal.title || `Deal #${deal.id}`}</p>
                      <p className="text-xs text-white/60">
                        Code <span className="font-mono text-white/85">{deal.code || "AUTO"}</span>
                      </p>
                    </div>
                    <Badge
                      variant={lifecycleBadgeVariant(lifecycle)}
                      className="shrink-0 text-[10px] capitalize"
                    >
                      {lifecycle}
                    </Badge>
                  </div>

                  <div className="relative z-[1] mb-3 flex items-end gap-2">
                    <p className="font-display text-4xl font-bold leading-none tracking-tight text-white">
                      {discountHero}
                    </p>
                    <p className="pb-1 text-sm font-medium uppercase tracking-wide text-white/70">off</p>
                  </div>

                  <div className="relative z-[1] mb-3 flex flex-wrap gap-1.5">
                    <DealTermChip>Min {moneyOrDash(deal.min_order_value)}</DealTermChip>
                    <DealTermChip>Cap {moneyOrDash(deal.max_discount_amount)}</DealTermChip>
                    {(deal.starts_at || deal.expires_at) && (
                      <DealTermChip>
                        {deal.starts_at ? formatDealDate(deal.starts_at) : "Now"} →{" "}
                        {deal.expires_at ? formatDealDate(deal.expires_at) : "No end"}
                      </DealTermChip>
                    )}
                  </div>

                  <div className="relative z-[1] mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <DealStat label="Gross" value={formatCompactMoney(deal.total_amount)} />
                    <DealStat label="Discount" value={formatCompactMoney(deal.discount_amount)} />
                    <DealStat label="Net sales" value={formatCompactMoney(deal.net_sales)} />
                    <DealStat label="Visits" value={String(deal.visit_count ?? 0)} />
                  </div>

                  <div className="relative z-[1] mt-auto space-y-2 border-t border-white/10 pt-3">
                    <p className="text-[11px] text-white/50">Created {formatDealDate(deal.created_at)}</p>
                    <div className="flex flex-wrap gap-2">
                      {lifecycle !== "archived" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-white/25 bg-white/10 text-white hover:bg-white/20"
                          onClick={() => setEditingDeal(deal)}
                        >
                          Edit
                        </Button>
                      )}
                      {lifecycle === "active" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/15 text-white hover:bg-white/25"
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
                          className="bg-white/15 text-white hover:bg-white/25"
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
                </article>
              );
            })}
          </div>
        )}

        {!showDealsSkeleton && rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-4 py-10 text-center">
            <p className="text-sm font-medium text-foreground">No deals in this view</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Try another status filter or create a preset above.
            </p>
          </div>
        )}
      </Card>

      <Modal
        isOpen={customDealDraft !== null}
        onClose={() => setCustomDealDraft(null)}
        title="Create your own deal"
      >
        {customDealDraft && (
          <DealForm
            key={customDealDraft.code ?? "custom-draft"}
            initial={customDealDraft}
            mode="create"
            helperText="Suggested terms based on what you don't run yet. Change discount, minimum bill, cap, or coupon code (unique for your branch) before publishing."
            submitLabel="Publish deal"
            onCancel={() => setCustomDealDraft(null)}
            onSubmit={(payload) => submitCustomDeal(payload as CreateDealPayload)}
            isSubmitting={createMutation.isPending}
          />
        )}
      </Modal>

      <Modal
        isOpen={Boolean(editingDeal)}
        onClose={() => setEditingDeal(null)}
        title={editingDeal ? `Edit ${editingDeal.title || `Deal #${editingDeal.id}`}` : "Edit deal"}
      >
        {editingDeal && (
          <DealForm
            key={editingDeal.id}
            initial={dealToFormPayload(editingDeal)}
            mode="edit"
            submitLabel="Save changes"
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

function dealToFormPayload(deal: Deal): CreateDealPayload {
  return {
    discount_type: deal.discount_type,
    discount_value: deal.discount_value,
    min_order_value: deal.min_order_value,
    max_discount_amount: deal.max_discount_amount,
    code: deal.code,
    starts_at: deal.starts_at,
    expires_at: deal.expires_at,
  };
}

interface DealFormProps {
  initial: CreateDealPayload;
  mode: "create" | "edit";
  helperText?: string;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (payload: CreateDealPayload | Partial<CreateDealPayload>) => void;
  isSubmitting: boolean;
}

function DealForm({
  initial,
  mode,
  helperText,
  submitLabel,
  onCancel,
  onSubmit,
  isSubmitting,
}: DealFormProps) {
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(initial.discount_type);
  const [discountValue, setDiscountValue] = useState(String(initial.discount_value ?? ""));
  const [minOrder, setMinOrder] = useState(
    initial.min_order_value != null ? String(initial.min_order_value) : "",
  );
  const [maxDiscount, setMaxDiscount] = useState(
    initial.max_discount_amount != null ? String(initial.max_discount_amount) : "",
  );
  const [code, setCode] = useState(initial.code ?? "");
  const [expiresAt, setExpiresAt] = useState(initial.expires_at ? initial.expires_at.slice(0, 16) : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedValue = Number(discountValue);
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) return;

    const payload: CreateDealPayload = {
      discount_type: discountType,
      discount_value: parsedValue,
      min_order_value: minOrder.trim() === "" ? null : Number(minOrder),
      max_discount_amount: maxDiscount.trim() === "" ? null : Number(maxDiscount),
      code: code.trim() === "" ? null : code.trim().toUpperCase(),
      starts_at: mode === "create" ? null : initial.starts_at ?? null,
      expires_at: expiresAt.trim() === "" ? null : new Date(expiresAt).toISOString(),
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {helperText && (
        <p className="rounded-lg border border-border/80 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {helperText}
        </p>
      )}

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
        placeholder="Leave blank for auto-generated"
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
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
