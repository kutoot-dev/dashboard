/**
 * Mock Data: Locations
 *
 * 30 Indian cities across 5 tiers (metro, tier1, tier2, tier3, rural).
 * Each location carries opportunity indices and footfall multipliers used in scoring.
 */

import type { Location } from "@/lib/types";

export const MOCK_LOCATIONS: Location[] = [
  // ── Metro (6) ────────────────────────────────────────────────────────
  { location_id: "loc-001", pin_code: "400001", city_name: "Mumbai", district: "Mumbai City", state: "Maharashtra", city_tier: "metro", location_opportunity_index: 0.95, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.92, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-002", pin_code: "110001", city_name: "Delhi", district: "New Delhi", state: "Delhi", city_tier: "metro", location_opportunity_index: 0.93, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.90, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-003", pin_code: "560001", city_name: "Bangalore", district: "Bangalore Urban", state: "Karnataka", city_tier: "metro", location_opportunity_index: 0.94, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.91, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-004", pin_code: "600001", city_name: "Chennai", district: "Chennai", state: "Tamil Nadu", city_tier: "metro", location_opportunity_index: 0.90, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.87, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-005", pin_code: "700001", city_name: "Kolkata", district: "Kolkata", state: "West Bengal", city_tier: "metro", location_opportunity_index: 0.88, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.84, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-006", pin_code: "500001", city_name: "Hyderabad", district: "Hyderabad", state: "Telangana", city_tier: "metro", location_opportunity_index: 0.92, average_daily_footfall_multiplier: 1.0, purchasing_power_index: 0.89, updated_at: "2026-01-01T00:00:00Z" },

  // ── Tier 1 (8) ──────────────────────────────────────────────────────
  { location_id: "loc-007", pin_code: "411001", city_name: "Pune", district: "Pune", state: "Maharashtra", city_tier: "tier1", location_opportunity_index: 0.82, average_daily_footfall_multiplier: 1.15, purchasing_power_index: 0.83, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-008", pin_code: "380001", city_name: "Ahmedabad", district: "Ahmedabad", state: "Gujarat", city_tier: "tier1", location_opportunity_index: 0.80, average_daily_footfall_multiplier: 1.18, purchasing_power_index: 0.81, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-009", pin_code: "302001", city_name: "Jaipur", district: "Jaipur", state: "Rajasthan", city_tier: "tier1", location_opportunity_index: 0.78, average_daily_footfall_multiplier: 1.20, purchasing_power_index: 0.77, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-010", pin_code: "226001", city_name: "Lucknow", district: "Lucknow", state: "Uttar Pradesh", city_tier: "tier1", location_opportunity_index: 0.75, average_daily_footfall_multiplier: 1.22, purchasing_power_index: 0.74, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-011", pin_code: "160001", city_name: "Chandigarh", district: "Chandigarh", state: "Chandigarh", city_tier: "tier1", location_opportunity_index: 0.83, average_daily_footfall_multiplier: 1.12, purchasing_power_index: 0.85, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-012", pin_code: "452001", city_name: "Indore", district: "Indore", state: "Madhya Pradesh", city_tier: "tier1", location_opportunity_index: 0.76, average_daily_footfall_multiplier: 1.25, purchasing_power_index: 0.75, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-013", pin_code: "682001", city_name: "Kochi", district: "Ernakulam", state: "Kerala", city_tier: "tier1", location_opportunity_index: 0.79, average_daily_footfall_multiplier: 1.18, purchasing_power_index: 0.80, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-014", pin_code: "395001", city_name: "Surat", district: "Surat", state: "Gujarat", city_tier: "tier1", location_opportunity_index: 0.77, average_daily_footfall_multiplier: 1.20, purchasing_power_index: 0.78, updated_at: "2026-01-01T00:00:00Z" },

  // ── Tier 2 (8) ──────────────────────────────────────────────────────
  { location_id: "loc-015", pin_code: "462001", city_name: "Bhopal", district: "Bhopal", state: "Madhya Pradesh", city_tier: "tier2", location_opportunity_index: 0.62, average_daily_footfall_multiplier: 1.45, purchasing_power_index: 0.65, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-016", pin_code: "834001", city_name: "Ranchi", district: "Ranchi", state: "Jharkhand", city_tier: "tier2", location_opportunity_index: 0.55, average_daily_footfall_multiplier: 1.55, purchasing_power_index: 0.58, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-017", pin_code: "781001", city_name: "Guwahati", district: "Kamrup Metropolitan", state: "Assam", city_tier: "tier2", location_opportunity_index: 0.52, average_daily_footfall_multiplier: 1.60, purchasing_power_index: 0.55, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-018", pin_code: "221001", city_name: "Varanasi", district: "Varanasi", state: "Uttar Pradesh", city_tier: "tier2", location_opportunity_index: 0.58, average_daily_footfall_multiplier: 1.50, purchasing_power_index: 0.60, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-019", pin_code: "641001", city_name: "Coimbatore", district: "Coimbatore", state: "Tamil Nadu", city_tier: "tier2", location_opportunity_index: 0.68, average_daily_footfall_multiplier: 1.40, purchasing_power_index: 0.70, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-020", pin_code: "530001", city_name: "Visakhapatnam", district: "Visakhapatnam", state: "Andhra Pradesh", city_tier: "tier2", location_opportunity_index: 0.60, average_daily_footfall_multiplier: 1.48, purchasing_power_index: 0.62, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-021", pin_code: "800001", city_name: "Patna", district: "Patna", state: "Bihar", city_tier: "tier2", location_opportunity_index: 0.50, average_daily_footfall_multiplier: 1.58, purchasing_power_index: 0.52, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-022", pin_code: "248001", city_name: "Dehradun", district: "Dehradun", state: "Uttarakhand", city_tier: "tier2", location_opportunity_index: 0.60, average_daily_footfall_multiplier: 1.45, purchasing_power_index: 0.63, updated_at: "2026-01-01T00:00:00Z" },

  // ── Tier 3 (4) ──────────────────────────────────────────────────────
  { location_id: "loc-023", pin_code: "171001", city_name: "Shimla", district: "Shimla", state: "Himachal Pradesh", city_tier: "tier3", location_opportunity_index: 0.40, average_daily_footfall_multiplier: 1.80, purchasing_power_index: 0.48, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-024", pin_code: "795001", city_name: "Imphal", district: "Imphal West", state: "Manipur", city_tier: "tier3", location_opportunity_index: 0.32, average_daily_footfall_multiplier: 2.00, purchasing_power_index: 0.38, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-025", pin_code: "737101", city_name: "Gangtok", district: "East Sikkim", state: "Sikkim", city_tier: "tier3", location_opportunity_index: 0.30, average_daily_footfall_multiplier: 2.10, purchasing_power_index: 0.40, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-026", pin_code: "744101", city_name: "Port Blair", district: "South Andaman", state: "Andaman & Nicobar", city_tier: "tier3", location_opportunity_index: 0.28, average_daily_footfall_multiplier: 2.20, purchasing_power_index: 0.35, updated_at: "2026-01-01T00:00:00Z" },

  // ── Rural (4) ────────────────────────────────────────────────────────
  { location_id: "loc-027", pin_code: "396210", city_name: "Daman", district: "Daman", state: "Dadra & Nagar Haveli and Daman & Diu", city_tier: "rural", location_opportunity_index: 0.22, average_daily_footfall_multiplier: 2.50, purchasing_power_index: 0.30, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-028", pin_code: "396230", city_name: "Silvassa", district: "Dadra & Nagar Haveli", state: "Dadra & Nagar Haveli and Daman & Diu", city_tier: "rural", location_opportunity_index: 0.20, average_daily_footfall_multiplier: 2.60, purchasing_power_index: 0.28, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-029", pin_code: "796001", city_name: "Aizawl", district: "Aizawl", state: "Mizoram", city_tier: "rural", location_opportunity_index: 0.25, average_daily_footfall_multiplier: 2.40, purchasing_power_index: 0.32, updated_at: "2026-01-01T00:00:00Z" },
  { location_id: "loc-030", pin_code: "799001", city_name: "Agartala", district: "West Tripura", state: "Tripura", city_tier: "rural", location_opportunity_index: 0.24, average_daily_footfall_multiplier: 2.45, purchasing_power_index: 0.30, updated_at: "2026-01-01T00:00:00Z" },
];
