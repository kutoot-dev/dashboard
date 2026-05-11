import { cn } from "@/lib/utils/cn";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onChange }: TabsProps) {
  return (
    <div className="flex rounded-t-xl border-b border-border/80 bg-card/55 px-1 pt-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "relative rounded-t-lg px-4 py-2 text-sm font-semibold transition-all",
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
