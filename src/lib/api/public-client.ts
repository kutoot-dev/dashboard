/**
 * Public Kutoot API client (v1 root, not dashboard-scoped).
 * Used for unauthenticated flows such as Operations Hub interest capture.
 */
import axios from "axios";
import { BACKEND_BASE_URL } from "./client";

function resolvePublicApiBaseUrl(): string {
  const dashboard = BACKEND_BASE_URL.replace(/\/+$/, "");
  if (/\/dashboard$/i.test(dashboard)) {
    return dashboard.replace(/\/dashboard$/i, "");
  }

  if (/\/api\/v1$/i.test(dashboard)) {
    return dashboard;
  }

  return process.env.NODE_ENV === "production"
    ? "https://dev.kutoot.com/api/v1"
    : "https://kutoot.test/api/v1";
}

export const PUBLIC_API_BASE_URL = resolvePublicApiBaseUrl();

const publicApiClient = axios.create({
  baseURL: PUBLIC_API_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: true,
});

export default publicApiClient;
