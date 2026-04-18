"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  type CreateDealPayload,
  type Deal,
} from "@/lib/api/services/merchant.service";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (₹)" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "expired", label: "Expired" },
];

const INITIAL_FORM: CreateDealPayload = {
  title: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_value: null,
  max_discount_amount: null,
  code: null,
  starts_at: null,
  expires_at: null,
};

/**
 * Quick-start templates so the merchant can ship a deal in one click.
 * Clicking a chip prefills the create modal with sensible defaults.
 */
const DEAL_PRESETS: ReadonlyArray<{ label: string; payload: Partial<CreateDealPayload> }> = [
  { label: "Welcome 10%", payload: { title: "Welcome 10% Off", discount_type: "percentage", discount_value: 10 } },
  { label: "Weekend ₹100", payload: { title: "Weekend ₹100 Off", discount_type: "fixed", discount_value: 100, min_order_value: 500 } },
  { label: "Combo 15%", payload: { title: "Combo Saver 15%", discount_type: "percentage", discount_value: 15, min_order_value: 800, max_discount_amount: 250 } },
  { label: "First Order ₹50", payload: { title: "First Order ₹50 Off", discount_type: "fixed", discount_value: 50, min_order_value: 200 } },
  { label: "Lunch Hour 20%", payload: { title: "Lunch Hour 20% Off", discount_type: "percentage", discount_value: 20, max_discount_amount: 200 } },
  { label: "Late Night 25%", payload: { title: "Late Night 25% Off", discount_type: "percentage", discount_value: 25, min_order_value: 300, max_discount_amount: 300 } },
  { label: "Big Spender ₹250", payload: { title: "Big Spender ₹250 Off", discount_type: "fixed", discount_value: 250, min_order_value: 1500 } },
  { label: "Festive 30%", payload: { title: "Festive 30% Off", discount_type: "percentage", discount_value: 30, max_discount_amount: 500 } },
  { label: "Loyalty ₹150", payload: { title: "Loyalty ₹150 Off", discount_type: "fixed", discount_value: 150, min_order_value: 800 } },
  { label: "Flash 5%", payload: { title: "Flash 5% Off", discount_type: "percentage", discount_value: 5 } },
];

function statusVariant(status: string): "gain" | "loss" | "neutral" | "warning" {
  if (status === "approved") return "gain";
  if (status === "rejected") return "loss";
  if (status === "pending") return "neutral";
  return "warning";
}

export default function DealsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();

  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<CreateDealPayload>(INITIAL_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["deals", branchId, statusFilter],
    queryFn: () => getDeals(branchId, { status: statusFilter || undefined }),
    enabled: !!branchId,
    select: (res) => res.data,
  });

  const { mutate: submitDeal, isPending: submitting } = useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(branchId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals", branchId] });
      setShowModal(false);
      setForm(INITIAL_FORM);
      setFormError(null);
    },
    onError: (err: Error) => setFormError(err.message),
  });

  const { mutate: toggleDeal } = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      updateDeal(branchId, id, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals", branchId] }),
  });

  const { mutate: removeDeal } = useMutation({
    mutationFn: (id: number) => deleteDeal(branchId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["deals", branchId] }),
  });

  function applyPreset(payload: Partial<CreateDealPayload>) {
    setForm({ ...INITIAL_FORM, ...payload });
    setFormError(null);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) { setFormError("Title is required"); return; }
    if (!form.discount_value || form.discount_value <= 0) { setFormError("Discount value must be > 0"); return; }
    if (form.discount_type === "percentage" && form.discount_value > 100) { setFormError("Percentage cannot exceed 100"); return; }
    submitDeal(form);
  }

  const deals: Deal[] = data?.deals ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="DEALS" subtitle="Manage coupons and promotional offers">
        <Select
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          className="w-36"
        />
        <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90 text-white">
          + New Deal
        </Button>
      </PageHeader>

      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Quick Templates
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
          {DEAL_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.payload)}
              className="shrink-0 rounded-full border border-glass-border bg-glass-bg px-3 py-1.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-lg" />)}
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          title="No deals yet"
          description="Create your first coupon to attract more customers."
          action={{ label: "Create Deal", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <Card key={deal.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-mono text-sm font-semibold text-foreground leading-tight">{deal.title}</h3>
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
                {deal.max_discount_amount && <p>Max discount: {formatINR(deal.max_discount_amount)}</p>}
                {deal.expires_at && <p>Expires: {new Date(deal.expires_at).toLocaleDateString("en-IN")}</p>}
              </div>

              <div className="flex gap-2 pt-1 border-t border-border">
                {deal.status === "approved" && (
                  <Button
                    size="sm"
                    variant={deal.is_active ? "secondary" : "ghost"}
                    onClick={() => toggleDeal({ id: deal.id, is_active: !deal.is_active })}
                    className="flex-1 text-xs"
                  >
                    {deal.is_active ? "Deactivate" : "Activate"}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { if (confirm("Delete this deal?")) removeDeal(deal.id); }}
                  className={cn("text-xs", deal.status !== "approved" && "flex-1")}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(null); setForm(INITIAL_FORM); }} title="Create New Deal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Deal Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="e.g. Weekend Flat 20% Off" required />

          <Select
            options={DISCOUNT_TYPES}
            value={form.discount_type}
            onChange={(v) => setForm((p) => ({ ...p, discount_type: v as "percentage" | "fixed" }))}
          />

          <Input
            label={form.discount_type === "percentage" ? "Discount (%)" : "Discount Amount (₹)"}
            type="number"
            min="1"
            max={form.discount_type === "percentage" ? "100" : undefined}
            step="0.01"
            value={form.discount_value || ""}
            onChange={(e) => setForm((p) => ({ ...p, discount_value: parseFloat(e.target.value) || 0 }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Order (₹) — optional"
              type="number"
              min="0"
              step="1"
              value={form.min_order_value ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, min_order_value: e.target.value ? parseFloat(e.target.value) : null }))}
            />
            <Input
              label="Max Discount (₹) — optional"
              type="number"
              min="0"
              step="1"
              value={form.max_discount_amount ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, max_discount_amount: e.target.value ? parseFloat(e.target.value) : null }))}
            />
          </div>

          <Input
            label="Coupon Code — optional"
            value={form.code ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, code: e.target.value || null }))}
            placeholder="SAVE20"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Starts"
              type="datetime-local"
              value={form.starts_at ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, starts_at: e.target.value || null }))}
            />
            <Input
              label="Expires"
              type="datetime-local"
              value={form.expires_at ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value || null }))}
            />
          </div>

          <p className="text-xs text-muted-foreground">Deal will be sent to HO for approval before going live.</p>

          {formError && (
            <p className="text-xs text-destructive font-mono">{formError}</p>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" loading={submitting} className="bg-primary hover:bg-primary/90 text-white">
              Submit for Approval
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
