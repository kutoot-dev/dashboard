"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRANCH_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = BRANCH_NAV;

  if (!mounted || isLoading) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[#1f2a44] bg-[#0a1224] shadow-[0_-10px_30px_rgba(0,0,0,0.45)]">
      <div className="mx-auto max-w-screen-sm px-1">
        {/* Scrollable container — app-like horizontal nav for many items */}
        <div className="flex overflow-x-auto scrollbar-hide">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-18 flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5 transition-colors",
                isActive
                  ? "text-[#ffd85a]"
                  : "text-slate-400"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-[#1a2a4a] shadow-[0_0_0_1px_rgba(255,216,90,0.25)]" : "bg-transparent"
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
                  "font-mono text-[10px] font-medium tracking-wide leading-tight text-center truncate w-full",
                  isActive ? "text-[#ffd85a]" : "text-slate-400"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="h-0.5 w-5 rounded-full bg-[#ffd85a]" />
              )}
            </Link>
          );
        })}
        </div>
      </div>
      {/* Safe area padding for iOS home indicator */}
      <div className="h-safe-bottom" style={{ paddingBottom: "env(safe-area-inset-bottom)" }} />
    </nav>
  );
}
