import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, value, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    const safeValue = value === null ? "" : value;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-muted-foreground"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-10 rounded-xl border border-border/80 bg-card/75 px-3 text-sm text-foreground placeholder:text-muted-foreground shadow-[0_8px_20px_rgba(8,13,34,0.14)] transition-all",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/45",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
          value={safeValue}
        />
      </div>
    );
  }
);

Input.displayName = "Input";
