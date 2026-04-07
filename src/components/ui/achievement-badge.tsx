"use client";

import { cn } from "@/lib/utils/cn";

interface AchievementBadgeProps {
  icon: string;
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
      <span className={cn("text-xl", unlocked && "drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]")}>
        {icon}
      </span>
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
        <svg className="ml-auto h-4 w-4 shrink-0 text-accent" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )}
    </div>
  );
}
