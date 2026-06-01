"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { WalletWithdrawWizard } from "@/components/wallet/wallet-withdraw-wizard";
import { WalletWithdrawalHistory } from "@/components/wallet/wallet-withdrawal-history";
import { Card } from "@/components/ui/card";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import {
  getWallet,
  getWithdrawals,
} from "@/lib/api/services/wallet.service";
import { formatINR } from "@/lib/utils/format";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";

export default function WalletPage() {
  const branchId = useEffectiveBranchId();
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const walletQuery = useQuery({
    queryKey: ["wallet", branchId],
    queryFn: () => getWallet(branchId),
    enabled: Boolean(branchId),
  });

  const withdrawalsQuery = useQuery({
    queryKey: ["wallet-withdrawals", branchId],
    queryFn: () => getWithdrawals(branchId),
    enabled: Boolean(branchId),
  });

  const wallet = walletQuery.data?.success ? walletQuery.data.data : null;
  const withdrawals =
    withdrawalsQuery.data?.success ? withdrawalsQuery.data.data?.items ?? [] : [];

  const refetchAll = () => {
    walletQuery.refetch();
    withdrawalsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Promotional balance and withdrawal requests"
      />

      {walletQuery.isLoading ? (
        <StatCardsSkeleton count={1} />
      ) : wallet ? (
        <WalletBalanceCard
          wallet={wallet}
          onWithdraw={() => setWithdrawOpen(true)}
          withdrawDisabled={wallet.has_pending_withdrawal}
        />
      ) : (
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            {walletQuery.isError
              ? "Could not load wallet. Please try again later."
              : "No wallet data available."}
          </p>
        </Card>
      )}

      {wallet && wallet.recent_transactions.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
          <ul className="mt-4 space-y-2">
            {wallet.recent_transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between text-sm text-muted-foreground"
              >
                <span className="capitalize">{tx.type.replace(/_/g, " ")}</span>
                <span>
                  {tx.amount >= 0 ? "+" : ""}
                  {formatINR(tx.amount)}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <WalletWithdrawalHistory items={withdrawals} />

      {branchId ? (
        <WalletWithdrawWizard
          merchantId={branchId}
          isOpen={withdrawOpen}
          onClose={() => setWithdrawOpen(false)}
          onSuccess={refetchAll}
        />
      ) : null}
    </div>
  );
}
