"use client";

import { cn } from "@/lib/utils/cn";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { IMPROVEMENT_TIPS, SUB_SCORE_WEIGHTS } from "@/lib/constants/scoring";

interface ImprovementCardProps {
  weakestScores: { key: string; value: number; label: string }[];
  className?: string;
}

function getColor(value: number) {
  if (value < 25) return "text-loss";
  if (value < 50) return "text-warning";
  return "text-accent";
}

function getBorderColor(value: number) {
  if (value < 25) return "border-loss/30";
  if (value < 50) return "border-warning/30";
  return "border-accent/30";
}

function getBgColor(value: number) {
  if (value < 25) return "bg-loss/5";
  if (value < 50) return "bg-warning/5";
  return "bg-accent/5";
}

function getNextTarget(value: number): { target: number; tier: string } {
  if (value < 25) return { target: 25, tier: "Bronze" };
  if (value < 50) return { target: 50, tier: "Silver" };
  if (value < 75) return { target: 75, tier: "Gold" };
  return { target: 100, tier: "Platinum" };
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
        <InfoTooltip text="Focus on these areas to boost your ranking and earn more rewards. Each shows a target to reach and the estimated score impact." />
      </div>

      <div className="space-y-3">
        {items.map(({ key, value, label }) => {
          const tips = IMPROVEMENT_TIPS[key] ?? [];
          const { target, tier } = getNextTarget(value);
          const gap = target - value;
          const weight = SUB_SCORE_WEIGHTS[key] ?? 0;
          const scoreImpact = gap * weight;

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
                  {value.toFixed(1)} / 100
                </span>
              </div>

              {/* Target section */}
              <div className={cn("rounded-md px-2.5 py-2 space-y-1.5", getBgColor(value))}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    🎯 Target: {tier}
                  </span>
                  <span className={cn("text-[10px] font-mono font-bold", getColor(value))}>
                    Reach {target}/100
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Progress towards target */}
                  <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        value < 25 ? "bg-loss" : value < 50 ? "bg-warning" : "bg-accent"
                      )}
                      style={{ width: `${(value / target) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                    {gap.toFixed(0)} pts away
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Improving by <span className="font-semibold text-foreground">{gap.toFixed(0)} pts</span> here adds{" "}
                  <span className="font-semibold text-gain">+{scoreImpact.toFixed(1)}</span> to your total score
                </p>
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
        Reaching the next tier in any area directly boosts your total score and rank
      </p>
    </div>
  );
}
