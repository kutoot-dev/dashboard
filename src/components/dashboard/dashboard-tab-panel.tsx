"use client";

import type { ReactNode } from "react";
import { Tabs } from "@/components/ui/tabs";
import {
  DASHBOARD_SECTION_IDS,
  DASHBOARD_TAB_LABELS,
  type DashboardSectionId,
} from "@/lib/hooks/use-dashboard-layout";
import { cn } from "@/lib/utils/cn";

interface DashboardTabPanelProps {
  activeTab: DashboardSectionId;
  onTabChange: (id: DashboardSectionId) => void;
  children: ReactNode;
  className?: string;
}

export function DashboardTabPanel({
  activeTab,
  onTabChange,
  children,
  className,
}: DashboardTabPanelProps) {
  const tabs = DASHBOARD_SECTION_IDS.map((id) => ({
    id,
    label: DASHBOARD_TAB_LABELS[id],
  }));

  return (
    <section className={cn("overflow-hidden rounded-xl border border-border/80 bg-card/40", className)}>
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => onTabChange(id as DashboardSectionId)}
        ariaLabel="Dashboard sections"
      />
      <div role="tabpanel" className="p-4 sm:p-5">
        {children}
      </div>
    </section>
  );
}
