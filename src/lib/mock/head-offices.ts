/**
 * Mock Data: Head Offices
 *
 * 5 Head Office entities. Each HO manages ~10 branches.
 * Mapping: ho-001 → m-001..m-010, ho-002 → m-011..m-020,
 *          ho-003 → m-021..m-030, ho-004 → m-031..m-040,
 *          ho-005 → m-041..m-050
 */

import type { HeadOffice } from "@/lib/types";

export const MOCK_HEAD_OFFICES: HeadOffice[] = [
  {
    ho_id: "ho-001",
    name: "Sharma Group",
    contact_person: "Rajesh Sharma",
    email: "ho@sharmagroup.com",
    phone: "9800000001",
    total_branches: 10,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
  },
  {
    ho_id: "ho-002",
    name: "Verma Enterprises",
    contact_person: "Arjun Singh",
    email: "ho@vermaenterprises.com",
    phone: "9800000002",
    total_branches: 10,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
  },
  {
    ho_id: "ho-003",
    name: "Patel Corp",
    contact_person: "Venkatesh Rao",
    email: "ho@patelcorp.com",
    phone: "9800000003",
    total_branches: 10,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
  },
  {
    ho_id: "ho-004",
    name: "Singh Holdings",
    contact_person: "Siddharth Thakur",
    email: "ho@singhholdings.com",
    phone: "9800000004",
    total_branches: 10,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
  },
  {
    ho_id: "ho-005",
    name: "Reddy & Sons",
    contact_person: "Vijay Saxena",
    email: "ho@reddyandsons.com",
    phone: "9800000005",
    total_branches: 10,
    status: "active",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2026-03-30T00:00:00Z",
  },
];

/** Get HO by ID */
export function getHeadOffice(hoId: string): HeadOffice | undefined {
  return MOCK_HEAD_OFFICES.find((ho) => ho.ho_id === hoId);
}

/** Get the ho_id for a given branch_id (m-001..m-050) */
export function getHOForBranch(branchId: string): string {
  const num = parseInt(branchId.replace("m-", ""), 10);
  if (num >= 1 && num <= 10) return "ho-001";
  if (num >= 11 && num <= 20) return "ho-002";
  if (num >= 21 && num <= 30) return "ho-003";
  if (num >= 31 && num <= 40) return "ho-004";
  return "ho-005";
}

/** Get all branch IDs belonging to an HO */
export function getBranchIdsForHO(hoId: string): string[] {
  const hoNum = parseInt(hoId.replace("ho-", ""), 10);
  const start = (hoNum - 1) * 10 + 1;
  const end = hoNum * 10;
  return Array.from({ length: end - start + 1 }, (_, i) =>
    `m-${String(start + i).padStart(3, "0")}`
  );
}
