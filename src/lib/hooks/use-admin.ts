import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getParameters,
  updateParameter,
  getFraudFlags,
  updateFraudFlag,
  getForceMajeure,
  createForceMajeure,
  getCohortHealth,
  simulatePayout,
} from "@/lib/api/services/admin.service";

export function useParameters() {
  return useQuery({
    queryKey: ["parameters"],
    queryFn: () => getParameters(),
    select: (res) => res.data,
  });
}

export function useUpdateParameter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: number }) =>
      updateParameter(key, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
    },
  });
}

export function useFraudFlags(status?: string) {
  return useQuery({
    queryKey: ["fraudFlags", status],
    queryFn: () => getFraudFlags(status),
    select: (res) => res.data,
  });
}

export function useUpdateFraudFlag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      action,
      status,
    }: {
      id: string;
      action: string;
      status: string;
    }) => updateFraudFlag(id, action, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fraudFlags"] });
    },
  });
}

export function useForceMajeure() {
  return useQuery({
    queryKey: ["forceMajeure"],
    queryFn: () => getForceMajeure(),
    select: (res) => res.data,
  });
}

export function useCreateForceMajeure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForceMajeure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forceMajeure"] });
    },
  });
}

export function useCohortHealth(sectorId?: string) {
  return useQuery({
    queryKey: ["cohortHealth", sectorId],
    queryFn: () => getCohortHealth(sectorId),
    select: (res) => res.data,
  });
}

export function usePayoutSimulation() {
  return useMutation({
    mutationFn: ({
      periodId,
      params,
    }: {
      periodId: string;
      params?: { pool_override?: number; top_n?: number };
    }) => simulatePayout(periodId, params),
  });
}
