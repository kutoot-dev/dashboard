import { useQuery } from "@tanstack/react-query";
import {
  getScoringPeriods,
  getPeriodScores,
  getScoresByDateRange,
} from "@/lib/api/services/scores.service";

export function useScoringPeriods() {
  return useQuery({
    queryKey: ["scoringPeriods"],
    queryFn: () => getScoringPeriods(),
    select: (res) => res.data,
  });
}

export function usePeriodScores(periodId: string) {
  return useQuery({
    queryKey: ["periodScores", periodId],
    queryFn: () => getPeriodScores(periodId),
    enabled: !!periodId,
    select: (res) => res.data,
  });
}

export function useScoresByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ["scoresByDateRange", startDate, endDate],
    queryFn: () => getScoresByDateRange(startDate, endDate),
    enabled: !!startDate && !!endDate,
    select: (res) => res.data,
  });
}
