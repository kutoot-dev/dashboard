"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { disconnectEcho, getEcho, isEchoConfigured } from "@/lib/echo";
import { usePreferencesStore } from "@/lib/stores/preferences.store";
import { useTransactionAlertStore } from "@/lib/stores/transaction-alert.store";
import { playTransactionDing } from "@/lib/utils/transaction-ding";
import type { ApiResponse } from "@/lib/types";
import type { RecentRedemption } from "@/lib/api/services/merchant.service";
import { AUTH_TOKEN_STORAGE_KEY } from "@/lib/api/client";

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
  payment_status?: string | null;
  type?: string | null;
}

/**
 * Subscribes to `private-merchant.{id}` via Laravel Reverb for live transaction alerts.
 */
export function useTransactionStream(
  branchId: string | number,
  authToken: string | null | undefined,
): { connected: boolean; configured: boolean } {
  const qc = useQueryClient();
  const showAlert = useTransactionAlertStore((s) => s.show);
  const soundEnabled = usePreferencesStore((s) => s.soundEnabled);
  const gestureUnlockedRef = useRef(false);
  const [connected, setConnected] = useState(false);
  const configured = isEchoConfigured();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onGesture = () => {
      gestureUnlockedRef.current = true;
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
    if (!branchId || !authToken || !configured) {
      setConnected(false);
      return;
    }

    const channelName = `merchant.${branchId}`;
    let cancelled = false;
    let channel: ReturnType<ReturnType<typeof getEcho>["private"]> | null = null;

    const onTransaction = (payload: IncomingTransaction) => {
      if (cancelled) return;

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

      qc.invalidateQueries({ queryKey: ["recent-redemptions"] });
      qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
      qc.invalidateQueries({ queryKey: ["branchScore"] });
      qc.invalidateQueries({ queryKey: ["rolling-score"] });

      showAlert(payload);
      if (soundEnabled && gestureUnlockedRef.current) {
        playTransactionDing();
      }
    };

    try {
      const echo = getEcho();
      channel = echo.private(channelName);

      channel.listen(".transaction.created", onTransaction);

      channel.subscribed(() => {
        if (!cancelled) {
          setConnected(true);
          if (process.env.NODE_ENV === "development") {
            console.debug("[Reverb] subscribed", `private-${channelName}`);
          }
        }
      });

      channel.error((error: unknown) => {
        setConnected(false);
        console.error("[Reverb] private channel error", channelName, error);
      });
    } catch (error) {
      setConnected(false);
      console.error("[Reverb] failed to subscribe", channelName, error);
    }

    return () => {
      cancelled = true;
      setConnected(false);
      try {
        if (channel) {
          channel.stopListening(".transaction.created");
        }
        getEcho().leaveChannel(`private-${channelName}`);
      } catch {
        // noop
      }
    };
  }, [branchId, authToken, configured, qc, showAlert, soundEnabled]);

  return { connected, configured };
}

/**
 * Sanctum token for Reverb auth. Re-reads when auth state changes (storage
 * events do not fire in the same tab after login).
 */
export function useAuthToken(isAuthenticated: boolean): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setToken(null);
      return;
    }
    setToken(window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY));
  }, [isAuthenticated]);

  return token;
}
