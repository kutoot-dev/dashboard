/**
 * Types: Referral Event entity
 *
 * DB TABLE: referral_events
 * COLUMNS: referral_id (PK), referring_branch_id (FK),
 *   referred_entity_type (enum), referred_entity_id,
 *   referral_timestamp, credit_value_initial (decimal),
 *   credit_value_current (decimal), decay_factor_applied (decimal),
 *   is_in_flagged_network (bool), created_at
 * INDEXES: referral_id, referring_branch_id
 * CONSTRAINTS: FK to branches(referring_branch_id)
 */

export type ReferredEntityType = "user" | "branch";

export interface ReferralEvent {
  referral_id: string;
  referring_branch_id: string;
  referred_entity_type: ReferredEntityType;
  referred_entity_id: string;
  referral_timestamp: string;
  credit_value_initial: number;
  credit_value_current: number;
  decay_factor_applied: number;
  is_in_flagged_network: boolean;
  created_at: string;
}
