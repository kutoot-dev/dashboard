"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { getMerchantNav } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const navItems = getMerchantNav(user?.role ?? "merchant", user?.store_role);

  if (!mounted || isLoading) return null;

  return (
    <nav className="glass-bottom-nav fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 md:hidden">
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
                "flex min-w-18 flex-1 flex-col items-center justify-center gap-1 px-2 py-2.5 transition-all",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                  isActive ? "bg-linear-to-r from-primary/20 via-secondary/20 to-accent/20 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]" : "bg-transparent"
                )}
              >
                <Icon icon={item.icon} className="h-5 w-5" />
              </div>
              {/* Label */}
              <span
                className={cn(
                  "font-mono text-[10px] font-medium tracking-wide leading-tight text-center truncate w-full",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
              {/* Active indicator dot */}
              {isActive && (
                <span className="h-0.5 w-5 rounded-full gradient-brand" />
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
