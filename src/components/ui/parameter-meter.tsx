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
  if (value > 75) return "bg-gain";
  if (value > 50) return "bg-accent";
  if (value > 25) return "bg-warning";
  return "bg-loss";
}

function getTextColor(value: number): string {
  if (value > 75) return "text-gain";
  if (value > 50) return "text-accent";
  if (value > 25) return "text-warning";
  return "text-loss";
}

export function ParameterMeter({
  label,
  value,
  maxValue = 100,
  weight,
  description,
  className,
}: ParameterMeterProps) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const weightPct = Math.round(weight * 100);
  const contribution = (value * weight);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header: label + weight badge + contribution */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-foreground">{label}</span>
        {description && <InfoTooltip text={description} />}

        <div className="ml-auto flex items-center gap-2">
          {/* Weighted contribution */}
          <span className={cn("font-mono text-[10px] font-semibold", getTextColor(value))}>
            +{contribution.toFixed(1)} pts
          </span>
          {/* Weight badge with mini bar */}
          <div className="flex items-center gap-1.5 rounded-full bg-accent/5 border border-accent/10 px-2 py-0.5">
            <div className="w-10 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{ width: `${weightPct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] font-bold text-accent">
              {weightPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Main progress bar */}
      <div className="h-2 w-full rounded-full bg-border overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getBarColor(value))}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Footer: value + weight explanation */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground font-mono">
          {value.toFixed(2)} / {maxValue}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {value.toFixed(1)} × {weightPct}% = <span className={cn("font-semibold", getTextColor(value))}>{contribution.toFixed(1)}</span> of 100
        </span>
      </div>
    </div>
  );
}
