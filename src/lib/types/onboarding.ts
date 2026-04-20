/**
 * Onboarding Types
 *
 * Types for the merchant onboarding wizard, application tracking,
 * field executive management, and incentive lifecycle.
 */

// ── Application Status ─────────────────────────────────────────────

export type ApplicationStatus =
  | "draft"
  | "pending_photo"
  | "pending_review"
  | "pending_kyc_review"
  | "pending_bank_verify"
  | "pending_activation"
  | "active"
  | "rejected"
  | "suspended";

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
  status: ApplicationStatus;
  channel: ApplicationChannel;
  current_step: WizardStepId;
  completed_steps: WizardStepId[];

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
  bank_status: KycVerificationStatus;
  penny_drop_status: "not_started" | "success" | "failed" | "pending";

  // Step 6: QR & Activation
  qr_serial: string | null;
  qr_assigned: boolean;
  qr_photo_url: string | null;
  operating_hours_start: string | null;
  operating_hours_end: string | null;
  expected_monthly_volume: string | null;

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
  application_status: ApplicationStatus | null;
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
  status: ApplicationStatus;
  current_step: WizardStepId;
  commission_rate: number | null;
  channel: ApplicationChannel;
  exec_name: string | null;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
}

export interface ApplicationStats {
  total: number;
  draft: number;
  pending_review: number;
  active: number;
  rejected: number;
}
