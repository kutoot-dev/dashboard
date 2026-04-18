"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useBranchScore } from "@/lib/hooks/use-branch-data";
import { useKMI } from "@/lib/hooks/use-kmi";
import { fireCelebration, fireGoldRain, fireSparkle } from "@/lib/utils/effects";
import { usePreferencesStore } from "@/lib/stores/preferences.store";

/**
 * AchievementWatcher — monitors the authenticated merchant's rank and KBI
 * change and fires confetti + toast-like announcements for meaningful
 * improvements. Rendered globally inside the AppShell so achievements trigger
 * regardless of which page the merchant is on.
 *
 * Heuristics (kept deliberately conservative to avoid noise):
 *   - Rank improves by 5+ positions → gold rain
 *   - Rank improves by 1-4 positions → celebration burst
 *   - Composite score crosses a 10-point boundary upward → sparkle
 *   - KBI change_percent > 3% in positive direction → sparkle
 *
 * Announcements are throttled per tab via sessionStorage so a refresh won't
 * replay the same celebration.
 */
export function AchievementWatcher() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const { data: score } = useBranchScore(branchId);
  const kmi = useKMI();
  const { soundEnabled } = usePreferencesStore();

  const prevRankRef = useRef<number | null>(null);
  const prevScoreBandRef = useRef<number | null>(null);
  const prevKbiChangeRef = useRef<number>(0);

  useEffect(() => {
    if (!score) return;

    const currentRank = score.final_rank ?? null;
    const currentScore = score.composite_index_score ?? 0;
    const currentBand = Math.floor(currentScore / 10);

    if (prevRankRef.current !== null && currentRank !== null) {
      const delta = prevRankRef.current - currentRank; // positive = moved up
      if (delta >= 5) {
        void fireGoldRain();
        announce(`🏆 Climbed ${delta} spots — now Rank #${currentRank}!`, soundEnabled);
      } else if (delta >= 1) {
        void fireCelebration();
        announce(`🔺 Rank up! #${currentRank}`, soundEnabled);
      }
    }
    prevRankRef.current = currentRank;

    if (
      prevScoreBandRef.current !== null &&
      currentBand > prevScoreBandRef.current
    ) {
      void fireSparkle();
      announce(`✨ Score crossed ${currentBand * 10}`, soundEnabled);
    }
    prevScoreBandRef.current = currentBand;
  }, [score, soundEnabled]);

  useEffect(() => {
    if (!kmi) return;
    const change = kmi.changePercent ?? 0;
    if (
      prevKbiChangeRef.current <= 3 &&
      change > 3 &&
      kmi.isPositive
    ) {
      void fireSparkle();
      announce(`📈 KBI up +${change.toFixed(1)}%`, soundEnabled);
    }
    prevKbiChangeRef.current = change;
  }, [kmi, soundEnabled]);

  return null;
}

/**
 * Lightweight toast — reuses a single mounted container so pages don't have to
 * render it. Falls back to console.log if the DOM isn't available yet.
 */
function announce(message: string, withSound: boolean) {
  if (typeof window === "undefined") return;
  const key = `achv:${message}`;
  try {
    const last = window.sessionStorage.getItem(key);
    if (last && Date.now() - Number(last) < 30_000) return;
    window.sessionStorage.setItem(key, String(Date.now()));
  } catch {
    // ignore quota errors
  }

  const container = ensureContainer();
  const toast = document.createElement("div");
  toast.className =
    "pointer-events-auto rounded-lg border border-accent/40 bg-card/90 px-3 py-2 font-mono text-xs text-foreground shadow-lg backdrop-blur transition-all";
  toast.style.opacity = "0";
  toast.style.transform = "translateY(-6px)";
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  window.setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-6px)";
    window.setTimeout(() => toast.remove(), 300);
  }, 4500);

  if (withSound) {
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      osc.type = "triangle";
      gain.gain.value = 0.03;
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {
      // silent
    }
  }
}

function ensureContainer(): HTMLElement {
  let node = document.getElementById("achievement-toast-container");
  if (!node) {
    node = document.createElement("div");
    node.id = "achievement-toast-container";
    node.className =
      "pointer-events-none fixed right-4 top-16 z-[9999] flex flex-col items-end gap-2";
    document.body.appendChild(node);
  }
  return node;
}
