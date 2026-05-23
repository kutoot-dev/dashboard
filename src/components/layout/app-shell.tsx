"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";
import { AchievementWatcher } from "@/components/ui/achievement-watcher";
import { Toaster } from "@/components/ui/toaster";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="gradient-brand-soft absolute inset-0 opacity-70" />
      </div>

      <div className="relative z-10 hidden lg:block">
        <Sidebar />
      </div>
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:p-6 md:pb-6">
          {children}
        </main>
      </div>
      {/* Mobile bottom nav */}
      <BottomNav />
      <AchievementWatcher />
      <Toaster />
    </div>
  );
}
