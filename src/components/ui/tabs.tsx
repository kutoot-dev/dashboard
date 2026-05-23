import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  /** Accessible name for the tab list (e.g. "Dashboard sections"). */
  ariaLabel?: string;
}

export function Tabs({ tabs, activeTab, onChange, className, ariaLabel }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex gap-0.5 overflow-x-auto rounded-t-xl border-b border-border/80 bg-card/55 px-1 pt-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative shrink-0 rounded-t-lg px-3 py-2 text-sm font-semibold transition-all sm:px-4",
            activeTab === tab.id
              ? "bg-card text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full gradient-brand" />
          )}
        </button>
      ))}
    </div>
  );
}
