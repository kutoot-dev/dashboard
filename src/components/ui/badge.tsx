import { cn } from "@/lib/utils/cn";

type BadgeVariant =
  | "gain"
  | "loss"
  | "neutral"
  | "platinum"
  | "gold"
  | "silver"
  | "bronze"
  | "warning"
  | "accent";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gain: "bg-gain/15 text-gain",
  loss: "bg-loss/15 text-loss",
  neutral: "bg-muted text-muted-foreground",
  platinum: "bg-platinum/15 text-platinum",
  gold: "bg-gold/15 text-gold",
  silver: "bg-silver/15 text-silver",
  bronze: "bg-bronze/15 text-bronze",
  warning: "bg-warning/15 text-warning",
  accent: "bg-accent/15 text-accent",
};

export function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium font-mono",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
