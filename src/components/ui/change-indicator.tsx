import { cn } from "@/lib/utils/cn";

interface ChangeIndicatorProps {
  value: number;
  suffix?: string;
}

export function ChangeIndicator({ value, suffix = "%" }: ChangeIndicatorProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 font-mono text-xs font-tabular",
        isPositive && "text-gain",
        isNegative && "text-loss",
        !isPositive && !isNegative && "text-muted-foreground"
      )}
    >
      {(isPositive || isNegative) && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
          {isPositive ? (
            <path d="M6 2l4 5H2z" />
          ) : (
            <path d="M6 10L2 5h8z" />
          )}
        </svg>
      )}
      {isPositive && "+"}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}
