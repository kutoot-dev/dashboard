"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils/cn";
import {
  simulateTransaction,
} from "@/lib/api/services/merchant.service";

interface QuickActionsProps {
  className?: string;
  /** When true, render labels next to the icons. */
  compact?: boolean;
}

export function QuickActions({ className, compact = true }: QuickActionsProps) {
  const router = useRouter();
  const qc = useQueryClient();
  const { user } = useAuth();
  const isDemoAccount = Boolean(user?.is_test);

  const [showTxnModal, setShowTxnModal] = useState(false);

  const [txnBill, setTxnBill] = useState("");
  const [txnUseCoupon, setTxnUseCoupon] = useState<boolean | null>(null);

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
        id="quick-action-add-deal"
        type="button"
        onClick={() => router.push("/deals?recommended=1&source=quick-action")}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-accent/35 bg-accent/15 px-2.5 text-[11px] font-semibold text-foreground shadow-[0_8px_18px_rgba(8,13,34,0.24)] transition-all hover:-translate-y-0.5 hover:border-accent/55 hover:bg-accent/22"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-accent">
          <path
            fill="currentColor"
            d="M20.59 13.41 12 22l-8.59-8.59A2 2 0 0 1 2.83 12L3 4h8a2 2 0 0 1 1.41.59l8.18 8.18a1 1 0 0 1 0 1.41ZM7.5 7A1.5 1.5 0 1 0 9 8.5 1.5 1.5 0 0 0 7.5 7Z"
          />
        </svg>
        {compact && <span className="font-mono">Add Deals</span>}
      </button>
      {isDemoAccount && (
        <>
          <button
            id="quick-action-add-txn"
            type="button"
            onClick={() => setShowTxnModal(true)}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-secondary/35 bg-secondary/16 px-2.5 text-[11px] font-semibold text-foreground shadow-[0_8px_18px_rgba(8,13,34,0.24)] transition-all hover:-translate-y-0.5 hover:border-secondary/55 hover:bg-secondary/24"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-3.5 w-3.5 text-secondary">
              <path
                fill="currentColor"
                d="M19 2H5a2 2 0 0 0-2 2v18l3-2 3 2 3-2 3 2 3-2 3 2V4a2 2 0 0 0-2-2Zm-2 13H7v-2h10Zm0-4H7V9h10Zm0-4H7V5h10Z"
              />
            </svg>
            {compact && <span className="font-mono">Add Txn</span>}
          </button>

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
        </>
      )}
    </div>
  );
}
