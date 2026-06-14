"use client";

import { cn } from "@/lib/utils/cn";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { FieldInfo } from "@/lib/constants/onboarding";

interface FieldWithInfoProps {
  fieldInfo: FieldInfo;
  error?: string;
  required?: boolean;
  showTooltip?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper that places a label + info tooltip above any input element.
 * Shows validation errors below.
 */
export function FieldWithInfo({
  fieldInfo,
  error,
  required,
  showTooltip = true,
  children,
  className,
}: FieldWithInfoProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {fieldInfo.label}
        {required && <span className="text-error">*</span>}
        {showTooltip ? (
          <InfoTooltip
            text={`${fieldInfo.tooltip.title}: ${fieldInfo.tooltip.description} Example: ${fieldInfo.tooltip.example}. ${fieldInfo.tooltip.whyNeeded}`}
          />
        ) : null}
      </label>
      {children}
      {error && (
        <p className="text-xs text-error mt-1">{error}</p>
      )}
    </div>
  );
}
