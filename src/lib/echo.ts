/**
 * Laravel Echo client — configured for Laravel Reverb (Pusher-compatible).
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { AUTH_TOKEN_STORAGE_KEY, BACKEND_BASE_URL } from "@/lib/api/client";
import { isReverbConfigured, resolveReverbConfig } from "@/lib/reverb-config";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echo: Echo<"reverb"> | null = null;
let echoToken: string | null = null;

function readAuthToken(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? "";
}

export function isEchoConfigured(): boolean {
  return isReverbConfigured();
}

export function getEcho(): Echo<"reverb"> {
  if (typeof window === "undefined") {
    throw new Error("Echo can only be initialised on the client");
  }

  const token = readAuthToken();
  const config = resolveReverbConfig();

  if (!config.key) {
    throw new Error(
      "Reverb is not configured. Set NEXT_PUBLIC_REVERB_APP_KEY in merchant-panel/.env.local (must match kutoot REVERB_APP_KEY).",
    );
  }

  if (echo && echoToken === token) {
    return echo;
  }

  if (echo) {
    echo.disconnect();
    echo = null;
  }

  window.Pusher = Pusher;
  echoToken = token;

  echo = new Echo({
    broadcaster: "reverb",
    key: config.key,
    wsHost: config.host,
    wsPort: config.port,
    wssPort: config.port,
    forceTLS: config.scheme === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    authEndpoint: config.authEndpoint,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        Accept: "application/json",
      },
    },
  });

  if (process.env.NODE_ENV === "development") {
    const connector = echo.connector as { pusher?: { connection: { bind: (e: string, cb: (s: unknown) => void) => void } } };
    connector.pusher?.connection.bind("state_change", (states: unknown) => {
      console.debug("[Echo] connection", states, { host: config.host, port: config.port, api: BACKEND_BASE_URL });
    });
  }

  return echo;
}

/** Tear down the socket connection (call on logout / before re-auth). */
export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
  echoToken = null;
}
