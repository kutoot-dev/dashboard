/**
 * Onboarding Store
 *
 * Zustand store for wizard state management.
 * All PII stays in-memory only — no localStorage persistence.
 * Draft persistence is server-side via PATCH API.
 */
import { create } from "zustand";
import type {
  WizardStepId,
  ApplicationChannel,
  CommissionModel,
  CommissionTier,
  VisitOutcome,
  FollowUpSchedule,
  HandoverInventoryItem,
} from "@/lib/types";
import type { DiscountProgramBand } from "@/lib/api/services/merchant.service";
import { WIZARD_STEPS } from "@/lib/types";

interface OnboardingFormData {
  // Step 1
  channel: ApplicationChannel | null;
  exec_id: string | null;
  exec_name: string | null;
  exec_employee_code: string | null;
  merchant_phone_verified: boolean;
  merchant_otp_phone: string;

  // Step 2
  phone: string;
  owner_name: string;
  owner_email: string;
  owner_email_verified: boolean;
  legal_name: string;
  shop_name: string;
  google_maps_link: string;
  door_no: string;
  shop_no: string;
  year_of_establishment: string;
  business_ownership_type: string;
  sector_id: string;
  sector_name: string;
  locality: string;
  state_id: string;
  city_id: string;
  city: string;
  state: string;
  pin_code: string;
  referral_code: string;
  merchant_referral_code: string;
  lead_source_id: string;
  branch_name: string;
  storefront_photo_url: string | null;
  storefront_photo_urls: string[];
  storefront_photo_status: "pending" | "uploaded" | "failed";
  gps_lat: number | null;
  gps_long: number | null;
  gps_accuracy: number | null;

  // Discount program (merchant-funded bill discounts)
  discount_program_enabled: boolean;
  discount_program_max_percentage: number | null;
  minimum_bill_amount_for_discount: number | null;
  policy_max_discount_percentage: number | null;
  discount_bands: DiscountProgramBand[];

  // Step 3
  commission_rate: number | null;
  minimum_commission_percentage: number | string | null;
  commission_model: CommissionModel | null;
  commission_tiers: CommissionTier[] | null;
  commission_agreed: boolean;

  // Step 4
  gst_number: string;
  gst_enrollment_number: string;
  gst_registration_status: string;
  gst_status: string;
  gst_business_name: string | null;
  gst_business_address: string | null;
  gst_doc_photo_url: string | null;
  pan_number: string;
  pan_status: string;
  pan_holder_name: string | null;
  pan_doc_photo_url: string | null;
  aadhaar_number: string;
  aadhaar_doc_photo_url: string | null;

  // Step 5
  bank_account_name: string;
  bank_account_number: string;
  bank_account_confirm: string;
  bank_ifsc: string;
  upi_id: string;
  bank_name: string | null;
  bank_branch_name: string | null;
  preferred_settlement_method: string;
  bank_status: string;
  penny_drop_status: string;

  // Step 6
  qr_serial: string;
  qr_assigned: boolean;
  qr_photo_url: string | null;
  operating_hours_start: string;
  operating_hours_end: string;
  expected_monthly_volume: string;
  inventory_handover_items: HandoverInventoryItem[];

  // Step 7
  terms_accepted: boolean;
  privacy_accepted: boolean;
  service_agreement_accepted: boolean;
  resume_inventory_handover: boolean;

  // Visit record (FE non-interested flows)
  visit_outcome: VisitOutcome | null;
  visit_notes: string;
  follow_up_schedules: FollowUpSchedule[];

  // Honeypot
  website_url: string;
}

interface OnboardingState {
  // Wizard navigation
  currentStep: WizardStepId;
  completedSteps: WizardStepId[];
  applicationId: string | null;
  startTime: string;

  // Form data
  formData: OnboardingFormData;

  // Phone check state
  phoneCheckResult: {
    exists: boolean;
    status: string;
    application_id: string | null;
    visiting_exec_name: string | null;
    message: string;
  } | null;

