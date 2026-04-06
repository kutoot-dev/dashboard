/**
 * Types: Force Majeure Event entity
 *
 * DB TABLE: force_majeure_events
 * COLUMNS: event_id (PK), event_name, event_type (enum),
 *   affected_location_ids (array), start_timestamp, end_timestamp,
 *   scoring_adjustment_type (enum), created_at
 * INDEXES: event_id, event_type
 */

export type ForceMajeureEventType = "natural_disaster" | "civil_disruption" | "platform_outage" | "macro_economic";

export type ScoringAdjustmentType = "pause" | "baseline_correction" | "tolerance_widening";

export interface ForceMajeureEvent {
  event_id: string;
  event_name: string;
  event_type: ForceMajeureEventType;
  affected_location_ids: string[];
  start_timestamp: string;
  end_timestamp: string;
  scoring_adjustment_type: ScoringAdjustmentType;
  created_at: string;
}
