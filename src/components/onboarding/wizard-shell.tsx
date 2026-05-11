"use client";

import { cn } from "@/lib/utils/cn";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
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
  const currentStepMeta = stepConfig.find((s) => s.id === currentStep);
  const currentStepIndex = stepConfig.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Step progress bar */}
      <nav className="mb-8" aria-label="Wizard progress">
        {/* Mobile: compact */}
        <div className="flex sm:hidden items-center justify-between mb-3 px-1">
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
                  <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}
        </div>
        {currentStepMeta && (
          <p
            className="sm:hidden -mt-1 mb-4 text-center text-xs font-semibold leading-snug text-primary px-2"
            aria-current="step"
          >
            {currentStepIndex >= 0 && (
              <span className="text-muted-foreground font-normal">
                Step {currentStepIndex + 1} of {stepConfig.length}
                {" · "}
              </span>
            )}
            {currentStepMeta.label}
          </p>
        )}

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
                    <FontAwesomeIcon icon={faCheck} className="w-3 h-3" />
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

      {/* Step content — transparent glass over layout gradient */}
      <div className="glass-card-transparent rounded-2xl p-5 sm:p-8">
        {children}
      </div>
    </div>
  );
}
