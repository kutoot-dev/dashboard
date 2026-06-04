import { forwardRef, type InputHTMLAttributes } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils/cn";

interface PhoneNumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  verified?: boolean;
}

export const PhoneNumberInput = forwardRef<HTMLInputElement, PhoneNumberInputProps>(
  ({ className, verified, disabled, value, ...props }, ref) => {
    const safeValue = value === null ? "" : value;

    return (
      <div
        className={cn(
          "flex h-10 items-stretch overflow-hidden rounded-xl border border-border/80 bg-card/75 shadow-[0_8px_20px_rgba(8,13,34,0.14)] transition-all",
          "focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent/45",
          disabled && "cursor-not-allowed opacity-60",
          className
        )}
      >
        <span
          aria-hidden
          className="flex shrink-0 items-center border-r border-border/80 bg-muted/30 px-3 text-sm font-medium tabular-nums text-muted-foreground"
        >
          +91
        </span>
        <input
          ref={ref}
          type="tel"
          inputMode="numeric"
          disabled={disabled}
          value={safeValue}
          className="min-w-0 flex-1 bg-transparent px-3 text-sm tabular-nums text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed"
          {...props}
        />
        {verified && (
          <span className="flex shrink-0 items-center gap-1.5 border-l border-border/80 bg-gain/10 px-3 text-xs font-semibold text-gain">
            <FontAwesomeIcon icon={faCircleCheck} className="size-3.5" aria-hidden />
            Verified
          </span>
        )}
      </div>
    );
  }
);

PhoneNumberInput.displayName = "PhoneNumberInput";
