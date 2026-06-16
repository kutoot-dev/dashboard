import type { WizardStepId } from "@/lib/types";
import { getActiveOnboardingSteps } from "./get-active-steps";

/** Infer completed steps from the saved current step when the API omits them. */
export function inferCompletedSteps(
  currentStep: WizardStepId | null | undefined,
  channel: string | null | undefined,
  visitOutcome: string | null | undefined,
): WizardStepId[] {
  const activeSteps = getActiveOnboardingSteps(channel ?? null, visitOutcome ?? null);
  if (!currentStep) return [];

  const currentIndex = activeSteps.indexOf(currentStep);
  if (currentIndex <= 0) return [];

  return activeSteps.slice(0, currentIndex);
}
