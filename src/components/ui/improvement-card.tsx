"use client";

import { cn } from "@/lib/utils/cn";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { IMPROVEMENT_TIPS } from "@/lib/constants/scoring";

interface ImprovementCardProps {
  weakestScores: { key: string; value: number; label: string }[];
  className?: string;
}

function getColor(value: number) {
  if (value < 5) return "text-loss";
  if (value < 10) return "text-warning";
  return "text-accent";
}

function getBorderColor(value: number) {
  if (value < 5) return "border-loss/30";
  if (value < 10) return "border-warning/30";
  return "border-accent/30";
}

export function ImprovementCard({ weakestScores, className }: ImprovementCardProps) {
  const items = weakestScores.slice(0, 3);

  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-4",
        className
      )}
    >
      <div className="flex items-center gap-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          Where to Improve
        </h3>
        <InfoTooltip text="Focus on these areas to boost your ranking and earn more rewards." />
      </div>

      <div className="space-y-3">
        {items.map(({ key, value, label }) => {
          const tips = IMPROVEMENT_TIPS[key] ?? [];
          return (
            <div
              key={key}
              className={cn(
                "rounded-md border p-3 space-y-2",
                getBorderColor(value),
                "bg-card"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn("text-xs font-semibold", getColor(value))}>
                  {label}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {value.toFixed(1)} / 20
                </span>
              </div>

              <ul className="space-y-1">
                {tips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 shrink-0">💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground italic">
        Focus on these areas to boost your ranking and earn more rewards
      </p>
    </div>
  );
}
