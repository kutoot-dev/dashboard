"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import {
  createDeal,
  updateStoreProfile,
  type CreateDealPayload,
} from "@/lib/api/services/merchant.service";

const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (₹)" },
];

export function QuickActions({ className }: { className?: string }) {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const qc = useQueryClient();

  const [showDealModal, setShowDealModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  // Deal form state
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

  // Commission state
  const [commission, setCommission] = useState("5");

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

  const { mutate: submitCommission, isPending: commissionSubmitting } = useMutation({
    mutationFn: (pct: string) =>
      updateStoreProfile(branchId, { commission_percentage: parseFloat(pct) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["branchScore"] });
      setShowCommissionModal(false);
    },
  });

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setShowDealModal(true)}
          className="glass-card-sm flex flex-col items-center gap-1 p-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <span className="text-lg">🏷️</span>
          <span className="font-mono text-[10px] font-medium text-foreground">Create Deal</span>
          <span className="font-mono text-[9px] text-muted-foreground">Launch a discount</span>
        </button>
        <button
          onClick={() => setShowCommissionModal(true)}
          className="glass-card-sm flex flex-col items-center gap-1 p-3 transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <span className="text-lg">💰</span>
          <span className="font-mono text-[10px] font-medium text-foreground">Commission</span>
          <span className="font-mono text-[9px] text-muted-foreground">Adjust your rate</span>
        </button>
      </div>

      {/* Deal Creation Modal */}
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

      {/* Commission Modal */}
      <Modal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        title="Set Commission Rate"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            Higher commission improves your Commission Score and can boost your ranking.
            Current platform minimum is 3%.
          </p>
          <div className="flex items-center gap-3">
            <Input
              label="Commission %"
              type="number"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              min="3"
              max="30"
              step="0.5"
            />
            <span className="font-mono text-2xl text-foreground mt-5">%</span>
          </div>
          <div className="flex gap-2">
            {["3", "5", "7", "10"].map((v) => (
              <button
                key={v}
                onClick={() => setCommission(v)}
                className={cn(
                  "rounded-full border px-3 py-1 font-mono text-xs transition-all",
                  commission === v
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-glass-border bg-glass-bg text-muted-foreground hover:text-foreground"
                )}
              >
                {v}%
              </button>
            ))}
          </div>
          <Button
            onClick={() => submitCommission(commission)}
            disabled={commissionSubmitting}
            className="w-full"
          >
            {commissionSubmitting ? "Saving..." : "Update Commission"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
