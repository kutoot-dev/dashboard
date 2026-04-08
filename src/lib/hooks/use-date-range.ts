"use client";

import { useState } from "react";

export interface DateRange {
  start: string;
  end: string;
}

/** Default spans the full mock data range */
export const DEFAULT_DATE_RANGE: DateRange = {
  start: "2026-03-08",
  end: "2026-04-08",
};

export function useDateRange(initial?: DateRange) {
  const [dateRange, setDateRange] = useState<DateRange>(
    initial ?? DEFAULT_DATE_RANGE,
  );
  return { dateRange, setDateRange };
}
