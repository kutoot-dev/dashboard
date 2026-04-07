/**
 * Mock Data: Referral Events
 *
 * 20 referral events from active merchants. Top-performing merchants
 * refer more frequently. Includes both branch-to-branch and
 * branch-to-user referrals with exponential decay applied.
 */

import type { ReferralEvent } from "@/lib/types";

export const MOCK_REFERRALS: ReferralEvent[] = [
  // â”€â”€ Top performers referring merchants â”€â”€
  { referral_id: "ref-001", referring_branch_id: "m-001", referred_entity_type: "branch", referred_entity_id: "m-045", referral_timestamp: "2024-11-05T10:00:00Z", credit_value_initial: 2.5, credit_value_current: 1.8, decay_factor_applied: 0.72, is_in_flagged_network: false, created_at: "2024-11-05T10:00:00Z" },
  { referral_id: "ref-002", referring_branch_id: "m-001", referred_entity_type: "user", referred_entity_id: "u-10001", referral_timestamp: "2025-02-10T14:30:00Z", credit_value_initial: 1.5, credit_value_current: 1.2, decay_factor_applied: 0.80, is_in_flagged_network: false, created_at: "2025-02-10T14:30:00Z" },
  { referral_id: "ref-003", referring_branch_id: "m-003", referred_entity_type: "branch", referred_entity_id: "m-046", referral_timestamp: "2024-12-20T09:00:00Z", credit_value_initial: 2.5, credit_value_current: 1.6, decay_factor_applied: 0.64, is_in_flagged_network: false, created_at: "2024-12-20T09:00:00Z" },
  { referral_id: "ref-004", referring_branch_id: "m-005", referred_entity_type: "user", referred_entity_id: "u-10002", referral_timestamp: "2025-06-15T11:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.35, decay_factor_applied: 0.90, is_in_flagged_network: false, created_at: "2025-06-15T11:00:00Z" },
  { referral_id: "ref-005", referring_branch_id: "m-010", referred_entity_type: "branch", referred_entity_id: "m-047", referral_timestamp: "2025-01-12T16:00:00Z", credit_value_initial: 2.5, credit_value_current: 1.5, decay_factor_applied: 0.60, is_in_flagged_network: false, created_at: "2025-01-12T16:00:00Z" },

  // â”€â”€ Mid-tier merchants referring users â”€â”€
  { referral_id: "ref-006", referring_branch_id: "m-022", referred_entity_type: "user", referred_entity_id: "u-10003", referral_timestamp: "2025-08-20T13:30:00Z", credit_value_initial: 1.5, credit_value_current: 1.4, decay_factor_applied: 0.93, is_in_flagged_network: false, created_at: "2025-08-20T13:30:00Z" },
  { referral_id: "ref-007", referring_branch_id: "m-023", referred_entity_type: "user", referred_entity_id: "u-10004", referral_timestamp: "2025-09-05T10:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.38, decay_factor_applied: 0.92, is_in_flagged_network: false, created_at: "2025-09-05T10:00:00Z" },
  { referral_id: "ref-008", referring_branch_id: "m-025", referred_entity_type: "branch", referred_entity_id: "m-048", referral_timestamp: "2025-02-05T08:00:00Z", credit_value_initial: 2.5, credit_value_current: 1.75, decay_factor_applied: 0.70, is_in_flagged_network: false, created_at: "2025-02-05T08:00:00Z" },
  { referral_id: "ref-009", referring_branch_id: "m-037", referred_entity_type: "user", referred_entity_id: "u-10005", referral_timestamp: "2025-11-10T15:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.43, decay_factor_applied: 0.95, is_in_flagged_network: false, created_at: "2025-11-10T15:00:00Z" },
  { referral_id: "ref-010", referring_branch_id: "m-038", referred_entity_type: "branch", referred_entity_id: "m-049", referral_timestamp: "2025-03-05T12:00:00Z", credit_value_initial: 2.5, credit_value_current: 1.63, decay_factor_applied: 0.65, is_in_flagged_network: false, created_at: "2025-03-05T12:00:00Z" },

  // â”€â”€ More user referrals â”€â”€
  { referral_id: "ref-011", referring_branch_id: "m-009", referred_entity_type: "user", referred_entity_id: "u-10006", referral_timestamp: "2026-01-20T10:30:00Z", credit_value_initial: 1.5, credit_value_current: 1.48, decay_factor_applied: 0.99, is_in_flagged_network: false, created_at: "2026-01-20T10:30:00Z" },
  { referral_id: "ref-012", referring_branch_id: "m-014", referred_entity_type: "user", referred_entity_id: "u-10007", referral_timestamp: "2026-02-01T09:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.47, decay_factor_applied: 0.98, is_in_flagged_network: false, created_at: "2026-02-01T09:00:00Z" },
  { referral_id: "ref-013", referring_branch_id: "m-018", referred_entity_type: "user", referred_entity_id: "u-10008", referral_timestamp: "2026-02-15T14:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.46, decay_factor_applied: 0.97, is_in_flagged_network: false, created_at: "2026-02-15T14:00:00Z" },
  { referral_id: "ref-014", referring_branch_id: "m-031", referred_entity_type: "user", referred_entity_id: "u-10009", referral_timestamp: "2026-03-01T11:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.45, decay_factor_applied: 0.97, is_in_flagged_network: false, created_at: "2026-03-01T11:00:00Z" },
  { referral_id: "ref-015", referring_branch_id: "m-034", referred_entity_type: "branch", referred_entity_id: "m-036", referral_timestamp: "2024-04-01T10:00:00Z", credit_value_initial: 2.5, credit_value_current: 0.88, decay_factor_applied: 0.35, is_in_flagged_network: false, created_at: "2024-04-01T10:00:00Z" },

  // â”€â”€ Flagged network referrals (connected to fraud flags) â”€â”€
  { referral_id: "ref-016", referring_branch_id: "m-042", referred_entity_type: "branch", referred_entity_id: "m-044", referral_timestamp: "2026-03-02T08:00:00Z", credit_value_initial: 2.5, credit_value_current: 0.0, decay_factor_applied: 0.0, is_in_flagged_network: true, created_at: "2026-03-02T08:00:00Z" },
  { referral_id: "ref-017", referring_branch_id: "m-044", referred_entity_type: "branch", referred_entity_id: "m-043", referral_timestamp: "2026-03-02T12:00:00Z", credit_value_initial: 2.5, credit_value_current: 0.0, decay_factor_applied: 0.0, is_in_flagged_network: true, created_at: "2026-03-02T12:00:00Z" },
  { referral_id: "ref-018", referring_branch_id: "m-043", referred_entity_type: "branch", referred_entity_id: "m-042", referral_timestamp: "2026-03-03T09:00:00Z", credit_value_initial: 2.5, credit_value_current: 0.0, decay_factor_applied: 0.0, is_in_flagged_network: true, created_at: "2026-03-03T09:00:00Z" },

  // â”€â”€ Recent high-value referrals â”€â”€
  { referral_id: "ref-019", referring_branch_id: "m-004", referred_entity_type: "user", referred_entity_id: "u-10010", referral_timestamp: "2026-03-28T16:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.50, decay_factor_applied: 1.0, is_in_flagged_network: false, created_at: "2026-03-28T16:00:00Z" },
  { referral_id: "ref-020", referring_branch_id: "m-021", referred_entity_type: "user", referred_entity_id: "u-10011", referral_timestamp: "2026-04-01T10:00:00Z", credit_value_initial: 1.5, credit_value_current: 1.50, decay_factor_applied: 1.0, is_in_flagged_network: false, created_at: "2026-04-01T10:00:00Z" },
];

