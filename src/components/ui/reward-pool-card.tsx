"use client";

import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { useCountdown } from "@/lib/hooks/use-live-data";

interface RewardPoolCardProps {
  totalPool: number;
  merchantShare?: number;
  className?: string;
}

export function RewardPoolCard({ totalPool, merchantShare, className }: RewardPoolCardProps) {
  const { formatted } = useCountdown(23); // 11 PM = 23:00

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Today&apos;s Reward Pool
        </span>
        <InfoTooltip text="The daily reward pool is distributed among top-performing merchants every day at 11:00 PM. Your share depends on your rank and score." />
        <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-gain uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-gain" />
          </span>
          LIVE
        </span>
      </div>

      <div className="text-2xl font-bold text-gain font-mono">
        {formatINR(totalPool)}
      </div>

      <div className="text-xs text-muted-foreground">
        Payout in{" "}
        <span className="font-mono text-foreground">{formatted}</span>
      </div>

      {merchantShare != null && (
        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
          Your est. share:{" "}
          <span className="font-semibold text-foreground">
            {formatINR(merchantShare)}
          </span>
        </div>
      )}
    </div>
  );
}
