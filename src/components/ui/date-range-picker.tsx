"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { DayPicker, type DateRange as DayPickerRange } from "react-day-picker";
import { cn } from "@/lib/utils/cn";
import type { DateRange } from "@/lib/hooks/use-date-range";
import "react-day-picker/style.css";

export type { DateRange };

export type DateRangePickerMode = "range" | "single";

interface DatePreset {
  label: string;
  /** Days before the anchor end date (0 = anchor day). */
  days: number;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  mode?: DateRangePickerMode;
  label?: string;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
  /** Extra preset chips (e.g. Today / Yesterday on leaderboard). */
  presets?: DatePreset[];
}

function parseLocalDate(value: string): Date | undefined {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toPickerRange(value: DateRange, mode: DateRangePickerMode): DayPickerRange | Date | undefined {
  const from = parseLocalDate(value.start);
  const to = parseLocalDate(value.end);
  if (mode === "single") {
    return from ?? to;
  }
  if (!from && !to) return undefined;
  return { from, to };
}

function fromPickerRange(
  selection: DayPickerRange | Date | undefined,
  mode: DateRangePickerMode,
): DateRange {
  if (mode === "single") {
    const day = selection instanceof Date ? selection : undefined;
    const iso = day ? toLocalDateString(day) : "";
    return { start: iso, end: iso };
  }
  const range = selection as DayPickerRange | undefined;
  return {
    start: range?.from ? toLocalDateString(range.from) : "",
    end: range?.to ? toLocalDateString(range.to) : "",
  };
}

function formatDateForDisplay(date: string) {
  if (!date) return "";
  const d = parseLocalDate(date);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

const RANGE_PRESETS: DatePreset[] = [
  { label: "Last 7 days", days: 6 },
  { label: "Last 30 days", days: 29 },
  { label: "Last 90 days", days: 89 },
];

const VIEWPORT_MARGIN = 12;
const POPOVER_GAP = 6;

export function DateRangePicker({
  value,
  onChange,
  mode = "range",
  label,
  placeholder,
  className,
  min,
  max,
  presets,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState<DayPickerRange | Date | undefined>(() =>
    toPickerRange(value, mode),
  );
  const [monthCount, setMonthCount] = useState(2);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const minDate = useMemo(() => parseLocalDate(min ?? ""), [min]);
  const maxDate = useMemo(() => parseLocalDate(max ?? ""), [max]);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const presetOptions = presets ?? (mode === "range" ? RANGE_PRESETS : []);
  const resolvedPlaceholder =
    placeholder ?? (mode === "single" ? "Select date..." : "Select date range...");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const sync = () => setMonthCount(mq.matches || mode === "single" ? 1 : 2);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [mode]);

  useEffect(() => {
    if (open) {
      setDraft(toPickerRange(value, mode));
    }
  }, [open, value, mode]);

  const updatePopoverPosition = useCallback((months = monthCount) => {
    const trigger = triggerRef.current;
    const popover = popoverRef.current;
    if (!trigger || !popover) return;

    const anchor = trigger.getBoundingClientRect();
    const panel = popover.getBoundingClientRect();
    const panelWidth = panel.width || (months >= 2 ? 560 : 280);
    const panelHeight = panel.height || 380;
    const maxPopoverWidth = Math.min(
      window.innerWidth - VIEWPORT_MARGIN * 2,
      months >= 2 ? 580 : 300,
    );

    let left = anchor.left;
    if (left + panelWidth > window.innerWidth - VIEWPORT_MARGIN) {
      left = anchor.right - panelWidth;
    }
    left = Math.max(
      VIEWPORT_MARGIN,
      Math.min(left, window.innerWidth - panelWidth - VIEWPORT_MARGIN),
    );

    const spaceBelow = window.innerHeight - anchor.bottom - VIEWPORT_MARGIN;
    const spaceAbove = anchor.top - VIEWPORT_MARGIN;
    const openBelow =
      spaceBelow >= panelHeight + POPOVER_GAP || spaceBelow >= spaceAbove;

    let top = openBelow
      ? anchor.bottom + POPOVER_GAP
      : anchor.top - panelHeight - POPOVER_GAP;

    const maxTop = window.innerHeight - panelHeight - VIEWPORT_MARGIN;
    top = Math.max(VIEWPORT_MARGIN, Math.min(top, maxTop));

    setPopoverStyle({
      position: "fixed",
      top: Math.round(top),
      left: Math.round(left),
      maxWidth: maxPopoverWidth,
      zIndex: 9999,
    });
  }, [monthCount]);

  useLayoutEffect(() => {
    if (!open) return;
    updatePopoverPosition();
    const raf = requestAnimationFrame(updatePopoverPosition);
    return () => cancelAnimationFrame(raf);
  }, [open, updatePopoverPosition, monthCount, draft, mode]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    function handleReposition() {
      updatePopoverPosition();
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePopoverPosition]);

  const hasValue =
    mode === "single"
      ? Boolean(value.start)
      : Boolean(value.start && value.end);

  const displayText = useMemo(() => {
    if (!hasValue) return resolvedPlaceholder;
    if (mode === "single") {
      return formatDateForDisplay(value.start);
    }
    return `${formatDateForDisplay(value.start)} – ${formatDateForDisplay(value.end)}`;
  }, [hasValue, mode, resolvedPlaceholder, value.end, value.start]);

  const draftComplete =
    mode === "single"
      ? draft instanceof Date || (draft as DayPickerRange | undefined)?.from !== undefined
      : Boolean(
          (draft as DayPickerRange | undefined)?.from &&
            (draft as DayPickerRange | undefined)?.to,
        );

  function applyDraft() {
    onChange(fromPickerRange(draft, mode));
    setOpen(false);
  }

  function handleRangeSelect(range?: DayPickerRange) {
    setDraft(range);
    if (range?.from && range?.to) {
      onChange(fromPickerRange(range, "range"));
    }
  }

  function handleSingleSelect(day?: Date) {
    setDraft(day);
    if (day) {
      onChange(fromPickerRange(day, "single"));
      setOpen(false);
    }
  }

  function anchorEndDate() {
    return maxDate && maxDate < today ? maxDate : today;
  }

  function applyPreset(days: number) {
    const end = anchorEndDate();
    const start = subtractDays(end, days);
    if (mode === "single") {
      const range = fromPickerRange(start, "single");
      setDraft(start);
      onChange(range);
      setOpen(false);
      return;
    }
    const range = { from: start, to: end };
    setDraft(range);
    onChange(fromPickerRange(range, "range"));
    setOpen(false);
  }

  function clearRange() {
    setDraft(undefined);
    onChange({ start: "", end: "" });
    setOpen(false);
  }

  const disabledMatchers = [
    ...(minDate ? [{ before: minDate }] : []),
    ...(maxDate ? [{ after: maxDate }] : []),
  ];

  const defaultMonth =
    mode === "single"
      ? draft instanceof Date
        ? draft
        : parseLocalDate(value.start) ?? today
      : (draft as DayPickerRange | undefined)?.from ??
        (draft as DayPickerRange | undefined)?.to ??
        today;

  const draftSummary = useMemo(() => {
    if (mode === "single") {
      const day =
        draft instanceof Date
          ? draft
          : (draft as DayPickerRange | undefined)?.from;
      return day ? formatDateForDisplay(toLocalDateString(day)) : "No date selected";
    }
    const range = draft as DayPickerRange | undefined;
    if (!range?.from) return "No range selected";
    if (!range.to) {
      return `${formatDateForDisplay(toLocalDateString(range.from))} – …`;
    }
    return `${formatDateForDisplay(toLocalDateString(range.from))} – ${formatDateForDisplay(toLocalDateString(range.to))}`;
  }, [draft, mode]);

  const popover = open ? (
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={mode === "single" ? "Choose date" : "Choose date range"}
      style={popoverStyle}
      className="date-range-picker-popover w-max max-w-[calc(100vw-1.5rem)] max-h-[min(85vh,calc(100dvh-1.5rem))] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card-solid p-3 shadow-2xl ring-1 ring-border/60"
    >
      {(presetOptions.length > 0 || mode === "range") && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {presetOptions.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.days)}
              className="rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:border-accent/45 hover:bg-accent/12"
            >
              {preset.label}
            </button>
          ))}
          {mode === "range" && (
            <button
              type="button"
              onClick={clearRange}
              className="rounded-full border border-border bg-muted/30 px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-border hover:bg-muted/60 hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      )}

      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {mode === "single"
          ? "Tap a date to apply"
          : "Select start and end dates"}
      </p>

      {mode === "single" ? (
        <DayPicker
          mode="single"
          selected={draft instanceof Date ? draft : parseLocalDate(value.start)}
          onSelect={handleSingleSelect}
          numberOfMonths={1}
          defaultMonth={defaultMonth}
          disabled={disabledMatchers}
          showOutsideDays
          className="date-range-picker-calendar"
        />
      ) : (
        <DayPicker
          mode="range"
          selected={draft as DayPickerRange | undefined}
          onSelect={handleRangeSelect}
          numberOfMonths={monthCount}
          defaultMonth={defaultMonth}
          disabled={disabledMatchers}
          showOutsideDays
          className="date-range-picker-calendar"
        />
      )}

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">{draftSummary}</p>
        <div className="flex shrink-0 justify-end gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          {mode === "range" && (
            <button
              type="button"
              onClick={applyDraft}
              disabled={!draftComplete}
              className="rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-accent-foreground shadow-sm transition-colors hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Apply
            </button>
          )}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div className={cn("relative inline-flex w-fit max-w-full flex-col", className)}>
      {label ? (
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
          {label}
        </label>
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "flex h-9 w-[min(20rem,calc(100vw-2rem))] min-w-[11.5rem] items-center justify-between gap-2 rounded-md border border-border bg-card px-3 text-sm transition-colors",
          "hover:border-accent/35 hover:bg-card-hover",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
          open && "border-accent/45 ring-2 ring-accent/35",
        )}
      >
        <span className={cn("truncate", hasValue ? "text-foreground" : "text-muted-foreground")}>
          {displayText}
        </span>
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {mounted && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
