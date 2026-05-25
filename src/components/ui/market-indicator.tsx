"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Icon } from "@/components/ui/icon";
import { faCaretDown, faCaretUp, faCircle } from "@/lib/icons";
import { cn } from "@/lib/utils/cn";
import { COMMON } from "@/lib/constants/strings";

type MarketTrend = "bull" | "bear" | "sideways";

interface MarketIndicatorProps {
  trend: MarketTrend;
  size?: "sm" | "md";
  className?: string;
}

const TREND_CONFIG: Record<
  MarketTrend,
  { label: string; icon: IconDefinition; color: string; bgColor: string; desc: string }
> = {
  bull: {
    label: COMMON.BULL,
    icon: faCaretUp,
    color: "text-gain neon-gain",
    bgColor: "bg-gain/10",
    desc: COMMON.MARKET_BULL_DESC,
  },
  bear: {
    label: COMMON.BEAR,
    icon: faCaretDown,
    color: "text-loss neon-loss",
    bgColor: "bg-loss/10",
    desc: COMMON.MARKET_BEAR_DESC,
  },
  sideways: {
    label: COMMON.SIDEWAYS,
    icon: faCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/20",
    desc: COMMON.MARKET_SIDEWAYS_DESC,
  },
};

export function MarketIndicator({ trend, size = "sm", className }: MarketIndicatorProps) {
  const config = TREND_CONFIG[trend];
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono",
        config.bgColor,
        "border-current/20",
        config.color,
        size === "md" ? "text-xs" : "text-[10px]",
        className,
      )}
      title={config.desc}
    >
      <Icon icon={config.icon} className="h-3 w-3" />
      <span className="font-semibold uppercase tracking-wider">{config.label}</span>
    </div>
  );
}

/** Determine market trend from a percentage change */
export function computeTrend(changePercent: number): MarketTrend {
  if (changePercent > 0.5) return "bull";
  if (changePercent < -0.5) return "bear";
  return "sideways";
}
