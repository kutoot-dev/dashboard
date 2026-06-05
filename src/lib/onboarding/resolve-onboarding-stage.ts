import type { MerchantStage, WizardStepId } from "@/lib/types";

/**
 * Resolve the backend MerchantStage to persist when a wizard step completes.
 */
export function resolveOnboardingStageForStep(
  step: WizardStepId,
  channel: string | null,
  visitOutcome: string | null,
): MerchantStage {
  if (channel === "merchant") {
    return matchMerchantSelfServeStage(step);
  }

  if (channel === "field_executive") {
    if (visitOutcome === "interested") {
      if (step === "bank") return "bank_details_submitted";
      if (step === "kyc") return "kyc_submitted";
      if (step === "basic_details" || step === "review") return "basic_details_submitted";
    }

    if (visitOutcome && visitOutcome !== "interested") {
      if (step === "review" || step === "basic_details") {
        return visitOutcome === "follow_up" ? "follow_up" : "lead";
      }
    }
  }

  return "in_progress";
}

function matchMerchantSelfServeStage(step: WizardStepId): MerchantStage {
  switch (step) {
    case "basic_details":
      return "basic_details_submitted";
    case "bank":
      return "bank_details_submitted";
    case "kyc":
    case "review":
      return "kyc_submitted";
    default:
      return "in_progress";
  }
}
