import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  /** Use solid background instead of glass effect */
  solid?: boolean;
}

export function Card({ className, children, hover, solid, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        solid
          ? "rounded-2xl border border-border/80 bg-card-solid p-4 shadow-[0_12px_28px_rgba(8,13,34,0.18)]"
          : "glass-card p-4",
        hover && "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(9,13,38,0.28)]",
        className
      )}
    >
      {children}
    </div>
  );
}
