/**
 * Mock Data: Scoring Parameters
 *
 * 21 scoring parameters seeded from SCORING_PARAMETER_DEFINITIONS.
 * All values match defaults; updated_by is "system".
 */

import type { ScoringParameter } from "@/lib/types";
import { SCORING_PARAMETER_DEFINITIONS } from "@/lib/constants/scoring";

export const MOCK_PARAMETERS: ScoringParameter[] = Object.entries(
  SCORING_PARAMETER_DEFINITIONS,
).map(([key, def]) => ({
  parameter_key: key,
  parameter_value: def.defaultValue,
  parameter_description: def.description,
  last_updated_by: "system",
  last_updated_at: "2026-01-01T00:00:00Z",
  effective_from: "2026-01-01T00:00:00Z",
}));
