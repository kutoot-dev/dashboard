/**
 * API Client
 *
 * BACKEND SPEC: Central Axios instance configured with the API base URL.
 * When migrating to FastAPI/Laravel, just change NEXT_PUBLIC_API_BASE_URL
 * in .env to point to the real backend (e.g., https://api.kutoot.com/v1).
 */
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor: attach auth token if present
apiClient.interceptors.request.use((config) => {
  // Cookie-based auth is handled automatically by withCredentials
  return config;
});

/** Structured API error that extends Error for proper unhandledRejection tracking. */
export class ApiError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

// Response interceptor: unwrap ApiResponse envelope
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const raw = error.response?.data?.error || {
      code: "NETWORK_ERROR",
      message: error.message || "Network request failed",
    };
    return Promise.reject(new ApiError(raw.code ?? "NETWORK_ERROR", raw.message ?? "Request failed"));
  },
);

export default apiClient;
