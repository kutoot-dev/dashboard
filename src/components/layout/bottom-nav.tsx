"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRANCH_NAV, HO_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils/cn";

function getNavForRole(role?: string) {
  if (role === "ho") return HO_NAV;
  return BRANCH_NAV;
}

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = getNavForRole(user?.role);

  if (!mounted || isLoading) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
      {/* Scrollable container — Zerodha-style horizontal scroll for many items */}
      <div className="flex overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive =
            item.href === "/ho"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-17 flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-colors",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-md transition-all",
                  isActive && "bg-accent/10"
                )}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={isActive ? 2 : 1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              {/* Label */}
              <span
                className={cn(
                  "font-mono text-[9px] font-medium tracking-wide leading-tight text-center truncate w-full",
                  isActive ? "text-accent" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="h-0.5 w-4 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
      {/* Safe area padding for iOS home indicator */}
      <div className="h-safe-bottom bg-card" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}
