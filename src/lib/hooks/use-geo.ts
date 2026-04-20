"use client";

import { useQuery } from "@tanstack/react-query";
import { getStates, type GeoState } from "@/lib/api/services/geo.service";

const FALLBACK_STATES: GeoState[] = [
  { code: "AP", name: "Andhra Pradesh", type: "state" },
  { code: "AR", name: "Arunachal Pradesh", type: "state" },
  { code: "AS", name: "Assam", type: "state" },
  { code: "BR", name: "Bihar", type: "state" },
  { code: "CG", name: "Chhattisgarh", type: "state" },
  { code: "GA", name: "Goa", type: "state" },
  { code: "GJ", name: "Gujarat", type: "state" },
  { code: "HR", name: "Haryana", type: "state" },
  { code: "HP", name: "Himachal Pradesh", type: "state" },
  { code: "JH", name: "Jharkhand", type: "state" },
  { code: "KA", name: "Karnataka", type: "state" },
  { code: "KL", name: "Kerala", type: "state" },
  { code: "MP", name: "Madhya Pradesh", type: "state" },
  { code: "MH", name: "Maharashtra", type: "state" },
  { code: "MN", name: "Manipur", type: "state" },
  { code: "ML", name: "Meghalaya", type: "state" },
  { code: "MZ", name: "Mizoram", type: "state" },
  { code: "NL", name: "Nagaland", type: "state" },
  { code: "OD", name: "Odisha", type: "state" },
  { code: "PB", name: "Punjab", type: "state" },
  { code: "RJ", name: "Rajasthan", type: "state" },
  { code: "SK", name: "Sikkim", type: "state" },
  { code: "TN", name: "Tamil Nadu", type: "state" },
  { code: "TG", name: "Telangana", type: "state" },
  { code: "TR", name: "Tripura", type: "state" },
  { code: "UP", name: "Uttar Pradesh", type: "state" },
  { code: "UK", name: "Uttarakhand", type: "state" },
  { code: "WB", name: "West Bengal", type: "state" },
  { code: "AN", name: "Andaman and Nicobar Islands", type: "union_territory" },
  { code: "CH", name: "Chandigarh", type: "union_territory" },
  { code: "DH", name: "Dadra and Nagar Haveli and Daman and Diu", type: "union_territory" },
  { code: "DL", name: "Delhi", type: "union_territory" },
  { code: "JK", name: "Jammu and Kashmir", type: "union_territory" },
  { code: "LA", name: "Ladakh", type: "union_territory" },
  { code: "LD", name: "Lakshadweep", type: "union_territory" },
  { code: "PY", name: "Puducherry", type: "union_territory" },
];

/**
 * Fetches the list of Indian states from the backend.
 * Falls back to a static list if the network call fails so the wizard
 * never blocks on geo data.
 */
export function useStates() {
  const query = useQuery({
    queryKey: ["geo", "states"],
    queryFn: async () => {
      const res = await getStates();
      return res.data?.states ?? FALLBACK_STATES;
    },
    staleTime: 24 * 60 * 60 * 1000, // 24h
    retry: 1,
  });

  return {
    ...query,
    states: query.data ?? FALLBACK_STATES,
  };
}
