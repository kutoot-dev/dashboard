"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getScoringWeights } from "@/lib/api/services/scoring.service";
import { SUB_SCORE_ORDER } from "@/lib/constants/scoring";
import { normalizeScoringWeights } from "@/lib/utils/scoring-weights";

export function useScoringWeights(metricKeys: string[] = SUB_SCORE_ORDER) {
  const query = useQuery({
    queryKey: ["scoring-weights"],
    queryFn: getScoringWeights,
    staleTime: 60_000,
    refetchInterval: 60_000,
    retry: false,
  });

  const weights = useMemo(
    () => normalizeScoringWeights(metricKeys, query.data?.data?.weights),
    [metricKeys, query.data?.data?.weights],
  );

  return {
    ...query,
    weights,
  };
}
