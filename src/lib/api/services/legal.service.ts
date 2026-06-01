import type {
  ApiResponse,
  LegalAcceptResult,
  LegalDocumentDetail,
  LegalDocumentSummary,
  LegalStatusResponse,
} from "@/lib/types";
import { collectLegalAcceptanceMetadata } from "@/lib/legal/collect-acceptance-metadata";
import apiClient from "../client";

export { collectDeviceInfo, collectAcceptanceLocation, collectLegalAcceptanceMetadata } from "@/lib/legal/collect-acceptance-metadata";

export async function getRequiredLegalDocuments(applicationId?: string | null) {
  const res = await apiClient.get<ApiResponse<LegalDocumentSummary[]>>("/legal/required", {
    params: {
      audience: "merchant",
      context: "onboarding",
      ...(applicationId ? { application_id: applicationId } : {}),
    },
  });

  return res.data;
}

export async function getLegalDocument(id: number) {
  const res = await apiClient.get<ApiResponse<LegalDocumentDetail>>(
    `/legal/documents/${id}`,
  );

  return res.data;
}

export async function acceptLegalDocument(payload: {
  document_id: number;
  version: string;
  content_hash?: string;
  application_id: string;
  scroll_completed: boolean;
  device_info?: Record<string, string>;
  acceptance_latitude?: number;
  acceptance_longitude?: number;
  acceptance_accuracy_meters?: number;
  context?: "onboarding" | "merchant_portal";
}) {
  const metadata =
    payload.device_info &&
    payload.acceptance_latitude != null &&
    payload.acceptance_longitude != null
      ? {
          device_info: payload.device_info,
          acceptance_latitude: payload.acceptance_latitude,
          acceptance_longitude: payload.acceptance_longitude,
          acceptance_accuracy_meters: payload.acceptance_accuracy_meters,
        }
      : await collectLegalAcceptanceMetadata();

  const res = await apiClient.post<ApiResponse<LegalAcceptResult>>("/legal/accept", {
    ...payload,
    ...metadata,
  });

  return res.data;
}

export async function getLegalStatus() {
  const res = await apiClient.get<ApiResponse<LegalStatusResponse>>("/legal/status");

  return res.data;
}
