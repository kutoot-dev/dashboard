"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/layout/page-header";
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card";
import { WalletWithdrawWizard } from "@/components/wallet/wallet-withdraw-wizard";
import { WalletWithdrawalHistory } from "@/components/wallet/wallet-withdrawal-history";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import {
  getWallet,
  getWithdrawals,
} from "@/lib/api/services/wallet.service";
import type { WalletSummary } from "@/lib/types/wallet";
import { formatINR } from "@/lib/utils/format";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const branchId = useEffectiveBranchId();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const needsWalletKyc = Boolean(user?.requires_wallet_kyc);

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

  const wallet: WalletSummary | null = walletQuery.data?.success
    ? walletQuery.data.data
    : null;
  const withdrawals =
    withdrawalsQuery.data?.success ? withdrawalsQuery.data.data?.items ?? [] : [];

  const refetchAll = () => {
    walletQuery.refetch();
    withdrawalsQuery.refetch();
    void refreshUser();
  };

  useEffect(() => {
    if (needsWalletKyc && branchId) {
      setWithdrawOpen(true);
    }
  }, [needsWalletKyc, branchId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wallet"
        subtitle="Promotional balance and withdrawal requests"
      />

      {needsWalletKyc ? (
        <Card className="border-primary/30 bg-primary/5 p-6">
          <h2 className="text-sm font-semibold text-foreground">Complete payout details</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Before you can use your wallet for withdrawals, add your bank account, PAN, Aadhaar,
            optional GST or enrollment number, and upload the required documents.
          </p>
          <Button type="button" className="mt-4" onClick={() => setWithdrawOpen(true)}>
            Add bank & KYC details
          </Button>
        </Card>
      ) : null}

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
