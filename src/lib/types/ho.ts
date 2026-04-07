/**
 * Types: Head Office entity
 *
 * DB TABLE: head_offices
 * COLUMNS: ho_id (UUID PK), name, contact_person, email, phone,
 *   total_branches (int), status (enum), created_at, updated_at
 * INDEXES: ho_id, status
 */

export type HOStatus = "active" | "suspended";

export interface HeadOffice {
  ho_id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  total_branches: number;
  status: HOStatus;
  created_at: string;
  updated_at: string;
}
