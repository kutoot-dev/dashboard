"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils/cn";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * 6-digit OTP input with auto-focus and paste support.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error,
  disabled,
  className,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (idx: number, char: string) => {
      if (!/^\d?$/.test(char)) return;
      const arr = value.split("");
      arr[idx] = char;
      const newValue = arr.join("").slice(0, length);
      onChange(newValue);

      // Auto-focus next
      if (char && idx < length - 1) {
        inputRefs.current[idx + 1]?.focus();
      }
    },
    [value, length, onChange],
  );

  const handleKeyDown = useCallback(
    (idx: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !value[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.focus();
      }
    },
    [value],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
      onChange(pasted);
      const nextIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIdx]?.focus();
    },
    [length, onChange],
  );

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex gap-2" onPaste={handlePaste}>
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[i] || ""}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={disabled}
            className={cn(
              "w-11 h-12 text-center text-lg font-mono rounded-md border",
              "bg-card text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-error" : "border-border",
            )}
          />
        ))}
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
