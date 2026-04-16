import { useQuery } from "@tanstack/react-query";
import {
  getHoSummary,
  getHoBranches,
  getHoBranchScores,
  type HoSummary,
  type HoBranch,
} from "@/lib/api/services/merchant.service";
import type { BranchScore, Branch } from "@/lib/types";

/** Get HO summary (includes payout, best/worst branch) */
export function useHeadOffice(hoId: string) {
  return useQuery({
    queryKey: ["headOffice", hoId],
    queryFn: async () => {
      const res = await getHoSummary(hoId);
      return res.data;
    },
    enabled: !!hoId,
  });
}

/** Get all branches belonging to an HO (mapped to frontend Branch shape) */
export function useHOBranches(hoId: string) {
  return useQuery({
    queryKey: ["hoBranches", hoId],
    queryFn: async (): Promise<Branch[]> => {
      const res = await getHoBranches(hoId);
      const rows = (res.data as { rows: HoBranch[] })?.rows ?? (res.data as unknown as HoBranch[]);
      return (Array.isArray(rows) ? rows : []).map((b) => ({
        branch_id: String(b.id),
        ho_id: hoId,
        business_name: b.name,
        owner_name: "",
        phone: "",
        email: "",
        gst_number: null,
        registration_date: "",
        sector_id: "",
        location_id: "",
        business_type: "goods" as const,
        transaction_pattern: "high_frequency_low_value" as const,
        operating_hours_per_week: 0,
        is_franchise: false,
        is_regulated_margin: false,
        declared_capacity: null,
        platform_capture_percentage: 0,
        status: (b.status === "active" ? "active" : "dormant") as Branch["status"],
        created_at: "",
        updated_at: "",
      }));
    },
    enabled: !!hoId,
  });
}

/** Get latest scores for all branches in an HO */
export function useHOBranchScores(hoId: string) {
  return useQuery({
    queryKey: ["hoBranchScores", hoId],
    queryFn: async (): Promise<BranchScore[]> => {
      const res = await getHoBranchScores(hoId);
      return res.data ?? [];
    },
    enabled: !!hoId,
  });
}

/** Get full score trajectory for a specific branch (uses branch score endpoint) */
export function useHOBranchDetail(branchId: string) {
  return useQuery({
    queryKey: ["hoBranchDetail", branchId],
    queryFn: async () => {
      const { getBranchScore } = await import("@/lib/api/services/branches.service");
      const res = await getBranchScore(branchId);
      return res.data ? [res.data] : [];
    },
    enabled: !!branchId,
  });
}

/** Get aggregate portfolio value for an HO from the enhanced summary */
export function useHOPortfolio(hoId: string) {
  return useQuery({
    queryKey: ["hoPortfolio", hoId],
    queryFn: async () => {
      const res = await getHoSummary(hoId);
      const d = res.data as HoSummary;
      return {
        totalBranches: d.total_branches,
        totalPayout: d.total_payout ?? 0,
        avgScore: d.avg_score,
        bestBranchId: d.best_branch?.id ?? null,
        bestBranchName: d.best_branch?.name ?? null,
        worstBranchId: d.worst_branch?.id ?? null,
        worstBranchName: d.worst_branch?.name ?? null,
      };
    },
    enabled: !!hoId,
  });
}
