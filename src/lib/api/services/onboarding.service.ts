/**
 * Onboarding Service
 *
 * API client methods for the merchant onboarding wizard.
 * All verification endpoints are non-blocking — failures return
 * pending_manual_review status, never throw to stop onboarding.
 */
import type {
  ApiResponse,
  OnboardingApplication,
  ApplicationSummary,
  PhoneCheckResult,
  ExecutiveVerifyResult,
  OtpSendResult,
  OtpVerifyResult,
  GstVerifyResult,
  PanVerifyResult,
  BankVerifyResult,
  PaginatedData,
} from "@/lib/types";
import apiClient from "../client";

// ── Head Offices (for dropdown) ────────────────────────────────────

export interface OnboardingHeadOffice {
  ho_id: string;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  total_branches: number;
  status: string;
}

export async function getHeadOffices() {
  const res = await apiClient.get<ApiResponse<OnboardingHeadOffice[]>>(
    "/onboarding/head-offices",
  );
  return res.data;
}

// ── Application CRUD ───────────────────────────────────────────────

export async function createApplication(
  data: Partial<OnboardingApplication>,
) {
  const res = await apiClient.post<ApiResponse<OnboardingApplication>>(
    "/onboarding",
    data,
  );
  return res.data;
}

export async function getApplication(id: string) {
  const res = await apiClient.get<ApiResponse<OnboardingApplication>>(
    `/onboarding/${encodeURIComponent(id)}`,
  );
  return res.data;
}

export async function updateApplication(
  id: string,
  data: Partial<OnboardingApplication>,
) {
  const res = await apiClient.patch<ApiResponse<OnboardingApplication>>(
    `/onboarding/${encodeURIComponent(id)}`,
    data,
  );
  return res.data;
}

export async function listApplications(filters?: {
  status?: string;
  exec_id?: string;
  phone?: string;
  ho_id?: string;
}) {
  const params = filters || {};
  const res = await apiClient.get<
    ApiResponse<PaginatedData<ApplicationSummary>>
  >("/onboarding", { params });
  return res.data;
}

// ── Phone Check ────────────────────────────────────────────────────

export async function checkPhone(phone: string) {
  const res = await apiClient.post<ApiResponse<PhoneCheckResult>>(
    "/onboarding/check-phone",
    { phone },
  );
  return res.data;
}

// ── Executive Verification ─────────────────────────────────────────

export async function verifyExecutive(employeeCode: string) {
  const res = await apiClient.post<ApiResponse<ExecutiveVerifyResult>>(
    "/onboarding/verify-executive",
    { employee_code: employeeCode },
  );
  return res.data;
}

// ── OTP Flow ───────────────────────────────────────────────────────

export async function sendOtp(phone: string) {
  const res = await apiClient.post<ApiResponse<OtpSendResult>>(
    "/onboarding/send-otp",
    { phone },
  );
  return res.data;
}

export async function verifyOtp(phone: string, otp: string) {
  const res = await apiClient.post<ApiResponse<OtpVerifyResult>>(
    "/onboarding/verify-otp",
    { phone, otp },
  );
  return res.data;
}

// ── KYC Verification (non-blocking) ───────────────────────────────

export async function verifyGst(gstNumber: string, ownerName?: string) {
  try {
    const res = await apiClient.post<ApiResponse<GstVerifyResult>>(
      "/onboarding/verify-gst",
      { gst_number: gstNumber, owner_name: ownerName },
    );
    return res.data;
  } catch {
    // Non-blocking: return safe fallback
    return {
      success: true,
      data: {
        valid: false,
        business_name: null,
        business_address: null,
        status: "pending_manual_review" as const,
        message:
          "GST verification unavailable. Application will proceed with manual review.",
      },
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: "" },
      error: null,
    };
  }
}

export async function verifyPan(panNumber: string, ownerName?: string) {
  try {
    const res = await apiClient.post<ApiResponse<PanVerifyResult>>(
      "/onboarding/verify-pan",
      { pan_number: panNumber, owner_name: ownerName },
    );
    return res.data;
  } catch {
    return {
      success: true,
      data: {
        valid: false,
        holder_name: null,
        name_match: false,
        status: "pending_manual_review" as const,
        message:
          "PAN verification unavailable. Application will proceed with manual review.",
      },
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: "" },
      error: null,
    };
  }
}

// ── Bank Verification (non-blocking) ──────────────────────────────

export async function verifyBank(accountNumber: string, ifsc: string) {
  try {
    const res = await apiClient.post<ApiResponse<BankVerifyResult>>(
      "/onboarding/verify-bank",
      { account_number: accountNumber, ifsc },
    );
    return res.data;
  } catch {
    return {
      success: true,
      data: {
        valid: false,
        bank_name: null,
        branch_name: null,
        penny_drop_status: "pending" as const,
        message:
          "Bank verification unavailable. Will be retried. Onboarding continues.",
      },
      meta: { timestamp: new Date().toISOString(), period_id: null, request_id: "" },
      error: null,
    };
  }
}
