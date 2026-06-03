/**
 * Auth Service
 *
 * Talks DIRECTLY to the kutoot Laravel backend.
 * Login persists the Sanctum bearer token in localStorage and a small
 * non-httpOnly cookie so Next.js middleware can detect the auth state.
 */
import type { ApiResponse, AuthUser } from "@/lib/types";
import type { MerchantRealtimeConfig } from "@/lib/types/realtime";
import { disconnectEcho } from "@/lib/echo";
import { clearRealtimeConfig, persistRealtimeConfig } from "@/lib/realtime-storage";
import apiClient, {
  AUTH_SESSION_COOKIE,
  AUTH_TOKEN_STORAGE_KEY,
  AUTH_USER_COOKIE,
} from "../client";

interface MerchantSellerPayload {
  sellerId?: string | number;
  shopId?: string | number;
  shopName?: string;
  ownerName?: string;
  email?: string;
  is_test?: boolean;
  scoring_engine_enabled?: boolean;
  requires_basic_details?: boolean;
  requires_wallet_kyc?: boolean;
  status?: string;
  role?: string;
  default_location_id?: string | number;
  realtime?: MerchantRealtimeConfig;
  attached_locations?: Array<{
    id: string | number;
    branch_name: string;
    merchant_category_id?: number | null;
    category?: string | null;
    role?: string;
  }>;
}

interface MerchantLoginPayload {
  token?: string;
  requires_terms_acceptance?: boolean;
  seller?: MerchantSellerPayload;
}

interface MerchantLoginResponse {
  success: boolean;
  message?: string;
  data?: MerchantLoginPayload;
}

interface MerchantMeResponse {
  success: boolean;
  message?: string;
  data?: MerchantSellerPayload & {
    requires_terms_acceptance?: boolean;
  };
}

interface GenericAuthResponse {
  success: boolean;
  message?: string;
}

interface MerchantPasswordResetOtpPayload {
  username: string;
}

