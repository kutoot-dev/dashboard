"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Card } from "@/components/ui/card";

type StatVariant = "default" | "gold" | "accent" | "muted";

interface BonusPayoutStatCardProps {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
  icon?: ReactNode;
  variant?: StatVariant;
  footer?: ReactNode;
  className?: string;
}

const variantClasses: Record<StatVariant, string> = {
  default: "border-border/70 bg-card/50",
  gold: "border-gold/35 bg-gradient-to-br from-gold/12 via-card/40 to-transparent",
  accent: "border-accent/30 bg-gradient-to-br from-accent/10 via-card/40 to-transparent",
  muted: "border-border/60 bg-muted/20",
};

export function BonusPayoutStatCard({
  label,
  value,
  helper,
  icon,
  variant = "default",
  footer,
  className,
}: BonusPayoutStatCardProps) {
  return (
    <Card
      hover
      className={cn(
        "relative overflow-hidden p-5 transition-shadow",
        variantClasses[variant],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
            {value}
          </p>
          {helper ? <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{helper}</p> : null}
        </div>
        {icon ? (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/50 bg-background/40 text-lg shadow-inner"
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>
      {footer ? <div className="mt-3 border-t border-border/50 pt-3">{footer}</div> : null}
    </Card>
  );
}
