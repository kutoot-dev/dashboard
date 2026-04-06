/**
 * Types: Scoring Parameter entity
 *
 * DB TABLE: scoring_parameters
 * COLUMNS: parameter_key (unique text PK), parameter_value (decimal or JSON),
 *   parameter_description (text), last_updated_by (text),
 *   last_updated_at (timestamp), effective_from (timestamp)
 * INDEXES: parameter_key
 */

export interface ScoringParameter {
  parameter_key: string;
  parameter_value: number;
  parameter_description: string;
  last_updated_by: string;
  last_updated_at: string;
  effective_from: string;
}
