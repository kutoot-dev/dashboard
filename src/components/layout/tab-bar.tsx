"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { getMerchantNav } from "@/lib/constants/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils/cn";

export function TabBar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = getMerchantNav(user?.role ?? "merchant", user?.store_role);

  if (!mounted || isLoading) return null;

  return (
    <nav className="glass-tab-bar hidden md:block">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide px-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon icon={item.icon} className="h-4 w-4" />
              <span className="font-mono text-xs tracking-wide">{item.label}</span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-accent animate-tab-indicator" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
