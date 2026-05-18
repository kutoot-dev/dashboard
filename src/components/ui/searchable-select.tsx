"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface SearchableSelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  noResultsText?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className,
  noResultsText = "No results",
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(
    () =>
      options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
          }
        }}
        disabled={disabled}
        className={cn(
          "h-10 w-full rounded-xl border border-border/80 bg-card/75 px-3 text-left text-sm text-foreground shadow-[0_8px_20px_rgba(8,13,34,0.14)] transition-all",
          "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/45",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-2 ring-accent/50 border-accent/45",
        )}
      >
        {selectedOption?.label || placeholder}
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="border-b border-border p-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              autoFocus
            />
          </div>

          <div className="max-h-48 overflow-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">{noResultsText}</p>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50",
                    option.value === value && "bg-accent/5 text-accent",
                  )}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
