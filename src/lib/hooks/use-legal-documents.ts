"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptLegalDocument,
  collectDeviceInfo,
  collectLegalAcceptanceMetadata,
  getLegalDocument,
  getLegalStatus,
  getRequiredLegalDocuments,
} from "@/lib/api/services/legal.service";

export function useRequiredLegalDocuments(applicationId?: string | null) {
  return useQuery({
    queryKey: ["legal", "required", applicationId ?? "none"],
    queryFn: async () => {
      const res = await getRequiredLegalDocuments(applicationId);
      if (!res.success) {
        throw new Error("Failed to load required agreements");
      }
      return res.data ?? [];
    },
    enabled: Boolean(applicationId),
  });
}

export function useLegalDocument(documentId: number | null) {
  return useQuery({
    queryKey: ["legal", "document", documentId],
    queryFn: async () => {
      if (!documentId) return null;
      const res = await getLegalDocument(documentId);
      if (!res.success || !res.data) {
        throw new Error("Failed to load document");
      }
      return res.data;
    },
    enabled: documentId != null,
  });
}

export function useAcceptLegalDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: acceptLegalDocument,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["legal", "required"] });
      if (variables.application_id) {
        queryClient.invalidateQueries({
          queryKey: ["legal", "required", variables.application_id],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["legal", "status"] });
    },
  });
}

export function useLegalStatus(enabled = true) {
  return useQuery({
    queryKey: ["legal", "status"],
    queryFn: async () => {
      const res = await getLegalStatus();
      if (!res.success) {
        throw new Error("Failed to load legal status");
      }
      return res.data;
    },
    enabled,
  });
}

export { collectDeviceInfo, collectLegalAcceptanceMetadata };