interface MerchantPasswordResetPayload {
  username: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

const COOKIE_MAX_AGE_DAYS = 7;

function buildMeta(): ApiResponse<null>["meta"] {
  return {
    timestamp: new Date().toISOString(),
    period_id: null,
    request_id: "",
  };
}

function toAuthEnvelope(user: AuthUser | null, message?: string): ApiResponse<AuthUser | null> {
  if (user) {
    return {
      success: true,
      data: user,
      meta: buildMeta(),
      error: null,
    };
  }

  return {
    success: false,
    data: null,
    meta: buildMeta(),
    error: {
      code: "AUTH_ERROR",
      message: message ?? "Authentication failed",
    },
  };
}

function normaliseAuthUser(payload?: MerchantSellerPayload): AuthUser | null {
  if (!payload?.shopId) {
    return null;
  }

  const branchId = String(payload.shopId);
  const id = payload.sellerId ? String(payload.sellerId) : branchId;
  const role = payload.role === "operations_hub" ? "operations_hub" : "merchant";
  const storeRole =
    payload.role === "operations_hub"
      ? undefined
      : payload.role === "owner" || payload.role === "manager" || payload.role === "staff"
        ? payload.role
        : "owner";
  const defaultLocationId = payload.default_location_id
    ? String(payload.default_location_id)
    : branchId;

  const attached =
    payload.attached_locations?.map((loc) => ({
      id: loc.id,
      branch_name: loc.branch_name,
      merchant_category_id: loc.merchant_category_id,
      category: loc.category,
      role: loc.role,
    })) ?? [];

  return {
    id,
    name: payload.shopName ?? payload.ownerName ?? "Merchant",
    email: payload.email ?? "",
    role,
    store_role: role === "merchant" ? storeRole : undefined,
    branch_id: branchId,
    default_location_id: defaultLocationId,
    attached_locations: attached.length > 0 ? attached : undefined,
    is_test: Boolean(payload.is_test),
    scoring_engine_enabled:
      payload.scoring_engine_enabled !== undefined
        ? Boolean(payload.scoring_engine_enabled)
        : Boolean(payload.is_test),
    requires_basic_details: Boolean(payload.requires_basic_details),
    requires_wallet_kyc: Boolean(payload.requires_wallet_kyc),
  };
}

function cookieFlags(maxAge: number): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  return `Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function setAuthCookie(user: AuthUser): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const flags = cookieFlags(maxAge);
  const value = encodeURIComponent(JSON.stringify(user));
  document.cookie = `${AUTH_USER_COOKIE}=${value}; ${flags}`;
  document.cookie = `${AUTH_SESSION_COOKIE}=1; ${flags}`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  const flags = cookieFlags(0);
  document.cookie = `${AUTH_USER_COOKIE}=; ${flags}`;
  document.cookie = `${AUTH_SESSION_COOKIE}=; ${flags}`;
}

function syncRealtimeFromSeller(payload?: MerchantSellerPayload): void {
  persistRealtimeConfig(payload?.realtime ?? null);
}

/** Clear token, auth cookies, and any stale client session state. */
export function clearAuthSession(): void {
  disconnectEcho();
  clearRealtimeConfig();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  clearAuthCookie();
}

/**
 * Log in with merchant username and password.
 * Stores the bearer token in localStorage so subsequent requests carry it.
 */
export async function login(username: string, password: string): Promise<ApiResponse<AuthUser | null>> {
  const res = await apiClient.post<MerchantLoginResponse>("/auth/login", {
    username,
    password,
  });

  const user = persistLoginEnvelope(res.data);

  return toAuthEnvelope(user, res.data.message);
}

function persistLoginEnvelope(envelope: MerchantLoginResponse): AuthUser | null {
  const token = envelope.data?.token;
  const user = normaliseAuthUser(envelope.data?.seller);

  if (typeof window !== "undefined") {
    disconnectEcho();
    syncRealtimeFromSeller(envelope.data?.seller);
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    }
  }

  if (envelope.success && user) {
    setAuthCookie(user);
  }

  return user;
}

export async function sendLoginOtp(mobile: string): Promise<ApiResponse<null>> {
  const res = await apiClient.post<GenericAuthResponse>("/auth/otp/send", { mobile });

  return {
    success: !!res.data.success,
    data: null,
    meta: buildMeta(),
    error: res.data.success
      ? null
      : {
          code: "OTP_SEND_FAILED",
          message: res.data.message ?? "Could not send OTP.",
        },
  };
}

export async function loginWithOtp(
  mobile: string,
  otp: string,
): Promise<ApiResponse<AuthUser | null>> {
  const res = await apiClient.post<MerchantLoginResponse>("/auth/otp/login", {
    mobile,
    otp,
  });

  const user = persistLoginEnvelope(res.data);

  return toAuthEnvelope(user, res.data.message);
}

/**
 * Log out the current user.
 * Best-effort: revoke server token, then clear local storage and cookie.
 */
export async function logout() {
  try {
    await apiClient.post<ApiResponse<null>>("/auth/logout");
  } catch {
    /* ignore — clear locally regardless */
  }

  clearAuthSession();

  return {
    success: true,
    data: null,
    meta: { timestamp: new Date().toISOString(), period_id: null, request_id: "" },
    error: null,
  } as ApiResponse<null>;
}

/**
 * Get the currently authenticated user.
 */
export async function getMe(): Promise<ApiResponse<AuthUser | null>> {
  const res = await apiClient.get<MerchantMeResponse>("/auth/me");
  const user = normaliseAuthUser(res.data.data);

  if (res.data.success) {
    syncRealtimeFromSeller(res.data.data);
    if (user) {
      setAuthCookie(user);
    }
  }

  return toAuthEnvelope(user, res.data.message);
}

/**
 * Request a password reset email for merchant panel login.
 */
export async function requestPasswordReset(email: string): Promise<ApiResponse<null>> {
  const res = await apiClient.post<GenericAuthResponse>("/auth/forgot-password", { email });

  return {
    success: !!res.data.success,
    data: null,
    meta: buildMeta(),
    error: res.data.success
      ? null
      : {
          code: "PASSWORD_RESET_REQUEST_FAILED",
          message: res.data.message ?? "Could not send password reset link.",
        },
  };
}

/**
 * Send OTP to merchant's registered mobile for password reset.
 */
export async function requestMerchantPasswordResetOtp(username: string): Promise<ApiResponse<null>> {
  const payload: MerchantPasswordResetOtpPayload = { username };
  const res = await apiClient.post<GenericAuthResponse>("/merchant-locations/auth/password/otp/send", payload);

  return {
    success: !!res.data.success,
    data: null,
    meta: buildMeta(),
    error: res.data.success
      ? null
      : {
          code: "MERCHANT_RESET_OTP_SEND_FAILED",
          message: res.data.message ?? "Could not send reset OTP.",
        },
  };
}

/**
 * Reset merchant password using username + OTP.
 */
export async function resetMerchantPasswordWithOtp(payload: MerchantPasswordResetPayload): Promise<ApiResponse<null>> {
  const res = await apiClient.post<GenericAuthResponse>("/merchant-locations/auth/password/reset", payload);

  return {
    success: !!res.data.success,
    data: null,
    meta: buildMeta(),
    error: res.data.success
      ? null
      : {
          code: "MERCHANT_RESET_PASSWORD_FAILED",
          message: res.data.message ?? "Could not reset password.",
        },
  };
}
