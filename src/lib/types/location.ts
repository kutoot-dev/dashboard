/**
 * Types: Location entity
 *
 * DB TABLE: locations
 * COLUMNS: location_id (PK), pin_code, city_name, district, state,
 *   city_tier (enum), location_opportunity_index (decimal 0–1),
 *   average_daily_footfall_multiplier (decimal),
 *   purchasing_power_index (decimal), updated_at
 * INDEXES: location_id, pin_code, city_tier, state
 */

export type CityTier = "metro" | "tier1" | "tier2" | "tier3" | "rural";

export interface Location {
  location_id: string;
  pin_code: string;
  city_name: string;
  district: string;
  state: string;
  city_tier: CityTier;
  location_opportunity_index: number;
  average_daily_footfall_multiplier: number;
  purchasing_power_index: number;
  updated_at: string;
}
