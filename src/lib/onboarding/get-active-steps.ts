import type { WizardStepId } from "@/lib/types";

/** Active wizard steps for merchant / field-executive onboarding. */
export function getActiveOnboardingSteps(
  channel: string | null,
  visitOutcome: string | null,
): WizardStepId[] {
  if (channel === "merchant") {
    return ["identity", "basic_details", "discount_program", "bank", "kyc", "review"];
  }
  if (channel === "field_executive") {
    if (visitOutcome === "interested") {
      return ["identity", "visit_outcome", "basic_details", "discount_program", "review"];
    }
    if (visitOutcome === null) {
      return ["identity", "visit_outcome"];
    }
    return ["identity", "visit_outcome", "basic_details", "review"];
  }
  return ["identity"];
}
