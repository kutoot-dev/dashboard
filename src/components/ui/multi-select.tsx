"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({ options, value, onChange, placeholder = "Select...", className }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (val: string) => {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    );
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex min-h-[36px] w-full items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-left text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          open && "ring-2 ring-accent/50"
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="text-muted-foreground">{placeholder}</span>
        ) : (
          <span className="flex flex-wrap gap-1">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded bg-accent/10 px-1.5 py-0.5 text-xs text-accent"
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const opt = options.find((o) => o.label === label);
                    if (opt) toggle(opt.value);
                  }}
                  className="text-accent/60 hover:text-accent"
                >
                  ×
                </button>
              </span>
            ))}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-card shadow-lg">
          <div className="sticky top-0 border-b border-border bg-card p-1.5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
              autoFocus
            />
          </div>
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No results</p>
          ) : (
            filtered.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggle(opt.value)}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted/50",
                  value.includes(opt.value) && "bg-accent/5 text-accent"
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border border-border text-[10px]",
                    value.includes(opt.value) && "border-accent bg-accent text-white"
                  )}
                >
                  {value.includes(opt.value) && "✓"}
                </span>
                {opt.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
