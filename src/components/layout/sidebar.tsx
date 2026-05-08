"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { KutootIcon, KutootLogo } from "@/components/branding";
import { BRANCH_NAV } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { useUIStore } from "@/lib/stores/ui.store";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const navItems = BRANCH_NAV;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-cyan-500/20 bg-slate-950/70 backdrop-blur-xl transition-[width] duration-200",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-cyan-400/20",
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
                "mx-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all",
                isActive
                  ? "border border-cyan-400/35 bg-cyan-400/10 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                  : "border border-transparent text-slate-400 hover:border-fuchsia-400/25 hover:bg-fuchsia-400/10 hover:text-slate-100"
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
                <span className="text-xs tracking-wide">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="flex h-11 items-center justify-center border-t border-cyan-400/20 text-slate-500 transition-colors hover:text-slate-200"
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
