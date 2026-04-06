import { RANK_TIERS } from "@/lib/constants/theme";
import type { RankTier } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

interface RankBadgeProps {
  rank: number;
  totalMerchants: number;
}

function computeTier(rank: number, total: number): RankTier {
  const percentile = (rank / total) * 100;
  if (percentile <= RANK_TIERS.platinum.maxPercentile) return "platinum";
  if (percentile <= RANK_TIERS.gold.maxPercentile) return "gold";
  if (percentile <= RANK_TIERS.silver.maxPercentile) return "silver";
  if (percentile <= RANK_TIERS.bronze.maxPercentile) return "bronze";
  return "none";
}

export function RankBadge({ rank, totalMerchants }: RankBadgeProps) {
  const tier = computeTier(rank, totalMerchants);
  if (tier === "none") return null;

  const config = RANK_TIERS[tier];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-mono font-semibold",
        config.color,
        config.bg,
        config.border,
        tier === "platinum" && "animate-pulse"
      )}
    >
      {tier === "platinum" && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          <path d="M6 1l1.545 3.13L11 4.635 8.5 7.07l.59 3.43L6 8.885 2.91 10.5l.59-3.43L1 4.635l3.455-.505z" />
        </svg>
      )}
      {config.label}
    </span>
  );
}
