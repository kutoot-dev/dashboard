/**
 * API Client
 *
 * Talks DIRECTLY to the kutoot Laravel backend (no Next.js proxy layer).
 * Configure NEXT_PUBLIC_BACKEND_URL to the dashboard API root, e.g.
 *   http://kutoot.test/api/dashboard
 */
import axios from "axios";

const DEFAULT_BACKEND = "http://kutoot.test/api/dashboard";

export const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_BACKEND;

export const AUTH_TOKEN_STORAGE_KEY = "kutoot_token";
export const AUTH_USER_COOKIE = "kutoot_auth";

const apiClient = axios.create({
  baseURL: BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: true,
});

// Request interceptor: attach Bearer token if stored locally (browser only)
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
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
    const raw = error.response?.data?.error || {
      code: status === 422 ? "VALIDATION_ERROR" : "NETWORK_ERROR",
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
