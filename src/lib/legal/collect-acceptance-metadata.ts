export type AcceptanceLocation = {
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
};

export function collectDeviceInfo(): Record<string, string> {
  if (typeof window === "undefined") {
    return {};
  }

  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; mobile?: boolean };
    connection?: { effectiveType?: string };
  };

  const deviceType = nav.userAgentData?.mobile === true
    ? "mobile"
    : nav.userAgentData?.mobile === false
      ? "desktop"
      : /Mobi|Android/i.test(navigator.userAgent)
        ? "mobile"
        : "desktop";

  return {
    platform: navigator.platform ?? "unknown",
    language: navigator.language ?? "unknown",
    screen: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown",
    user_agent: navigator.userAgent ?? "unknown",
    vendor: nav.userAgentData?.platform ?? navigator.vendor ?? "unknown",
    device_type: deviceType,
    connection: nav.connection?.effectiveType ?? "unknown",
  };
}

export function collectAcceptanceLocation(): Promise<AcceptanceLocation | null> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
          accuracy_meters: Number.isFinite(pos.coords.accuracy)
            ? Math.round(pos.coords.accuracy)
            : undefined,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 },
    );
  });
}

export async function collectLegalAcceptanceMetadata(): Promise<{
  device_info: Record<string, string>;
  acceptance_latitude?: number;
  acceptance_longitude?: number;
  acceptance_accuracy_meters?: number;
}> {
  const device_info = collectDeviceInfo();
  const location = await collectAcceptanceLocation();

  return {
    device_info,
    ...(location
      ? {
          acceptance_latitude: location.latitude,
          acceptance_longitude: location.longitude,
          ...(location.accuracy_meters != null
            ? { acceptance_accuracy_meters: location.accuracy_meters }
            : {}),
        }
      : {}),
  };
}
