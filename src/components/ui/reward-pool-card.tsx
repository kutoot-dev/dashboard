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
  const { formatted } = useCountdown(23);

  return (
    <div className={cn("rounded-lg border border-border bg-card p-2.5 space-y-1", className)}>
      <div className="flex items-center gap-1.5">
        <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Reward Pool
        </p>
        <InfoTooltip text="The daily reward pool is distributed among top-performing merchants every day at 11:00 PM. Your share depends on your rank and score." />
        <span className="ml-auto flex items-center gap-1 font-mono text-[9px] font-semibold text-gain">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gain opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gain" />
          </span>
          LIVE
        </span>
      </div>

      <div className="font-mono text-xl font-bold text-gain">{formatINR(totalPool)}</div>

      <div className="font-mono text-[9px] text-muted-foreground">
        {merchantShare != null ? (
          <>
            Share <span className="text-foreground">{formatINR(merchantShare)}</span> · {formatted}
          </>
        ) : (
          <>Payout in {formatted}</>
        )}
      </div>
    </div>
  );
}
