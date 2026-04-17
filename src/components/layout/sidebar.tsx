"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { KutootIcon, KutootLogo } from "@/components/branding";
import { BRANCH_NAV, HO_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useUIStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils/cn";

function getNavForRole(role?: string) {
  if (role === "ho") return HO_NAV;
  return BRANCH_NAV;
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = getNavForRole(user?.role);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-card transition-[width] duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-12 items-center border-b border-border",
          sidebarCollapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {sidebarCollapsed ? (
          <KutootIcon size="md" />
        ) : (
          <KutootLogo size="sm" className="max-w-35" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {mounted && !isLoading && navItems.map((item) => {
          const isActive =
            item.href === "/ho"
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-accent/10 text-accent border-r-2 border-accent"
                  : "text-muted-foreground hover:bg-card-hover hover:text-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {!sidebarCollapsed && (
                <span className="font-mono text-xs tracking-wide">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-10 items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <svg
          className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
