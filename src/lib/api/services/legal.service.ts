import type {
  ApiResponse,
  LegalAcceptResult,
  LegalDocumentDetail,
  LegalDocumentSummary,
  LegalStatusResponse,
} from "@/lib/types";
import apiClient from "../client";

export function collectDeviceInfo(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  return {
    platform: navigator.platform ?? "unknown",
    language: navigator.language ?? "unknown",
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown",
  };
}

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
  context?: "onboarding" | "merchant_portal";
}) {
  const res = await apiClient.post<ApiResponse<LegalAcceptResult>>("/legal/accept", {
    ...payload,
    device_info: payload.device_info ?? collectDeviceInfo(),
  });

  return res.data;
}

export async function getLegalStatus() {
  const res = await apiClient.get<ApiResponse<LegalStatusResponse>>("/legal/status");

  return res.data;
}
