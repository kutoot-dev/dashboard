import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, value, onChange, placeholder, ...props }, ref) => {
    return (
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt, index) => (
          <option key={`${opt.value}-${opt.label}-${index}`} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);

Select.displayName = "Select";
