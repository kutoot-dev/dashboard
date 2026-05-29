import type { MerchantRealtimeConfig } from "@/lib/types/realtime";

export const REALTIME_CONFIG_STORAGE_KEY = "kutoot_realtime";

/** Same defaults as kutoot ReverbConnectionResolver (public app key). */
export const DEFAULT_REVERB_APP_KEY = "i9naozk7xi7pdyn7fxor";

export function persistRealtimeConfig(config: MerchantRealtimeConfig | undefined | null): void {
  if (typeof window === "undefined" || !config?.app_key) {
    return;
  }
  window.localStorage.setItem(REALTIME_CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function readRealtimeConfig(): MerchantRealtimeConfig | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(REALTIME_CONFIG_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as MerchantRealtimeConfig;
    if (!parsed?.app_key) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearRealtimeConfig(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(REALTIME_CONFIG_STORAGE_KEY);
}
