import { useQuery } from "@tanstack/react-query";
import { MOCK_HEAD_OFFICES, getBranchIdsForHO } from "@/lib/mock/head-offices";
import { MOCK_BRANCHES } from "@/lib/mock/branches";
import { getLatestScores, getBranchScores } from "@/lib/mock/scores";
import type { HeadOffice, Branch, BranchScore } from "@/lib/types";

/** Get a single HO by ID */
export function useHeadOffice(hoId: string) {
  return useQuery({
    queryKey: ["headOffice", hoId],
    queryFn: (): HeadOffice | undefined =>
      MOCK_HEAD_OFFICES.find((ho) => ho.ho_id === hoId),
    enabled: !!hoId,
  });
}

/** Get all branches belonging to an HO */
export function useHOBranches(hoId: string) {
  return useQuery({
    queryKey: ["hoBranches", hoId],
    queryFn: (): Branch[] => {
      const ids = new Set(getBranchIdsForHO(hoId));
      return MOCK_BRANCHES.filter((b) => ids.has(b.branch_id));
    },
    enabled: !!hoId,
  });
}

/** Get latest scores for all branches in an HO */
export function useHOBranchScores(hoId: string) {
  return useQuery({
    queryKey: ["hoBranchScores", hoId],
    queryFn: (): BranchScore[] => {
      const branchIds = new Set(getBranchIdsForHO(hoId));
      return getLatestScores().filter((s) => branchIds.has(s.branch_id));
    },
    enabled: !!hoId,
  });
}

/** Get full score trajectory for a specific branch (used by HO detail view) */
export function useHOBranchDetail(branchId: string) {
  return useQuery({
    queryKey: ["hoBranchDetail", branchId],
    queryFn: () => getBranchScores(branchId),
    enabled: !!branchId,
  });
}

/** Get aggregate portfolio value for an HO (sum of latest payout_amounts) */
export function useHOPortfolio(hoId: string) {
  return useQuery({
    queryKey: ["hoPortfolio", hoId],
    queryFn: () => {
      const branchIds = new Set(getBranchIdsForHO(hoId));
      const latestScores = getLatestScores().filter((s) =>
        branchIds.has(s.branch_id)
      );
      const totalPayout = latestScores.reduce(
        (sum, s) => sum + s.payout_amount,
        0
      );
      const avgScore =
        latestScores.length > 0
          ? latestScores.reduce((sum, s) => sum + s.composite_index_score, 0) /
            latestScores.length
          : 0;
      const best = latestScores.reduce(
        (top, s) =>
          s.composite_index_score > (top?.composite_index_score ?? 0) ? s : top,
        latestScores[0]
      );
      const worst = latestScores.reduce(
        (bot, s) =>
          s.composite_index_score < (bot?.composite_index_score ?? 100)
            ? s
            : bot,
        latestScores[0]
      );

      return {
        totalBranches: latestScores.length,
        totalPayout,
        avgScore: Math.round(avgScore * 100) / 100,
        bestBranchId: best?.branch_id ?? null,
        worstBranchId: worst?.branch_id ?? null,
      };
    },
    enabled: !!hoId,
  });
}
