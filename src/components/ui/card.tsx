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
