"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useTheme } from "@/components/providers/theme-provider";
import { QuickActions } from "@/components/ui/quick-actions";

export function Topbar() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [now, setNow] = useState(new Date());
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const liveDate = now.toLocaleDateString("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="glass-topbar flex h-16 items-center justify-between border-b border-border/80 px-4 md:px-6">
      <div className="min-w-0">
        <QuickActions compact className="flex" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-xl border border-accent/35 bg-linear-to-r from-primary/24 via-secondary/20 to-accent/24 px-3 py-2 text-xs font-semibold text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
        >
          {mounted ? (resolvedTheme === "dark" ? "Light Mode" : "Dark Mode") : "Theme"}
        </button>
        <div className="hidden rounded-xl border border-border/80 bg-card/70 px-3 py-2 text-right shadow-[0_10px_24px_rgba(8,13,34,0.22)] md:block">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Live Stamp</p>
          <p className="font-tabular text-xs text-foreground">
            {liveDate}
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card/75 px-2 py-1.5 shadow-[0_10px_24px_rgba(8,13,34,0.22)]">
            <div className="gradient-brand flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-accent-foreground">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-xs text-foreground md:inline">{user.name}</span>
            <button
              onClick={logout}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-loss/20 hover:text-loss"
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
