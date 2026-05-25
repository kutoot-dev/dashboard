"use client";

import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Icon } from "@/components/ui/icon";
import { faCircleCheck } from "@/lib/icons";
import { cn } from "@/lib/utils/cn";

interface AchievementBadgeProps {
  icon: IconDefinition;
  name: string;
  description: string;
  unlocked: boolean;
  className?: string;
}

export function AchievementBadge({
  icon,
  name,
  description,
  unlocked,
  className,
}: AchievementBadgeProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all",
        unlocked
          ? "border-accent/30 bg-accent/5 neon-border-gain"
          : "border-border bg-muted/20 opacity-50 grayscale",
        className,
      )}
      title={description}
    >
      <Icon
        icon={icon}
        className={cn("h-5 w-5 text-accent", unlocked && "drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]")}
      />
      <div className="min-w-0">
        <p className={cn(
          "font-mono text-xs font-semibold truncate",
          unlocked ? "text-foreground" : "text-muted-foreground",
        )}>
          {name}
        </p>
        <p className="font-mono text-[10px] text-muted-foreground truncate">
          {description}
        </p>
      </div>
      {unlocked && (
        <Icon icon={faCircleCheck} className="ml-auto h-4 w-4 shrink-0 text-accent" />
      )}
    </div>
  );
}