  // Actions
  setStep: (step: WizardStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  completeStep: (step: WizardStepId) => void;
  setApplicationId: (id: string) => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  setPhoneCheckResult: (result: OnboardingState["phoneCheckResult"]) => void;
  loadFromApplication: (app: Partial<OnboardingFormData> & { application_id?: string; current_step?: WizardStepId; completed_steps?: WizardStepId[] }) => void;
  reset: () => void;
}

const initialFormData: OnboardingFormData = {
  channel: null,
  exec_id: null,
  exec_name: null,
  exec_employee_code: null,
  merchant_phone_verified: false,
  merchant_otp_phone: "",

  phone: "",
  owner_name: "",
  owner_email: "",
  owner_email_verified: false,
  legal_name: "My Store",
  shop_name: "My Store",
  google_maps_link: "",
  door_no: "",
  shop_no: "",
  year_of_establishment: "",
  business_ownership_type: "",
  sector_id: "",
  sector_name: "",
  locality: "",
  state_id: "",
  city_id: "",
  city: "",
  state: "",
  pin_code: "",
  referral_code: "",
  merchant_referral_code: "",
  lead_source_id: "",
  branch_name: "",
  storefront_photo_url: null,
  storefront_photo_urls: [],
  storefront_photo_status: "pending",
  gps_lat: null,
  gps_long: null,
  gps_accuracy: null,

  discount_program_enabled: false,
  discount_program_max_percentage: null,
  minimum_bill_amount_for_discount: null,
  policy_max_discount_percentage: null,
  discount_bands: [],

  commission_rate: null,
  minimum_commission_percentage: null,
  commission_model: null,
  commission_tiers: null,
  commission_agreed: false,

  gst_number: "",
  gst_enrollment_number: "",
  gst_registration_status: "",
  gst_status: "not_started",
  gst_business_name: null,
  gst_business_address: null,
  gst_doc_photo_url: null,
  pan_number: "",
  pan_status: "not_started",
  pan_holder_name: null,
  pan_doc_photo_url: null,
  aadhaar_number: "",
  aadhaar_doc_photo_url: null,

  bank_account_name: "",
  bank_account_number: "",
  bank_account_confirm: "",
  bank_ifsc: "",
  upi_id: "",
  bank_name: null,
  bank_branch_name: null,
  preferred_settlement_method: "",
  bank_status: "not_started",
  penny_drop_status: "not_started",

  qr_serial: "",
  qr_assigned: false,
  qr_photo_url: null,
  operating_hours_start: "",
  operating_hours_end: "",
  expected_monthly_volume: "",
  inventory_handover_items: [],

  terms_accepted: false,
  privacy_accepted: false,
  service_agreement_accepted: false,
  resume_inventory_handover: false,

  visit_outcome: null,
  visit_notes: "",
  follow_up_schedules: [],

  website_url: "",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  currentStep: "identity",
  completedSteps: [],
  applicationId: null,
  startTime: new Date().toISOString(),
  formData: { ...initialFormData },
  phoneCheckResult: null,

  setStep: (step) => set({ currentStep: step }),

  nextStep: () =>
    set((state) => {
      const idx = WIZARD_STEPS.indexOf(state.currentStep);
      if (idx < WIZARD_STEPS.length - 1) {
        return { currentStep: WIZARD_STEPS[idx + 1] };
      }
      return {};
    }),

  prevStep: () =>
    set((state) => {
      const idx = WIZARD_STEPS.indexOf(state.currentStep);
      if (idx > 0) {
        return { currentStep: WIZARD_STEPS[idx - 1] };
      }
      return {};
    }),

  completeStep: (step) =>
    set((state) => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    })),

  setApplicationId: (id) => set({ applicationId: id }),

  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setPhoneCheckResult: (result) => set({ phoneCheckResult: result }),

  loadFromApplication: (app) =>
    set((state) => {
      const formUpdate: Partial<OnboardingFormData> = {};
      const keys = Object.keys(initialFormData) as (keyof OnboardingFormData)[];
      for (const key of keys) {
        if (key in app && (app as Record<string, unknown>)[key] !== undefined) {
          const incoming = (app as Record<string, unknown>)[key];
          const defaultValue = initialFormData[key];

          // Resume payloads can contain null for text fields; coerce to safe defaults
          // to avoid UI code calling `.length` on null.
          if (incoming === null) {
            if (typeof defaultValue === "string") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (formUpdate as any)[key] = "";
              continue;
            }

            if (typeof defaultValue === "boolean") {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (formUpdate as any)[key] = false;
              continue;
            }

            if (Array.isArray(defaultValue)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (formUpdate as any)[key] = [];
              continue;
            }
          }

          if (key === "sector_id" && incoming != null && incoming !== "") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (formUpdate as any)[key] = String(incoming);
            continue;
          }

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (formUpdate as any)[key] = incoming;
        }
      }
      return {
        formData: {
          ...state.formData,
          ...formUpdate,
          legal_name:
            (formUpdate.legal_name as string | undefined) ||
            (app as Record<string, unknown>).legal_name?.toString() ||
            (app as Record<string, unknown>).gst_business_name?.toString() ||
            state.formData.legal_name,
          storefront_photo_urls:
            Array.isArray((app as Record<string, unknown>).storefront_photo_urls) &&
            ((app as Record<string, unknown>).storefront_photo_urls as unknown[]).length > 0
              ? ((app as Record<string, unknown>).storefront_photo_urls as string[])
              : (app as Record<string, unknown>).storefront_photo_url
                ? [String((app as Record<string, unknown>).storefront_photo_url)]
                : state.formData.storefront_photo_urls,
          merchant_phone_verified:
            typeof (app as Record<string, unknown>).phone_verified === "boolean"
              ? ((app as Record<string, unknown>).phone_verified as boolean)
              : typeof (app as Record<string, unknown>).merchant_phone_verified === "boolean"
                ? ((app as Record<string, unknown>).merchant_phone_verified as boolean)
                : state.formData.merchant_phone_verified,
          owner_email_verified:
            typeof (app as Record<string, unknown>).email_verified === "boolean"
              ? ((app as Record<string, unknown>).email_verified as boolean)
              : state.formData.owner_email_verified,
          gst_enrollment_number:
            (app as Record<string, unknown>).gst_enrollment_number?.toString() ||
            state.formData.gst_enrollment_number,
          gst_registration_status:
            (app as Record<string, unknown>).gst_registration_status?.toString() ||
            state.formData.gst_registration_status,
          merchant_referral_code:
            (app as Record<string, unknown>).merchant_referral_code?.toString() ||
            state.formData.merchant_referral_code,
          referral_code:
            (app as Record<string, unknown>).referral_code?.toString() ||
            state.formData.referral_code,
        },
        applicationId: app.application_id || state.applicationId,
        currentStep: app.current_step || state.currentStep,
        completedSteps: app.completed_steps || state.completedSteps,
      };
    }),

  reset: () =>
    set({
      currentStep: "identity",
      completedSteps: [],
      applicationId: null,
      startTime: new Date().toISOString(),
      formData: { ...initialFormData },
      phoneCheckResult: null,
    }),
}));
