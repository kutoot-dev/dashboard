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
  title?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  gain: "border border-gain/35 bg-gain/14 text-gain",
  loss: "border border-loss/35 bg-loss/14 text-loss",
  neutral: "border border-border/70 bg-muted/65 text-muted-foreground",
  platinum: "border border-platinum/35 bg-platinum/14 text-platinum",
  gold: "border border-gold/35 bg-gold/14 text-gold",
  silver: "border border-silver/35 bg-silver/14 text-silver",
  bronze: "border border-bronze/35 bg-bronze/14 text-bronze",
  warning: "border border-warning/35 bg-warning/14 text-warning",
  accent: "border border-accent/35 bg-accent/14 text-accent",
};

export function Badge({ variant, children, className, title }: BadgeProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold font-mono",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
