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

  echo = new Echo({
    broadcaster: "reverb",
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? "",
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 443),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    // Private/presence channels are authorised via the Next.js BFF which forwards
    // the merchant's Sanctum bearer token from the httpOnly cookie.
    authEndpoint: "/api/broadcasting/auth",
  });

  return echo;
}

/** Tear down the socket connection (call on unmount / logout). */
export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
}
