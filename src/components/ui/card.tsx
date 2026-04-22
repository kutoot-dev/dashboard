import { cn } from "@/lib/utils/cn";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  /** Use solid background instead of glass effect */
  solid?: boolean;
}

export function Card({ className, children, hover, solid }: CardProps) {
  return (
    <div
      className={cn(
        solid
          ? "rounded-xl border border-border bg-card-solid p-4"
          : "glass-card p-4",
        hover && "transition-all hover:scale-[1.005] hover:shadow-lg",
        className
      )}
    >
      {children}
    </div>
  );
}
