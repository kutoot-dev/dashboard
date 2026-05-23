import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export interface DashboardStat {
  label: string;
  value: string;
  helper: string;
  /** Highlights the primary KPI (e.g. net amount) on small screens. */
  emphasis?: boolean;
}

interface DashboardStatsGridProps {
  stats: DashboardStat[];
  className?: string;
}

export function DashboardStatsGrid({ stats, className }: DashboardStatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4",
        className,
      )}
      role="list"
      aria-label="Today's sales summary"
    >
      {stats.map((stat) => (
        <Card
          key={stat.label}
          role="listitem"
          className={cn(
            "min-w-0 border border-accent/28 bg-card/70 p-3 sm:p-4",
            stat.emphasis && "border-primary/35 bg-primary/6 ring-1 ring-primary/20",
          )}
        >
          <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px] sm:tracking-[0.16em]">
            {stat.label}
          </p>
          <p
            className={cn(
              "mt-1.5 font-tabular text-lg font-semibold text-foreground sm:mt-2 sm:text-xl",
              stat.emphasis && "text-primary",
            )}
          >
            {stat.value}
          </p>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:mt-2 sm:text-xs">
            {stat.helper}
          </p>
        </Card>
      ))}
    </div>
  );
}
