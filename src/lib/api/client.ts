/**
 * API Client
 *
 * Talks DIRECTLY to the kutoot Laravel backend (no Next.js proxy layer).
 * Configure NEXT_PUBLIC_BACKEND_URL to the dashboard API root, e.g.
 *   https://kutoot.test/api/v1/dashboard
 */
import axios from "axios";

const DEFAULT_LOCAL_BACKEND = "https://kutoot.test/api/v1/dashboard";
const DEFAULT_PRODUCTION_BACKEND = "https://dev.kutoot.com/api/v1/dashboard";

const DEFAULT_BACKEND =
  process.env.NODE_ENV === "production"
    ? DEFAULT_PRODUCTION_BACKEND
    : DEFAULT_LOCAL_BACKEND;

function normalizeBackendBaseUrl(value: string): string {
  const raw = (value || "").trim();
  const noTrailingSlashes = raw.replace(/\/+$/, "");

  if (!noTrailingSlashes) {
    return DEFAULT_BACKEND;
  }

  // Legacy values used /api/dashboard before the v1 route group existed.
  if (/\/api\/dashboard$/i.test(noTrailingSlashes)) {
    return noTrailingSlashes.replace(/\/api\/dashboard$/i, "/api/v1/dashboard");
  }

  // Accept /api/v1 and append dashboard scope expected by merchant-panel services.
  if (/\/api\/v1$/i.test(noTrailingSlashes)) {
    return `${noTrailingSlashes}/dashboard`;
  }

  // Accept bare /api and map to versioned dashboard scope.
  if (/\/api$/i.test(noTrailingSlashes)) {
    return `${noTrailingSlashes}/v1/dashboard`;
  }

  return noTrailingSlashes;
}

export const BACKEND_BASE_URL =
  normalizeBackendBaseUrl(
    process.env.NEXT_PUBLIC_BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      DEFAULT_BACKEND,
  );

export const AUTH_TOKEN_STORAGE_KEY = "kutoot_token";
export const AUTH_USER_COOKIE = "kutoot_auth";
/** Set alongside the bearer token so middleware can detect an active session. */
export const AUTH_SESSION_COOKIE = "kutoot_session";

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor: attach Bearer token + ops-hub location scope
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const authCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${AUTH_USER_COOKIE}=`));
      if (authCookie) {
        const raw = decodeURIComponent(authCookie.split("=").slice(1).join("="));
        const user = JSON.parse(raw) as {
          role?: string;
          default_location_id?: string;
          branch_id?: string | null;
          attached_locations?: { id: number | string }[];
        };

        const needsLocationScope =
          config.url?.startsWith("/merchant") || config.url?.startsWith("/leaderboard");

        if (needsLocationScope) {
          let locationId: string | null = null;
          const selected = window.localStorage.getItem("kutoot_selected_location_id");
          if (selected) {
            try {
              const parsed = JSON.parse(selected) as { state?: { selectedLocationId?: string | null } };
              locationId = parsed.state?.selectedLocationId ?? null;
            } catch {
              locationId = null;
            }
          }

          if (!locationId) {
            locationId = user.default_location_id ?? user.branch_id ?? null;
          }

          const attachedIds = (user.attached_locations ?? []).map((loc) => String(loc.id));
          if (locationId && attachedIds.length > 0 && !attachedIds.includes(locationId)) {
            locationId = attachedIds[0] ?? locationId;
          }

          if (locationId) {
            config.headers = config.headers || {};
            config.headers["X-Location-Id"] = locationId;
            config.params = { ...(config.params as object), location_id: locationId };
          }
        }
      }
    } catch {
      /* ignore cookie parse errors */
    }
  }
  return config;
});

/** Structured API error that extends Error for proper unhandledRejection tracking. */
export class ApiError extends Error {
  code: string;
  status?: number;
  details?: unknown;
  constructor(code: string, message: string, status?: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Response interceptor: unwrap ApiResponse envelope into ApiError on failure
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      // Dynamic import avoids circular dependency with auth.service
      void import("./services/auth.service").then(({ clearAuthSession }) => clearAuthSession());
    }
    const raw = error.response?.data?.error || {
      code:
        error.response?.data?.code ||
        (status === 422 ? "VALIDATION_ERROR" : "NETWORK_ERROR"),
      message:
        error.response?.data?.message ||
        error.message ||
        "Network request failed",
    };
    return Promise.reject(
      new ApiError(
        raw.code ?? "NETWORK_ERROR",
        raw.message ?? "Request failed",
        status,
        error.response?.data?.errors ?? error.response?.data,
      ),
    );
  },
);

export default apiClient;
