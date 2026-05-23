import type { DateRange } from "@/lib/hooks/use-date-range";

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Last N days inclusive (0 = today only). */
export function lastDaysRange(days: number): DateRange {
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export const DEFAULT_FILTER_DATE_RANGE = lastDaysRange(29);
