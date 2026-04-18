"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { usePreferencesStore } from "@/lib/stores/preferences.store";
import { useToastStore } from "@/lib/stores/toast.store";
import type { ApiResponse } from "@/lib/types";
import type { RecentRedemption } from "@/lib/api/services/merchant.service";

export interface IncomingTransaction {
  id: number;
  bill_amount: number;
  discount_applied: number;
  total_paid: number;
  customer_name: string | null;
  customer_initial: string;
  coupon_code: string | null;
  coupon_title: string | null;
  created_at: string;
}

/**
 * Play a short "ding" via the Web Audio API. Avoids shipping an audio asset
 * and works offline. Only fires after the user has interacted with the page
 * (browsers block AudioContext creation until a user gesture).
 */
function playDing(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.18);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext creation blocked (no user gesture yet) — silently ignore.
  }
}

/**
 * useTransactionStream — subscribes to `private-merchant.{id}` via Laravel Reverb
 * and, for each `transaction.created` event:
 *   - plays a soft "ding" (respects usePreferencesStore().soundEnabled + gesture gating)
 *   - raises a toast via useToastStore
 *   - prepends the incoming txn to the cached latest-5 redemptions list so the
 *     dashboard card updates instantly (no extra HTTP round-trip)
 *   - invalidates dashboard/rolling-score queries so KPIs refresh promptly
 *
 * Pass an empty `branchId` to disable.
 */
export function useTransactionStream(branchId: string | number): {
  connected: boolean;
} {
  const qc = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const gestureUnlockedRef = useRef(false);
  const connectedRef = useRef(false);

  // Track first user gesture so we can legally play audio afterwards.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onGesture = () => {
      gestureUnlockedRef.current = true;
      window.removeEventListener("click", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };
    window.addEventListener("click", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    window.addEventListener("touchstart", onGesture, { once: true });
    return () => {
      window.removeEventListener("click", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
    };
  }, []);

  useEffect(() => {
    if (!branchId) return;

    const channelName = `merchant.${branchId}`;

    let channel: ReturnType<ReturnType<typeof getEcho>["private"]> | null = null;
    try {
      const echo = getEcho();
      channel = echo.private(channelName);

      channel.listen(".transaction.created", (payload: IncomingTransaction) => {
        connectedRef.current = true;

        // 1. Optimistically update recent redemptions so the card animates in.
        qc.setQueryData<ApiResponse<{ rows: RecentRedemption[] }> | undefined>(
          ["recent-redemptions"],
          (prev) => {
            if (!prev) return prev;
            const next: RecentRedemption = {
              id: payload.id,
              customer_name: payload.customer_name,
              customer_initial: payload.customer_initial,
              customer_phone: null,
              coupon_code: payload.coupon_code,
              coupon_title: payload.coupon_title,
              discount_applied: payload.discount_applied,
              bill_amount: payload.bill_amount,
              total_paid: payload.total_paid,
              created_at: payload.created_at,
            };
            const rows = [next, ...(prev.data?.rows ?? [])].slice(0, 5);
            return { ...prev, data: { rows } };
          },
        );

        // 2. Refresh derived data.
        qc.invalidateQueries({ queryKey: ["recent-redemptions"] });
        qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
        qc.invalidateQueries({ queryKey: ["branchScore"] });
        qc.invalidateQueries({ queryKey: ["rolling-score"] });

        // 3. Sound + toast.
        if (soundEnabled && gestureUnlockedRef.current) {
          playDing();
        }
        pushToast({
          title: `New transaction • ₹${payload.total_paid.toFixed(0)}`,
          description:
            (payload.customer_name ?? "Customer") +
            (payload.coupon_code ? ` used ${payload.coupon_code}` : ""),
          variant: "success",
        });
      });

      connectedRef.current = true;
    } catch {
      connectedRef.current = false;
    }

    return () => {
      try {
        if (channel) getEcho().leaveChannel(`private-${channelName}`);
      } catch {
        // noop
      }
    };
  }, [branchId, qc, pushToast, soundEnabled]);

  return { connected: connectedRef.current };
}
