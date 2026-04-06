/**
 * Types: Sector entity
 *
 * DB TABLE: sectors
 * COLUMNS: sector_id (PK), sector_name, sector_category (enum),
 *   typical_margin_floor (decimal), typical_margin_ceiling (decimal),
 *   typical_ticket_floor (decimal), typical_ticket_ceiling (decimal),
 *   typical_daily_transaction_floor (int), typical_daily_transaction_ceiling (int),
 *   is_regulated_margin (bool), seasonal_pattern (nullable JSON)
 * INDEXES: sector_id, sector_name
 */

export type SectorCategory = "goods" | "services" | "hybrid";

export interface Sector {
  sector_id: string;
  sector_name: string;
  sector_category: SectorCategory;
  typical_margin_floor: number;
  typical_margin_ceiling: number;
  typical_ticket_floor: number;
  typical_ticket_ceiling: number;
  typical_daily_transaction_floor: number;
  typical_daily_transaction_ceiling: number;
  is_regulated_margin: boolean;
  seasonal_pattern: number[] | null;
}
