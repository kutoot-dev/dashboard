import { useQuery } from "@tanstack/react-query";
import {
  getScoringPeriods,
  getPeriodScores,
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
