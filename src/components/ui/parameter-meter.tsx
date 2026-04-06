"use client";

import { cn } from "@/lib/utils/cn";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface ParameterMeterProps {
  label: string;
  value: number;
  maxValue?: number;
  weight: number;
  description?: string;
  className?: string;
}

function getBarColor(value: number): string {
  if (value > 15) return "bg-gain";
  if (value > 10) return "bg-accent";
  if (value > 5) return "bg-warning";
  return "bg-loss";
}

export function ParameterMeter({
  label,
  value,
  maxValue = 20,
  weight,
  description,
  className,
}: ParameterMeterProps) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const weightPct = Math.round(weight * 100);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {description && <InfoTooltip text={description} />}
        <span className="ml-auto rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
          {weightPct}%
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(value))}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="text-[10px] text-muted-foreground font-mono">
        {value.toFixed(2)} / {maxValue}
      </div>
    </div>
  );
}
