/**
 * Auth Service
 *
 * Talks DIRECTLY to the kutoot Laravel backend.
 * Login persists the Sanctum bearer token in localStorage and a small
 * non-httpOnly cookie so Next.js middleware can detect the auth state.
 */
import type { ApiResponse, AuthUser } from "@/lib/types";
import apiClient, { AUTH_TOKEN_STORAGE_KEY, AUTH_USER_COOKIE } from "../client";

interface MerchantSellerPayload {
  sellerId?: string | number;
  shopId?: string | number;
  shopName?: string;
  ownerName?: string;
  email?: string;
  status?: string;
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

  return {
    id,
    name: payload.shopName ?? payload.ownerName ?? "Merchant",
    email: payload.email ?? "",
    role: "merchant",
    branch_id: branchId,
  };
}

function setAuthCookie(user: AuthUser): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(user));
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_USER_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function clearAuthCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_USER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
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

  const envelope = res.data;
  const token = envelope.data?.token;
  const user = normaliseAuthUser(envelope.data?.seller);

  if (token && typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  }

  if (envelope.success && user) {
    setAuthCookie(user);
  }

  return toAuthEnvelope(user, envelope.message);
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

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  clearAuthCookie();

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

  if (res.data.success && user) {
    setAuthCookie(user);
  }

  return toAuthEnvelope(user, res.data.message);
}
