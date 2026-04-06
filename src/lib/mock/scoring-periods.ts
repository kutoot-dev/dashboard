/**
 * Mock Data: Scoring Periods
 *
 * 12 weekly scoring periods. Period 12 is the current active week,
 * period 11 is provisional (scores being calculated), periods 1-10 are finalized.
 * Date range: 2026-01-19 through 2026-04-12 (Mon–Sun each).
 */

import type { ScoringPeriod } from "@/lib/types";

export const MOCK_SCORING_PERIODS: ScoringPeriod[] = [
  { period_id: "sp-001", period_start: "2026-01-19T00:00:00Z", period_end: "2026-01-25T23:59:59Z", period_type: "weekly", pool_amount: 250000, status: "closed", created_at: "2026-01-19T00:00:00Z" },
  { period_id: "sp-002", period_start: "2026-01-26T00:00:00Z", period_end: "2026-02-01T23:59:59Z", period_type: "weekly", pool_amount: 250000, status: "closed", created_at: "2026-01-26T00:00:00Z" },
  { period_id: "sp-003", period_start: "2026-02-02T00:00:00Z", period_end: "2026-02-08T23:59:59Z", period_type: "weekly", pool_amount: 250000, status: "closed", created_at: "2026-02-02T00:00:00Z" },
  { period_id: "sp-004", period_start: "2026-02-09T00:00:00Z", period_end: "2026-02-15T23:59:59Z", period_type: "weekly", pool_amount: 275000, status: "closed", created_at: "2026-02-09T00:00:00Z" },
  { period_id: "sp-005", period_start: "2026-02-16T00:00:00Z", period_end: "2026-02-22T23:59:59Z", period_type: "weekly", pool_amount: 275000, status: "closed", created_at: "2026-02-16T00:00:00Z" },
  { period_id: "sp-006", period_start: "2026-02-23T00:00:00Z", period_end: "2026-03-01T23:59:59Z", period_type: "weekly", pool_amount: 275000, status: "closed", created_at: "2026-02-23T00:00:00Z" },
  { period_id: "sp-007", period_start: "2026-03-02T00:00:00Z", period_end: "2026-03-08T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "closed", created_at: "2026-03-02T00:00:00Z" },
  { period_id: "sp-008", period_start: "2026-03-09T00:00:00Z", period_end: "2026-03-15T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "closed", created_at: "2026-03-09T00:00:00Z" },
  { period_id: "sp-009", period_start: "2026-03-16T00:00:00Z", period_end: "2026-03-22T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "closed", created_at: "2026-03-16T00:00:00Z" },
  { period_id: "sp-010", period_start: "2026-03-23T00:00:00Z", period_end: "2026-03-29T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "closed", created_at: "2026-03-23T00:00:00Z" },
  { period_id: "sp-011", period_start: "2026-03-30T00:00:00Z", period_end: "2026-04-05T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "calculating", created_at: "2026-03-30T00:00:00Z" },
  { period_id: "sp-012", period_start: "2026-04-06T00:00:00Z", period_end: "2026-04-12T23:59:59Z", period_type: "weekly", pool_amount: 300000, status: "open", created_at: "2026-04-06T00:00:00Z" },
];
