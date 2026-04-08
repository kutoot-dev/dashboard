/**
 * Onboarding Hooks
 *
 * React Query hooks for onboarding operations.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as onboardingService from "@/lib/api/services/onboarding.service";
import type { OnboardingApplication } from "@/lib/types";

// ── Queries ────────────────────────────────────────────────────────

export function useApplication(id: string | null) {
  return useQuery({
    queryKey: ["onboarding", "application", id],
    queryFn: () => onboardingService.getApplication(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useApplicationList(filters?: {
  status?: string;
  exec_id?: string;
  phone?: string;
}) {
  return useQuery({
    queryKey: ["onboarding", "list", filters],
    queryFn: () => onboardingService.listApplications(filters),
    select: (res) => res.data,
  });
}

// ── Mutations ──────────────────────────────────────────────────────

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<OnboardingApplication>) =>
      onboardingService.createApplication(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["onboarding", "list"] });
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OnboardingApplication>;
    }) => onboardingService.updateApplication(id, data),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: ["onboarding", "application", vars.id],
      });
      qc.invalidateQueries({ queryKey: ["onboarding", "list"] });
    },
  });
}

export function useCheckPhone() {
  return useMutation({
    mutationFn: (phone: string) => onboardingService.checkPhone(phone),
  });
}

export function useVerifyExecutive() {
  return useMutation({
    mutationFn: (code: string) => onboardingService.verifyExecutive(code),
  });
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) => onboardingService.sendOtp(phone),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      onboardingService.verifyOtp(phone, otp),
  });
}

export function useVerifyGst() {
  return useMutation({
    mutationFn: ({
      gstNumber,
      ownerName,
    }: {
      gstNumber: string;
      ownerName?: string;
    }) => onboardingService.verifyGst(gstNumber, ownerName),
  });
}

export function useVerifyPan() {
  return useMutation({
    mutationFn: ({
      panNumber,
      ownerName,
    }: {
      panNumber: string;
      ownerName?: string;
    }) => onboardingService.verifyPan(panNumber, ownerName),
  });
}

export function useVerifyBank() {
  return useMutation({
    mutationFn: ({
      accountNumber,
      ifsc,
    }: {
      accountNumber: string;
      ifsc: string;
    }) => onboardingService.verifyBank(accountNumber, ifsc),
  });
}
