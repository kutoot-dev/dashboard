import { reverseGeocode } from "@/lib/api/services/geo.service";

export type ResolvedAddress = {
  pin_code?: string;
  state?: string;
  city?: string;
  locality?: string;
  state_id?: number | null;
};

/**
 * Reverse-geocode GPS coordinates via the kutoot API and return
 * normalized address fields for the onboarding form.
 */
export async function resolveAddressFromCoords(
  latitude: number,
  longitude: number,
): Promise<ResolvedAddress | null> {
  try {
    const res = await reverseGeocode(latitude, longitude);
    const data = res.data;
    if (!data) {
      return null;
    }

    return {
      pin_code: data.pin_code ?? undefined,
      state: data.state ?? undefined,
      city: data.city ?? undefined,
      locality: data.locality ?? undefined,
      state_id: data.state_id,
    };
  } catch {
    return null;
  }
}
