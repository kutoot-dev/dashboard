"use client";

import axios from "axios";
import { ApiError } from "./client";

const DEFAULT_LOCAL_BACKEND = "https://kutoot.test/api/v1";
const DEFAULT_PRODUCTION_BACKEND = "https://dev.kutoot.com/api/v1";

function normalizeCommunityBaseUrl(value: string): string {
  const raw = (value || "").trim().replace(/\/+$/, "");
  if (!raw) {
    return process.env.NODE_ENV === "production"
      ? DEFAULT_PRODUCTION_BACKEND
      : DEFAULT_LOCAL_BACKEND;
  }
  if (/\/api\/v1\/dashboard$/i.test(raw)) {
    return raw.replace(/\/dashboard$/i, "");
  }
  if (/\/api\/dashboard$/i.test(raw)) {
    return raw.replace(/\/api\/dashboard$/i, "/api/v1");
  }
  if (/\/api$/i.test(raw)) {
    return `${raw}/v1`;
  }
  return raw;
}

export const COMMUNITY_BACKEND_BASE_URL = normalizeCommunityBaseUrl(
  process.env.NEXT_PUBLIC_COMMUNITY_BACKEND_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "",
);

export const COMMUNITY_TOKEN_STORAGE_KEY = "kutoot_user_token";
export const COMMUNITY_AUTH_USER_COOKIE = "kutoot_user_auth";
export const COMMUNITY_SESSION_COOKIE = "kutoot_user_session";

export const communityApiClient = axios.create({
  baseURL: COMMUNITY_BACKEND_BASE_URL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15000,
  withCredentials: true,
});

communityApiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(COMMUNITY_TOKEN_STORAGE_KEY);
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

communityApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(COMMUNITY_TOKEN_STORAGE_KEY);
      document.cookie = `${COMMUNITY_AUTH_USER_COOKIE}=; Max-Age=0; path=/`;
      document.cookie = `${COMMUNITY_SESSION_COOKIE}=; Max-Age=0; path=/`;
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

export default communityApiClient;
