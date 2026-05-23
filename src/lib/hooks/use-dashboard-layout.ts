"use client";

/**
 * Dashboard layout state.
 *
 * Loads `dashboard.order` (string[]) from /merchant/ui-prefs once, exposes
 * `order` + `setOrder`, and debounces saves back to the same endpoint so
 * cards stay in the merchant's preferred sequence across devices.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUiPrefs, putUiPrefs, type MerchantUiPrefs } from "@/lib/api/services/merchant.service";

export const DASHBOARD_SECTION_IDS = [
  "stats-strip",
  "score-history",
  "improve",
  "referral",
  "boost-commission",
  "redemptions",
  "volume",
] as const;

export type DashboardSectionId = (typeof DASHBOARD_SECTION_IDS)[number];

export const DASHBOARD_TAB_LABELS: Record<DashboardSectionId, string> = {
  "stats-strip": "Today",
  "score-history": "Score trend",
  improve: "Improve",
  referral: "Referral",
  "boost-commission": "Growth boost",
  redemptions: "Redemptions",
  volume: "Activity",
};

const DEFAULT_ORDER: DashboardSectionId[] = [...DASHBOARD_SECTION_IDS];

function sanitizeOrder(input: unknown): DashboardSectionId[] {
  if (!Array.isArray(input)) return DEFAULT_ORDER;
  const known = new Set<DashboardSectionId>(DASHBOARD_SECTION_IDS);
  const valid = input.filter((id): id is DashboardSectionId =>
    typeof id === "string" && known.has(id as DashboardSectionId),
  );
  for (const id of DEFAULT_ORDER) if (!valid.includes(id)) valid.push(id);
  return valid;
}

export function useDashboardLayout() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["merchant-ui-prefs"],
    queryFn: getUiPrefs,
    staleTime: 60_000,
  });

  const remotePrefs: MerchantUiPrefs = (data?.data?.prefs as MerchantUiPrefs) ?? {};
  const remoteOrder = sanitizeOrder(remotePrefs?.["dashboard.order"]);

  const [order, setOrderState] = useState<DashboardSectionId[]>(remoteOrder);
  const synced = useRef(false);

  useEffect(() => {
    if (!isLoading && !synced.current) {
      setOrderState(remoteOrder);
      synced.current = true;
    }
  }, [isLoading, remoteOrder]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setOrder = useCallback(
    (next: DashboardSectionId[]) => {
      setOrderState(next);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        const prefs: MerchantUiPrefs = { ...remotePrefs, "dashboard.order": next };
        try {
          await putUiPrefs(prefs);
          qc.setQueryData(["merchant-ui-prefs"], (prev: ReturnType<typeof getUiPrefs> extends Promise<infer T> ? T : never) => {
            if (!prev?.data) return prev;
            return { ...prev, data: { prefs, updated_at: new Date().toISOString() } };
          });
        } catch {
          // best-effort persistence; layout still applied locally
        }
      }, 500);
    },
    [qc, remotePrefs],
  );

  return { order, setOrder, isLoading };
}
