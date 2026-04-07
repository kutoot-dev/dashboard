"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range...",
  className,
  min,
  max,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
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

  const formatDateForDisplay = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasValue = value.start && value.end;
  const displayText = hasValue
    ? `${formatDateForDisplay(value.start)} – ${formatDateForDisplay(value.end)}`
    : placeholder;

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-sm transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-accent/50",
          open && "ring-2 ring-accent/50"
        )}
      >
        <span className={hasValue ? "text-foreground" : "text-muted-foreground"}>
          {displayText}
        </span>
        <svg
          className={cn(
            "h-4 w-4 shrink-0 transition-transform text-muted-foreground",
            open && "rotate-180"
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-card shadow-lg p-4 space-y-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Start Date
            </label>
            <input
              type="date"
              value={value.start}
              onChange={(e) => onChange({ ...value, start: e.target.value })}
              min={min}
              max={value.end || max}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              End Date
            </label>
            <input
              type="date"
              value={value.end}
              onChange={(e) => onChange({ ...value, end: e.target.value })}
              min={value.start || min}
              max={max}
              className="w-full rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent/50"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded bg-accent/10 px-2 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
