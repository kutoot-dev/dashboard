import { BACKEND_BASE_URL } from "@/lib/api/client";
import {
  DEFAULT_REVERB_APP_KEY,
  readRealtimeConfig,
} from "@/lib/realtime-storage";
import type { MerchantRealtimeConfig } from "@/lib/types/realtime";

export interface ReverbClientConfig {
  key: string;
  host: string;
  port: number;
  scheme: "http" | "https";
  authEndpoint: string;
}

function apiOrigin(): string {
  try {
    return new URL(BACKEND_BASE_URL).origin;
  } catch {
    return "http://localhost";
  }
}

function fallbackFromApiUrl(): Omit<ReverbClientConfig, "key"> {
  const apiUrl = new URL(apiOrigin());
  const isLocalHerd = apiUrl.hostname === "localhost" || apiUrl.hostname.endsWith(".test");

  if (isLocalHerd) {
    return {
      host: "localhost",
      port: 8080,
      scheme: "http",
      authEndpoint: `${apiUrl.origin}/broadcasting/auth`,
    };
  }

  return {
    host: apiUrl.hostname,
    port: apiUrl.protocol === "https:" ? 443 : 8080,
    scheme: apiUrl.protocol === "https:" ? "https" : "http",
    authEndpoint: `${apiUrl.origin}/broadcasting/auth`,
  };
}

function fromServerRealtime(realtime: MerchantRealtimeConfig): ReverbClientConfig {
  const scheme = (realtime.scheme === "https" ? "https" : "http") as "http" | "https";

  return {
    key: realtime.app_key,
    host: realtime.host,
    port: Number(realtime.port) || (scheme === "https" ? 443 : 8080),
    scheme,
    authEndpoint: realtime.auth_endpoint || `${apiOrigin()}/broadcasting/auth`,
  };
}

/**
 * Resolve Reverb client settings from the API login/me payload first, then API hostname.
 */
export function resolveReverbConfig(): ReverbClientConfig {
  const stored = readRealtimeConfig();
  if (stored) {
    return fromServerRealtime(stored);
  }

  const fallback = fallbackFromApiUrl();
  const envKey = (process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "").trim();

  return {
    ...fallback,
    key: envKey || DEFAULT_REVERB_APP_KEY,
  };
}

export function isReverbConfigured(): boolean {
  return resolveReverbConfig().key.length > 0;
}
