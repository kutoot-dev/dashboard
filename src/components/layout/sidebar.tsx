"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KutootIcon, KutootLogo } from "@/components/branding";
import { Icon } from "@/components/ui/icon";
import { getMerchantNav } from "@/lib/constants/navigation";
import { faChevronLeft } from "@/lib/icons";
import { useAuth } from "@/components/providers/auth-provider";
import { canAccessScoringEngine } from "@/lib/utils/scoring-engine-access";
import { useUIStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navItems = getMerchantNav(canAccessScoringEngine(user), user?.role ?? "merchant");

  return (
    <aside
      className={cn(
        "glass-sidebar flex h-full flex-col transition-[width] duration-300",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border/70",
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
      <nav className="flex-1 overflow-y-auto py-3">
        {!isLoading && navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "border border-accent/35 bg-linear-to-r from-primary/22 via-secondary/18 to-accent/22 text-foreground shadow-[0_14px_26px_rgba(9,13,38,0.32)]"
                  : "border border-transparent text-muted-foreground hover:border-accent/35 hover:bg-card-hover/70 hover:text-foreground"
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon
                icon={item.icon}
                className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}
              />
              {!sidebarCollapsed && (
                <span className="text-xs tracking-[0.08em]">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-11 items-center justify-center border-t border-border/70 text-muted-foreground transition-colors hover:bg-card-hover/70 hover:text-foreground"
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Icon
          icon={faChevronLeft}
          className={cn("h-4 w-4 transition-transform", sidebarCollapsed && "rotate-180")}
        />
      </button>
    </aside>
  );
}
