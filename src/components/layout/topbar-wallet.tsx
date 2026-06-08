"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@/components/ui/icon";
import { faWallet } from "@/lib/icons";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { getWallet } from "@/lib/api/services/wallet.service";
import { formatINR } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function TopbarWallet() {
  const branchId = useEffectiveBranchId();

  const walletQuery = useQuery({
    queryKey: ["wallet", branchId],
    queryFn: () => getWallet(branchId),
    enabled: Boolean(branchId),
  });

  const balance = walletQuery.data?.success
    ? walletQuery.data.data.available_balance
    : null;

  if (!branchId) {
    return null;
  }

  return (
    <Link
      href="/wallet"
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/80 bg-card/70 px-3 py-2",
        "text-xs font-semibold text-foreground shadow-[0_10px_24px_rgba(8,13,34,0.22)]",
        "transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:bg-card/90",
      )}
      aria-label="Wallet"
    >
      <Icon icon={faWallet} className="h-4 w-4 text-accent" aria-hidden />
      <span className="hidden font-tabular sm:inline">Wallet</span>
      <span className="font-tabular text-foreground">
        {walletQuery.isLoading ? "…" : balance !== null ? formatINR(balance) : "—"}
      </span>
    </Link>
  );
}
