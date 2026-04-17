"use client";

import { TabBar } from "./tab-bar";
import { Topbar } from "./topbar";
import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* Topbar — ticker + KBI + actions */}
      <Topbar />
      {/* Tab bar — desktop horizontal tabs (hidden on mobile) */}
      <TabBar />
      {/* Main content area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
