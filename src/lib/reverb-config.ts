import { BACKEND_BASE_URL } from "@/lib/api/client";

export interface ReverbClientConfig {
  key: string;
  host: string;
  port: number;
  scheme: "http" | "https";
  authEndpoint: string;
}

/**
 * Resolve Reverb client settings from env, with sensible fallbacks from the API base URL.
 */
export function resolveReverbConfig(): ReverbClientConfig {
  let apiOrigin = "http://localhost";
  try {
    apiOrigin = new URL(BACKEND_BASE_URL).origin;
  } catch {
    // keep default
  }

  const apiUrl = new URL(apiOrigin);
  const key = (process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "").trim();
  const scheme = ((process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http").trim() || "http") as
    | "http"
    | "https";
  const port = Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? (scheme === "https" ? 443 : 8080));

  // Default ws host: explicit env, else localhost for *.test Herd APIs, else API hostname.
  let host = (process.env.NEXT_PUBLIC_REVERB_HOST ?? "").trim();
  if (!host) {
    host = apiUrl.hostname.endsWith(".test") ? "localhost" : apiUrl.hostname;
  }

  return {
    key,
    host,
    port,
    scheme,
    authEndpoint: `${apiUrl.origin}/broadcasting/auth`,
  };
}

export function isReverbConfigured(): boolean {
  return resolveReverbConfig().key.length > 0;
}
