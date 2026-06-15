"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useSelectedLocationStore } from "@/lib/stores/selected-location.store";

/**
 * Returns the active merchant location id for API calls.
 * Supports operations hub and merchants with multiple stores on one login.
 */
export function useEffectiveBranchId(): string {
  const { user } = useAuth();
  const selectedLocationId = useSelectedLocationStore((s) => s.selectedLocationId);

  if (!user) {
    return "";
  }

  const locations = user.attached_locations ?? [];

  if (locations.length > 0) {
    if (selectedLocationId) {
      const allowed = locations.some((loc) => String(loc.id) === selectedLocationId);
      if (allowed) {
        return selectedLocationId;
      }
    }

    return user.default_location_id ?? user.branch_id ?? String(locations[0]?.id ?? "");
  }

  return user.branch_id ?? "";
}
