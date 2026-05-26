"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { useSelectedLocationStore } from "@/lib/stores/selected-location.store";

export function LocationPicker() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const selectedLocationId = useSelectedLocationStore((s) => s.selectedLocationId);
  const setSelectedLocationId = useSelectedLocationStore((s) => s.setSelectedLocationId);

  const options = useMemo(() => {
    if (!user?.attached_locations?.length) {
      return [];
    }

    return user.attached_locations.map((loc) => ({
      value: String(loc.id),
      label: loc.category ? `${loc.branch_name} · ${loc.category}` : loc.branch_name,
    }));
  }, [user?.attached_locations]);

  if (!user || user.role !== "operations_hub" || options.length === 0) {
    return null;
  }

  const value = selectedLocationId ?? user.default_location_id ?? user.branch_id ?? options[0]?.value;

  return (
    <div className="mr-3 min-w-[200px] max-w-[280px]">
      <SearchableSelect
        value={value}
        options={options}
        placeholder="Select store"
        onChange={(next) => {
          setSelectedLocationId(next);
          void queryClient.invalidateQueries();
          router.refresh();
        }}
      />
    </div>
  );
}
