import { useQuery } from "@tanstack/react-query";
import {
  getBranch,
  getBranchScore,
  getBranchCandlesticks,
  getBranchVolume,
  getBranchPayouts,
  getBranchScoreHistory,
} from "@/lib/api/services/branches.service";

export function useBranch(branchId: string) {
  return useQuery({
    queryKey: ["branch", branchId],
    queryFn: () => getBranch(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}

export function useBranchScore(branchId: string, periodId?: string) {
  return useQuery({
    queryKey: ["branchScore", branchId, periodId],
    queryFn: () => getBranchScore(branchId, periodId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}

export function useBranchCandlesticks(branchId: string) {
  return useQuery({
    queryKey: ["branchCandlesticks", branchId],
    queryFn: () => getBranchCandlesticks(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}

export function useBranchVolume(branchId: string) {
  return useQuery({
    queryKey: ["branchVolume", branchId],
    queryFn: () => getBranchVolume(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}

export function useBranchPayouts(branchId: string) {
  return useQuery({
    queryKey: ["branchPayouts", branchId],
    queryFn: () => getBranchPayouts(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}

export function useBranchScoreHistory(branchId: string) {
  return useQuery({
    queryKey: ["branchScoreHistory", branchId],
    queryFn: () => getBranchScoreHistory(branchId),
    enabled: !!branchId,
    select: (res) => res.data,
  });
}
