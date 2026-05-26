"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { faReceipt, faXmark } from "@/lib/icons";
import { useTransactionAlertStore } from "@/lib/stores/transaction-alert.store";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const AUTO_DISMISS_MS = 8_000;

/**
 * Floating popover for live merchant transactions (Reverb `transaction.created`).
 * Mounted once in AppShell; driven by `useTransactionAlertStore`.
 */
export function TransactionAlertPopover() {
  const alert = useTransactionAlertStore((s) => s.alert);
  const dismiss = useTransactionAlertStore((s) => s.dismiss);

  useEffect(() => {
    if (!alert) return;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [alert, dismiss]);

  const txn = alert?.transaction;
  const initial =
    txn?.customer_initial?.trim() ||
    (txn?.customer_name ? txn.customer_name.charAt(0).toUpperCase() : "?");

  return (
    <AnimatePresence>
      {alert && txn && (
        <motion.div
          key={alert.id}
          role="alertdialog"
          aria-labelledby="txn-alert-title"
          aria-describedby="txn-alert-desc"
          initial={{ opacity: 0, y: -16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 420, damping: 32 }}
          className={cn(
            "pointer-events-auto fixed z-[9998] w-[min(100vw-2rem,22rem)]",
            "right-4 top-[calc(4.25rem+env(safe-area-inset-top,0px))]",
            "sm:top-20",
          )}
        >
          <div className="glass-card overflow-hidden rounded-2xl border border-gain/50 shadow-2xl shadow-gain/15">
            <div className="bg-linear-to-r from-gain/20 via-gain/10 to-transparent px-4 py-3">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gain/25 font-display text-lg font-bold text-gain ring-2 ring-gain/30"
                  aria-hidden
                >
                  {initial}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    id="txn-alert-title"
                    className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gain"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-gain" />
                    </span>
                    New payment received
                  </p>
                  <p className="mt-0.5 truncate text-base font-semibold text-foreground">
                    {txn.customer_name ?? "Walk-in customer"}
                  </p>
                  <p id="txn-alert-desc" className="mt-1 font-display text-2xl font-bold tabular-nums text-foreground">
                    {formatINR(txn.total_paid)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={dismiss}
                  className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
                  aria-label="Dismiss alert"
                >
                  <Icon icon={faXmark} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/60 px-4 py-3 text-sm">
              {txn.discount_applied > 0 && (
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>Discount</span>
                  <span className="font-medium text-gain">−{formatINR(txn.discount_applied)}</span>
                </div>
              )}
              <div className="flex justify-between gap-2 text-muted-foreground">
                <span>Bill amount</span>
                <span className="font-medium text-foreground">{formatINR(txn.bill_amount)}</span>
              </div>
              {txn.coupon_code && (
                <div className="flex justify-between gap-2 text-muted-foreground">
                  <span>Coupon</span>
                  <span className="truncate font-medium text-accent">{txn.coupon_code}</span>
                </div>
              )}
            </div>

            <div className="flex border-t border-border/60">
              <Link
                href="/transactions"
                onClick={dismiss}
                className="flex flex-1 items-center justify-center gap-2 py-2.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10"
              >
                <Icon icon={faReceipt} className="h-3.5 w-3.5" />
                View transactions
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
