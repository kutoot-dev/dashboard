import communityApiClient, {
  COMMUNITY_AUTH_USER_COOKIE,
  COMMUNITY_SESSION_COOKIE,
  COMMUNITY_TOKEN_STORAGE_KEY,
} from "@/lib/api/community-client";
import type {
  ApiEnvelope,
  CommunityAuthPayload,
  CommunityUser,
} from "@/lib/types/community";

function tokenFromPayload(payload: CommunityAuthPayload): string | null {
  return payload.token ?? payload.access_token ?? null;
}

function persistCommunitySession(payload: CommunityAuthPayload): CommunityUser | null {
  const token = tokenFromPayload(payload);
  const user = payload.user ?? null;

  if (typeof window !== "undefined") {
    if (token) {
      window.localStorage.setItem(COMMUNITY_TOKEN_STORAGE_KEY, token);
    }
    if (user) {
      const encoded = encodeURIComponent(JSON.stringify(user));
      document.cookie = `${COMMUNITY_AUTH_USER_COOKIE}=${encoded}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      document.cookie = `${COMMUNITY_SESSION_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  }

  return user;
}

export function clearCommunitySession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(COMMUNITY_TOKEN_STORAGE_KEY);
  document.cookie = `${COMMUNITY_AUTH_USER_COOKIE}=; Max-Age=0; path=/`;
  document.cookie = `${COMMUNITY_SESSION_COOKIE}=; Max-Age=0; path=/`;
}

export async function sendCommunityOtp(identifier: string): Promise<ApiEnvelope<{ debug_otp?: string }>> {
  const response = await communityApiClient.post<ApiEnvelope<{ debug_otp?: string }>>(
    "/auth/send-otp",
    { identifier },
  );
  return response.data;
}

export async function verifyCommunityOtp(identifier: string, otp: string): Promise<ApiEnvelope<CommunityAuthPayload>> {
  const response = await communityApiClient.post<ApiEnvelope<CommunityAuthPayload>>(
    "/auth/verify-otp",
    { identifier, otp, device_name: "merchant-panel-community" },
  );
  persistCommunitySession(response.data.data);
  return response.data;
}

export async function getCommunityMe(): Promise<ApiEnvelope<CommunityUser>> {
  const response = await communityApiClient.get<ApiEnvelope<CommunityUser>>("/auth/me");
  return response.data;
}

export async function logoutCommunity(): Promise<void> {
  try {
    await communityApiClient.post("/auth/logout");
  } finally {
    clearCommunitySession();
  }
}
