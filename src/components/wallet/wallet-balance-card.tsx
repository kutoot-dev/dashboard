"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/format";
import type { WalletSummary } from "@/lib/types/wallet";

interface WalletBalanceCardProps {
  wallet: WalletSummary;
  onWithdraw: () => void;
  withdrawDisabled?: boolean;
}

export function WalletBalanceCard({
  wallet,
  onWithdraw,
  withdrawDisabled,
}: WalletBalanceCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm text-muted-foreground">Available balance</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-foreground">
        {formatINR(wallet.available_balance)}
      </p>
      {wallet.locked_balance > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          {formatINR(wallet.locked_balance)} pending withdrawal
        </p>
      ) : null}
      {wallet.registration_bonus_granted ? (
        <p className="mt-1 text-xs text-muted-foreground">
          Promotional wallet active
        </p>
      ) : null}
      <Button
        type="button"
        className="mt-4"
        onClick={onWithdraw}
        disabled={withdrawDisabled || wallet.available_balance <= 0}
      >
        Withdraw
      </Button>
      {wallet.has_pending_withdrawal ? (
        <p className="mt-2 text-xs text-warning">
          You already have a withdrawal request in progress.
        </p>
      ) : null}
    </Card>
  );
}
