/**
 * Onboarding Types
 *
 * Types for the merchant onboarding wizard, application tracking,
 * field executive management, and incentive lifecycle.
 */

// ── Merchant Stage ─────────────────────────────────────────────────
// Mirrors `App\Enums\MerchantStage` on the backend. Every merchant —
// whether it's a fresh lead, a field-visit target, or an active store —
// carries a single `stage` that drives UI, tabs, and status screens.

export type MerchantStage =
  // Prospecting
  | "lead"
  // Field visit outcomes
  | "revisit"
  | "owner_absent"
  | "shop_closed"
  | "competitor_user"
  | "not_interested"
  | "permanently_closed"
  // Onboarding
  | "invited"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "rejected"
  // Post-onboarding
  | "approved"
  | "active"
  | "suspended"
  | "churned";

export type MerchantStagePhase =
  | "prospecting"
  | "visit"
  | "onboarding"
  | "post_onboarding";

export const STAGE_LABELS: Record<MerchantStage, string> = {
  lead: "Lead",
  revisit: "Revisit",
  owner_absent: "Owner Absent",
  shop_closed: "Shop Closed",
  competitor_user: "Competitor User",
  not_interested: "Not Interested",
  permanently_closed: "Permanently Closed",
  invited: "Invited",
  in_progress: "In Progress",
  submitted: "Submitted",
  under_review: "Under Review",
  rejected: "Rejected",
  approved: "Approved",
  active: "Active",
  suspended: "Suspended",
  churned: "Churned",
};

export const STAGE_PHASES: Record<MerchantStage, MerchantStagePhase> = {
  lead: "prospecting",
  revisit: "visit",
  owner_absent: "visit",
  shop_closed: "visit",
  competitor_user: "visit",
  not_interested: "visit",
  permanently_closed: "visit",
  invited: "onboarding",
  in_progress: "onboarding",
  submitted: "onboarding",
  under_review: "onboarding",
  rejected: "onboarding",
  approved: "post_onboarding",
  active: "post_onboarding",
  suspended: "post_onboarding",
  churned: "post_onboarding",
};

/**
 * Stages that carry a `follow_up_schedules` calendar (the merchant needs
 * to be revisited by a field executive).
 */
export const SCHEDULE_STAGES: ReadonlySet<MerchantStage> = new Set([
  "revisit",
  "owner_absent",
  "shop_closed",
  "competitor_user",
]);

export const TERMINAL_STAGES: ReadonlySet<MerchantStage> = new Set([
  "not_interested",
  "permanently_closed",
  "rejected",
  "churned",
]);

/**
 * Deprecated legacy status values from the old merchant_applications flow.
 * Kept for one release so consumers that still read `status` don't break.
 * @deprecated Use `MerchantStage` instead.
 */
export type ApplicationStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "suspended"
  | "visit_record";

export type ApplicationChannel = "merchant" | "field_executive";

// ── Follow-up Schedule ─────────────────────────────────────────────

export interface FollowUpSchedule {
  id: string;                // uuid-like client-side id
  date: string;              // ISO date portion: YYYY-MM-DD
  time: string;              // HH:mm
  notes: string;             // optional note for this slot
}

// ── Visit Outcome (Field Executive only) ──────────────────────────

export type VisitOutcome =
  | "interested"           // Merchant wants to onboard — proceed with full form
  | "not_interested"       // Merchant explicitly declined
  | "follow_up"            // Needs another visit / callback
  | "owner_absent"         // Shop open but owner not present
  | "shop_closed"          // Shop closed during visit
  | "permanently_closed"   // Business has shut down
  | "competitor_user"      // Already using a rival payment service
  | "already_registered"   // Already an active Kutoot merchant
  | "language_barrier"     // Could not communicate effectively
  | "invalid_address"      // Address does not exist / unreachable
  | "called_back";         // Merchant asked to call back later

export type CommissionModel = "flat" | "tiered";

export type KycVerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "failed"
  | "pending_manual_review";

