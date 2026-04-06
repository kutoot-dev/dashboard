import { cn } from "@/lib/utils/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        hover && "transition-colors hover:bg-card-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
