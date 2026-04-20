/**
 * Laravel Echo client — configured for Laravel Reverb (Pusher-compatible).
 *
 * Import the singleton `echo` anywhere in client components to subscribe
 * to real-time broadcast channels.
 *
 * Env vars (add to .env.local):
 *   NEXT_PUBLIC_REVERB_APP_KEY  — matches kutoot REVERB_APP_KEY
 *   NEXT_PUBLIC_REVERB_HOST     — e.g. localhost
 *   NEXT_PUBLIC_REVERB_PORT     — e.g. 8080
 *   NEXT_PUBLIC_REVERB_SCHEME   — http | https
 */

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { AUTH_TOKEN_STORAGE_KEY, BACKEND_BASE_URL } from "@/lib/api/client";

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

let echo: Echo<"reverb"> | null = null;

export function getEcho(): Echo<"reverb"> {
  if (echo) return echo;

  if (typeof window === "undefined") {
    throw new Error("Echo can only be initialised on the client");
  }

  window.Pusher = Pusher;

  // Derive Laravel root URL from the dashboard API base, e.g.
  //   http://kutoot.test/api/dashboard  →  http://kutoot.test/broadcasting/auth
  let authEndpoint = "/broadcasting/auth";
  try {
    const apiUrl = new URL(BACKEND_BASE_URL);
    authEndpoint = `${apiUrl.protocol}//${apiUrl.host}/broadcasting/auth`;
  } catch {
    /* keep relative fallback */
  }

  const token =
    typeof window !== "undefined"
      ? window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) ?? ""
      : "";

  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    // Direct Reverb auth at Laravel; Bearer token attached for Sanctum guard.
    authEndpoint,
    auth: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  return echo;
}

/** Tear down the socket connection (call on unmount / logout). */
export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
}
