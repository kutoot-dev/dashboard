import { onboardingService } from "@/lib/api/services";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import type { ApplicationSummary, OnboardingApplication, WizardStepId } from "@/lib/types";
import { inferCompletedSteps } from "./infer-completed-steps";

type LoadFromApplicationPayload = Parameters<
  ReturnType<typeof useOnboardingStore.getState>["loadFromApplication"]
>[0];

type ResumeListItem = ApplicationSummary;

function mergeApplications(...lists: ResumeListItem[][]) {
  const byId = new Map<string, ResumeListItem>();

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const app of list) {
      byId.set(app.application_id, app);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const aTimeRaw = Date.parse(a?.updated_at ?? "");
    const bTimeRaw = Date.parse(b?.updated_at ?? "");
    const aTime = Number.isFinite(aTimeRaw) ? aTimeRaw : 0;
    const bTime = Number.isFinite(bTimeRaw) ? bTimeRaw : 0;
    return bTime - aTime;
  });
}

function toResumePayload(app: ResumeListItem) {
  return {
    ...app,
    application_id: app.application_id,
    current_step: app.current_step,
    completed_steps:
      app.completed_steps && Array.isArray(app.completed_steps)
        ? app.completed_steps
        : inferCompletedSteps(app.current_step, app.channel, app.visit_outcome ?? null),
  };
}

function buildHydrationPayload(
  fullApp: OnboardingApplication,
  applicationId: string,
  options?: { preserveCurrentStep?: boolean },
) {
  const state = useOnboardingStore.getState();
  const completedSteps =
    Array.isArray(fullApp.completed_steps) && fullApp.completed_steps.length > 0
      ? fullApp.completed_steps
      : inferCompletedSteps(
          fullApp.current_step,
          fullApp.channel,
          fullApp.visit_outcome ?? null,
        );

  const appRecord = fullApp as unknown as Record<string, unknown>;

  return {
    ...(appRecord),
    application_id: applicationId,
    resume_inventory_handover: false,
    current_step: options?.preserveCurrentStep
      ? state.currentStep
      : fullApp.current_step,
    completed_steps: completedSteps as WizardStepId[],
    merchant_phone_verified:
      typeof appRecord.phone_verified === "boolean"
        ? appRecord.phone_verified
        : state.formData.merchant_phone_verified,
    owner_email_verified:
      typeof appRecord.email_verified === "boolean"
        ? appRecord.email_verified
        : state.formData.owner_email_verified,
  } as LoadFromApplicationPayload;
}

/** Load full application detail into the onboarding store. */
export async function hydrateOnboardingFromApplication(
  applicationId: string,
  options?: { preserveCurrentStep?: boolean },
): Promise<boolean> {
  try {
    const detail = await onboardingService.getApplication(applicationId);
    const fullApp = detail.data ?? null;
    if (!fullApp) {
      return false;
    }

    useOnboardingStore
      .getState()
      .loadFromApplication(buildHydrationPayload(fullApp, applicationId, options));
    return true;
  } catch {
    return false;
  }
}

/** Find the latest application for a phone and hydrate the onboarding store. */
export async function hydrateOnboardingFromPhone(
  phone: string,
  options?: { preserveCurrentStep?: boolean },
): Promise<boolean> {
  const normalizedPhone = phone.replace(/\D/g, "").slice(-10);
  if (normalizedPhone.length !== 10) {
    return false;
  }

  try {
    const [res, leadRes, includeFinalRes] = await Promise.all([
      onboardingService.listApplications({ phone: normalizedPhone }),
      onboardingService.listApplications({ phone: normalizedPhone, stage: "lead" }),
      onboardingService.listApplications({ phone: normalizedPhone, include_final: true }),
    ]);

    const candidateApps = mergeApplications(
      Array.isArray(res.data?.items) ? res.data.items : [],
      Array.isArray(leadRes.data?.items) ? leadRes.data.items : [],
      Array.isArray(includeFinalRes.data?.items) ? includeFinalRes.data.items : [],
    );

    if (candidateApps.length === 0) {
      return false;
    }

    const app = candidateApps[0];
    const existingId = useOnboardingStore.getState().applicationId;
    if (existingId === app.application_id) {
      return hydrateOnboardingFromApplication(app.application_id, options);
    }

    useOnboardingStore.getState().loadFromApplication(toResumePayload(app));
    return hydrateOnboardingFromApplication(app.application_id, options);
  } catch {
    return false;
  }
}
