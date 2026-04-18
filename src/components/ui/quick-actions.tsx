"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import {
  createDeal,
  simulateTransaction,
  type CreateDealPayload,
} from "@/lib/api/services/merchant.service";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (₹)" },
];

interface QuickActionsProps {
  className?: string;
  /** When true, render labels next to the icons (page-header context). */
  compact?: boolean;
}

export function QuickActions({ className, compact = true }: QuickActionsProps) {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();

  const [showDealModal, setShowDealModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);

  const [dealForm, setDealForm] = useState<CreateDealPayload>({
    title: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_value: null,
    max_discount_amount: null,
    code: null,
    starts_at: null,
    expires_at: null,
  });

  const [txnBill, setTxnBill] = useState("");
  const [txnUseCoupon, setTxnUseCoupon] = useState<boolean | null>(null);

  const { mutate: submitDeal, isPending: dealSubmitting } = useMutation({
    mutationFn: (payload: CreateDealPayload) => createDeal(branchId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deals"] });
      setShowDealModal(false);
      setDealForm({
        title: "",
        discount_type: "percentage",
        discount_value: 0,
        min_order_value: null,
        max_discount_amount: null,
        code: null,
        starts_at: null,
        expires_at: null,
      });
    },
  });

  const { mutate: submitTxn, isPending: txnSubmitting } = useMutation({
    mutationFn: () =>
      simulateTransaction({
        bill_amount: txnBill ? parseFloat(txnBill) : null,
        use_coupon: txnUseCoupon,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["recent-redemptions"] });
      qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
      qc.invalidateQueries({ queryKey: ["branchScore"] });
      qc.invalidateQueries({ queryKey: ["rolling-score"] });
      setShowTxnModal(false);
      setTxnBill("");
      setTxnUseCoupon(null);
    },
  });

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => setShowDealModal(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 text-xs font-medium text-foreground transition-colors hover:bg-primary/15"
      >
        <span aria-hidden>🏷️</span>
        {compact && <span className="font-mono">Create Deal</span>}
      </button>
      <button
        type="button"
        onClick={() => setShowTxnModal(true)}
        className="inline-flex h-9 items-center gap-1.5 rounded-md border border-gain/30 bg-gain/10 px-3 text-xs font-medium text-foreground transition-colors hover:bg-gain/15"
      >
        <span aria-hidden>🧾</span>
        {compact && <span className="font-mono">Add Txn</span>}
      </button>

      <Modal isOpen={showDealModal} onClose={() => setShowDealModal(false)} title="Create New Deal">
        <div className="space-y-3">
          <Input
            label="Deal Title"
            value={dealForm.title}
            onChange={(e) => setDealForm((p) => ({ ...p, title: e.target.value }))}
            placeholder="e.g. 15% off on weekends"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              options={DISCOUNT_TYPES}
              value={dealForm.discount_type}
              onChange={(v) => setDealForm((p) => ({ ...p, discount_type: v as "percentage" | "fixed" }))}
            />
            <Input
              label="Value"
              type="number"
              value={String(dealForm.discount_value || "")}
              onChange={(e) =>
                setDealForm((p) => ({
                  ...p,
                  discount_value: parseFloat(e.target.value) || 0,
                }))
              }
              placeholder="e.g. 15"
            />
          </div>
          <Input
            label="Min Order Value (₹)"
            type="number"
            value={String(dealForm.min_order_value || "")}
            onChange={(e) =>
              setDealForm((p) => ({
                ...p,
                min_order_value: parseFloat(e.target.value) || null,
              }))
            }
            placeholder="Optional"
          />
          <Input
            label="Max Discount (₹)"
            type="number"
            value={String(dealForm.max_discount_amount || "")}
            onChange={(e) =>
              setDealForm((p) => ({
                ...p,
                max_discount_amount: parseFloat(e.target.value) || null,
              }))
            }
            placeholder="Optional"
          />
          <Button
            onClick={() => submitDeal(dealForm)}
            disabled={!dealForm.title || !dealForm.discount_value || dealSubmitting}
            className="w-full"
          >
            {dealSubmitting ? "Creating..." : "Create Deal"}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showTxnModal} onClose={() => setShowTxnModal(false)} title="Add Transaction">
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Create a simulated transaction on this demo merchant. It drives the next
            score tick, refreshes the latest-5 redemptions card, and broadcasts a
            sound + toast if real-time notifications are available.
          </p>
          <Input
            label="Bill Amount (₹) — leave blank for random"
            type="number"
            min="1"
            step="1"
            value={txnBill}
            onChange={(e) => setTxnBill(e.target.value)}
            placeholder="e.g. 499"
          />
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Coupon</label>
            <div className="flex gap-2">
              {[
                { v: null, l: "Random" },
                { v: true, l: "Use coupon" },
                { v: false, l: "No coupon" },
              ].map((opt) => (
                <button
                  key={String(opt.v)}
                  type="button"
                  onClick={() => setTxnUseCoupon(opt.v)}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-xs transition-all",
                    txnUseCoupon === opt.v
                      ? "border-gain/50 bg-gain/10 text-gain"
                      : "border-glass-border bg-glass-bg text-muted-foreground hover:text-foreground",
                  )}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={() => submitTxn()} disabled={txnSubmitting} className="w-full">
            {txnSubmitting ? "Posting…" : "Post Transaction"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
