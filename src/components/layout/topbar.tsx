"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/providers/auth-provider";
import { useTicker } from "@/lib/hooks";
import { useKMI } from "@/lib/hooks/use-kmi";
import { cn } from "@/lib/utils/cn";

export function Topbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { data: tickerItems } = useTicker();
  const kmi = useKMI();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-12 items-center border-b border-border bg-card">
      {/* KMI Badge */}
      <div className="flex shrink-0 items-center gap-2 border-r border-border px-3">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-primary">
          KMI
        </span>
        <span className="font-mono text-sm font-bold text-secondary">
          {kmi.value.toFixed(1)}
        </span>
        <span
          className={cn(
            "font-mono text-xs font-semibold",
            kmi.isPositive ? "text-success" : "text-error",
          )}
        >
          {kmi.isPositive ? "▲" : "▼"}
          {kmi.changePercent.toFixed(1)}%
        </span>
      </div>

      {/* Ticker tape */}
      <div className="flex-1 overflow-hidden">
        {tickerItems && tickerItems.length > 0 && (
          <div className="flex overflow-hidden">
            <div className="animate-ticker flex shrink-0 items-center gap-6 px-4">
              {[...tickerItems, ...tickerItems].map((item, i) => (
                <span
                  key={`${item.merchant_id}-${i}`}
                  className="flex shrink-0 items-center gap-1.5 font-mono text-xs"
                >
                  <span className="text-muted-foreground">{item.business_name}</span>
                  <span className="font-tabular text-foreground">
                    {item.score.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "font-tabular",
                      item.change > 0 ? "text-gain" : item.change < 0 ? "text-loss" : "text-muted-foreground"
                    )}
                  >
                    {item.change > 0 ? "+" : ""}
                    {item.change.toFixed(1)}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 px-4">
        {/* Theme toggle - only render after hydration */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-card-hover hover:text-foreground transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedTheme === "dark" ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        )}

        {/* User info */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-xs text-muted-foreground md:inline">
              {user.name}
            </span>
            <button
              onClick={logout}
              className="ml-1 text-xs text-muted-foreground hover:text-loss transition-colors"
              aria-label="Logout"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
