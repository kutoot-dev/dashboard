import { cn } from "@/lib/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: "line" | "circle" | "rect";
}

export function Skeleton({ className, variant = "line" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-border",
        variant === "line" && "h-4 w-full rounded",
        variant === "circle" && "h-10 w-10 rounded-full",
        variant === "rect" && "h-24 w-full rounded-lg",
        className
      )}
    />
  );
}