export type IncentiveType =
  | "onboarding_complete"
  | "first_transaction"
  | "thirty_day_retention";

export type IncentiveStatus = "pending" | "approved" | "paid" | "hold";

// ── Wizard Step Tracking ───────────────────────────────────────────

export type WizardStepId =
  | "identity"
  | "visit_outcome"    // Field executive only
  | "basic_details"
  | "commission"
  | "kyc"
  | "bank"
  | "qr_activation"
  | "review";

export const WIZARD_STEPS: WizardStepId[] = [
  "identity",
  "visit_outcome",
  "basic_details",
  "commission",
  "kyc",
  "bank",
  "qr_activation",
  "review",
];

export interface WizardStepConfig {
  id: WizardStepId;
  label: string;
  description: string;
  number: number;
}

export const WIZARD_STEP_CONFIG: WizardStepConfig[] = [
  { id: "identity", label: "Identity", description: "Who is filling this form?", number: 1 },
  { id: "visit_outcome", label: "Visit Status", description: "Merchant interest and outcome", number: 2 },
  { id: "basic_details", label: "Basic Details", description: "Shop and owner information", number: 3 },
  { id: "commission", label: "Commission", description: "Commission rate agreement", number: 4 },
  { id: "kyc", label: "KYC Documents", description: "Business verification documents", number: 5 },
  { id: "bank", label: "Bank Details", description: "Bank account for payouts", number: 6 },
  { id: "qr_activation", label: "QR & Activation", description: "QR code setup", number: 7 },
  { id: "review", label: "Review & Submit", description: "Review and submit application", number: 8 },
];

// ── Commission Tier ────────────────────────────────────────────────

export interface CommissionTier {
  min_amount: number;
  max_amount: number | null;
  rate_percent: number;
}

// ── Application Data Shape ─────────────────────────────────────────

export interface OnboardingApplication {
  application_id: string;
  /** Canonical lifecycle stage (see MerchantStage). */
  stage: MerchantStage;
  stage_phase?: MerchantStagePhase;
  /** @deprecated Use `stage`. Present for one release of backward compat. */
  status?: ApplicationStatus;
  channel: ApplicationChannel;
  current_step: WizardStepId;
  completed_steps: WizardStepId[];
  /** ISO timestamp of the next scheduled follow-up visit (null if none). */
  next_follow_up_at?: string | null;

  // Step 1: Identity
  exec_id: string | null;
  exec_name: string | null;
  exec_employee_code: string | null;
  merchant_phone_verified: boolean;

  // Step 2: Basic Details
  phone: string;
  owner_name: string;
  shop_name: string;
  sector_id: string;
  sector_name: string;
  locality: string;
  city: string;
  state: string;
  pin_code: string;
  branch_name?: string | null;
  storefront_photo_url: string | null;
  storefront_photo_status: "pending" | "uploaded" | "failed";
  gps_lat: number | null;
  gps_long: number | null;
  gps_accuracy: number | null;

  // Step 3: Commission
  commission_rate: number | null;
  minimum_commission_percentage?: number | string | null;
  commission_model: CommissionModel | null;
  commission_tiers: CommissionTier[] | null;
  commission_agreed: boolean;

  // Step 4: KYC
  gst_number: string | null;
  gst_status: KycVerificationStatus;
  gst_business_name: string | null;
  gst_business_address: string | null;
  gst_doc_photo_url: string | null;
  pan_number: string | null;
  pan_status: KycVerificationStatus;
  pan_holder_name: string | null;
  pan_doc_photo_url: string | null;
  aadhaar_number_masked: string | null;
  aadhaar_doc_photo_url: string | null;

  // Step 5: Bank
  bank_account_name: string | null;
  bank_account_number: string | null;
  bank_ifsc: string | null;
  bank_name: string | null;
  bank_branch_name: string | null;
  preferred_settlement_method?: string | null;
  bank_status: KycVerificationStatus;
  penny_drop_status: "not_started" | "success" | "failed" | "pending";

