/**
 * Mock Data: Force Majeure Events
 *
 * 4 force majeure events: one resolved, three ongoing.
 * Each event specifies affected locations and the scoring adjustment applied.
 */

import type { ForceMajeureEvent } from "@/lib/types";

export const MOCK_FORCE_MAJEURE: ForceMajeureEvent[] = [
  {
    event_id: "fm-001",
    event_name: "Cyclone Mandous II — Coastal Tamil Nadu & Andhra Pradesh",
    event_type: "natural_disaster",
    affected_location_ids: ["loc-004", "loc-019", "loc-020"],
    start_timestamp: "2026-02-10T00:00:00Z",
    end_timestamp: "2026-02-28T23:59:59Z",
    scoring_adjustment_type: "pause",
    created_at: "2026-02-10T06:00:00Z",
  },
  {
    event_id: "fm-002",
    event_name: "North-East Telecom Infrastructure Outage",
    event_type: "platform_outage",
    affected_location_ids: ["loc-017", "loc-024", "loc-025", "loc-029", "loc-030"],
    start_timestamp: "2026-03-15T00:00:00Z",
    end_timestamp: "2026-04-12T23:59:59Z",
    scoring_adjustment_type: "baseline_correction",
    created_at: "2026-03-15T08:00:00Z",
  },
  {
    event_id: "fm-003",
    event_name: "Holi Festival Regulatory Restriction — Jewellery & Gold",
    event_type: "macro_economic",
    affected_location_ids: ["loc-001", "loc-002", "loc-003", "loc-006", "loc-007", "loc-008", "loc-009"],
    start_timestamp: "2026-03-10T00:00:00Z",
    end_timestamp: "2026-03-22T23:59:59Z",
    scoring_adjustment_type: "tolerance_widening",
    created_at: "2026-03-08T12:00:00Z",
  },
  {
    event_id: "fm-004",
    event_name: "Bihar Flood Relief — Patna District",
    event_type: "natural_disaster",
    affected_location_ids: ["loc-021"],
    start_timestamp: "2026-03-25T00:00:00Z",
    end_timestamp: "2026-04-12T23:59:59Z",
    scoring_adjustment_type: "pause",
    created_at: "2026-03-25T06:00:00Z",
  },
];
