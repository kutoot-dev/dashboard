"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useSelectedLocationStore } from "@/lib/stores/selected-location.store";

/**
 * For merchants: returns branch_id from auth.
 * For operations hub: returns persisted selected location, falling back to default.
 */
export function useEffectiveBranchId(): string {
  const { user } = useAuth();
  const selectedLocationId = useSelectedLocationStore((s) => s.selectedLocationId);

  if (!user) {
    return "";
  }

  if (user.role === "operations_hub") {
    if (selectedLocationId) {
      const allowed = user.attached_locations?.some((loc) => String(loc.id) === selectedLocationId);
      if (allowed) {
        return selectedLocationId;
      }
    }

    return user.default_location_id ?? user.branch_id ?? "";
  }

  return user.branch_id ?? "";
}
