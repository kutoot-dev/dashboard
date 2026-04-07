"use client";

import { useState, useEffect, useRef } from "react";

function generateHistory(baseValue: number, points: number) {
  const data: { time: string; value: number }[] = [];
  let value = baseValue;
  const now = new Date();
  // Each point = 1 day apart, going backwards from now
  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const year = t.getFullYear();
    const month = String(t.getMonth() + 1).padStart(2, "0");
    const day = String(t.getDate()).padStart(2, "0");
    const timeStr = `${year}-${month}-${day}`;
    value += (Math.random() - 0.48) * 2.0; // slight upward bias
    value = Math.max(baseValue - 50, Math.min(baseValue + 80, value));
    data.push({ time: timeStr, value: Math.round(value * 100) / 100 });
  }
  return data;
}

/**
 * useKMI — generates and live-updates the Kutoot Branch Index
 * Base value: 1000 + average composite score offset (~247)
 */
export function useKMI(): {
  value: number;
  change: number;
  changePercent: number;
  history: { time: string; value: number }[];
  isPositive: boolean;
} {
  const baseValue = 1247;
  const openValueRef = useRef(0);
  const [mounted, setMounted] = useState(false);
  const [history, setHistory] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    setMounted(true);
    const initial = generateHistory(baseValue, 100);
    openValueRef.current = initial[0].value;
    setHistory(initial);

    const interval = setInterval(() => {
      setHistory((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.48) * 2.0;
        const newValue = Math.round((last.value + delta) * 100) / 100;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const timeStr = `${year}-${month}-${day}`;
        
        // If the date hasn't changed, update the last point instead of adding a duplicate
        if (last.time === timeStr) {
          const updated = [...prev];
          updated[updated.length - 1] = { time: timeStr, value: newValue };
          return updated;
        }
        
        // Date changed, add new point
        const next = [...prev.slice(1), { time: timeStr, value: newValue }];
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const currentValue = history.length > 0 ? history[history.length - 1].value : baseValue;
  const openValue = openValueRef.current || baseValue;
  const change = currentValue - openValue;
  const changePercent = openValue !== 0 ? (change / openValue) * 100 : 0;

  // Return placeholder values during SSR to avoid hydration mismatch
  if (!mounted) {
    return {
      value: baseValue,
      change: 0,
      changePercent: 0,
      history: [],
      isPositive: true,
    };
  }

  return {
    value: currentValue,
    change,
    changePercent,
    history,
    isPositive: change >= 0,
  };
}