  // Step 6: QR & Activation
  qr_serial: string | null;
  qr_assigned: boolean;
  qr_photo_url: string | null;
  operating_hours_start: string | null;
  operating_hours_end: string | null;
  expected_monthly_volume: string | null;
  referral_code?: string | null;
  merchant_referral_code?: string | null;
  referred_by_location_id?: number | null;

  // Step 7: Review
  terms_accepted: boolean;
  privacy_accepted: boolean;

  // Meta
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  last_modified_by: ApplicationChannel;
  submitted_by: ApplicationChannel;           // who actually submitted
  device_fingerprint: string | null;
  start_time: string;

  // Visit record (Field Executive non-interested flows)
  visit_outcome: VisitOutcome | null;
  visit_notes: string | null;
  follow_up_schedules: FollowUpSchedule[];  // multiple reschedule slots

  // Audit
  audit_trail: AuditEntry[];
}

// ── Audit Trail ────────────────────────────────────────────────────

export interface AuditEntry {
  timestamp: string;
  actor: ApplicationChannel;
  actor_id: string;
  step: WizardStepId;
  action: "step_entered" | "step_completed" | "draft_saved" | "submitted" | "status_changed";
  details: string | null;
  gps_lat: number | null;
  gps_long: number | null;
  device_fingerprint: string | null;
}

// ── Executive ──────────────────────────────────────────────────────

export interface FieldExecutive {
  exec_id: string;
  employee_code: string;
  name: string;
  phone: string;
  email: string;
  region: string;
  is_active: boolean;
  total_onboardings: number;
  active_merchants: number;
  conversion_rate: number;
}

// ── Incentive ──────────────────────────────────────────────────────

export interface ExecutiveIncentive {
  incentive_id: string;
  exec_id: string;
  application_id: string;
  incentive_type: IncentiveType;
  amount: number;
  status: IncentiveStatus;
  trigger_date: string;
  paid_date: string | null;
  hold_reason: string | null;
}

// ── API Request/Response shapes ────────────────────────────────────

export interface PhoneCheckResult {
  exists: boolean;
  status: "active_merchant" | "existing_lead" | "already_submitted" | "existing_fe_visit" | "new";
  application_id: string | null;
  /** @deprecated Use `stage` — this echoes the backend stage string. */
  application_status: MerchantStage | ApplicationStatus | null;
  stage?: MerchantStage | null;
  visiting_exec_name: string | null;   // name of FE who already visited, if any
  message: string;
}

export interface ExecutiveVerifyResult {
  valid: boolean;
  exec_id: string | null;
  exec_name: string | null;
  message: string;
}

export interface OtpSendResult {
  sent: boolean;
  message: string;
  expires_in_seconds: number;
}

export interface OtpVerifyResult {
  verified: boolean;
  message: string;
}

export interface GstVerifyResult {
  valid: boolean;
  business_name: string | null;
  business_address: string | null;
  status: KycVerificationStatus;
  message: string;
}

export interface PanVerifyResult {
  valid: boolean;
  holder_name: string | null;
  name_match: boolean;
  status: KycVerificationStatus;
  message: string;
}

export interface BankVerifyResult {
  valid: boolean;
  bank_name: string | null;
  branch_name: string | null;
  penny_drop_status: "success" | "failed" | "pending";
  message: string;
}

// ── Summary for read-only views ────────────────────────────────────

export interface ApplicationSummary {
  application_id: string;
  phone_masked: string;
  owner_name: string;
  shop_name: string;
  sector_name: string;
  city: string;
  state: string;
  stage: MerchantStage;
  stage_phase?: MerchantStagePhase;
  /** @deprecated Use `stage`. */
  status?: ApplicationStatus;
  current_step: WizardStepId;
  completed_steps?: WizardStepId[];
  commission_rate: number | null;
  channel: ApplicationChannel;
  visit_outcome?: VisitOutcome | null;
  exec_name: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  next_follow_up_at?: string | null;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  pending_review: number;
  active: number;
  rejected: number;
}
