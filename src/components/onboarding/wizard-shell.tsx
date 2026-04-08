"use client";

import { cn } from "@/lib/utils/cn";
import { WIZARD_STEP_CONFIG } from "@/lib/types";
import type { WizardStepId, WizardStepConfig } from "@/lib/types";

interface WizardShellProps {
  currentStep: WizardStepId;
  completedSteps: WizardStepId[];
  stepConfig?: WizardStepConfig[];   // defaults to full WIZARD_STEP_CONFIG
  onStepClick?: (step: WizardStepId) => void;
  children: React.ReactNode;
}

/**
 * Wizard shell with step progress indicator and navigation.
 * Pass a filtered `stepConfig` to show only the steps relevant
 * to the current channel / visit flow.
 */
export function WizardShell({
  currentStep,
  completedSteps,
  stepConfig = WIZARD_STEP_CONFIG,
  onStepClick,
  children,
}: WizardShellProps) {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step progress bar */}
      <nav className="mb-8" aria-label="Wizard progress">
        {/* Mobile: compact */}
        <div className="flex sm:hidden items-center justify-between mb-4 px-1">
          {stepConfig.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isComplete = completedSteps.includes(step.id);
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if ((isComplete || isActive) && onStepClick) onStepClick(step.id);
                }}
                disabled={!isComplete && !isActive}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isActive && "bg-primary text-white ring-2 ring-primary/30",
                  isComplete && !isActive && "bg-success text-white",
                  !isActive && !isComplete && "bg-card border border-border text-muted-foreground",
                )}
              >
                {isComplete && !isActive ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop: full labels */}
        <div className="hidden sm:flex items-start">
          {stepConfig.map((step, idx) => {
            const isActive = step.id === currentStep;
            const isComplete = completedSteps.includes(step.id);
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center relative">
                {/* Connector line */}
                {idx > 0 && (
                  <div
                    className={cn(
                      "absolute top-4 -left-1/2 w-full h-0.5",
                      isComplete || isActive ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    if ((isComplete || isActive) && onStepClick) onStepClick(step.id);
                  }}
                  disabled={!isComplete && !isActive}
                  className={cn(
                    "relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    isActive && "bg-primary text-white ring-2 ring-primary/30 scale-110",
                    isComplete && !isActive && "bg-success text-white cursor-pointer hover:scale-105",
                    !isActive && !isComplete && "bg-card border border-border text-muted-foreground cursor-not-allowed",
                  )}
                >
                  {isComplete && !isActive ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </button>
                <p
                  className={cn(
                    "mt-2 text-xs text-center leading-tight",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Step content */}
      <div className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-sm">
        {children}
      </div>
    </div>
  );
}
