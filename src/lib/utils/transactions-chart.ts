import type { TransactionsSummaryRow } from "@/lib/api/services/merchant.service";

export interface TransactionChartPoint {
  date: string;
  time: string;
  count: number;
  amount: number;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Fill every calendar day between from/to so the chart has no gaps. */
export function buildDailyTransactionSeries(
  rows: TransactionsSummaryRow[],
  from?: string,
  to?: string,
): TransactionChartPoint[] {
  if (!from && !to && rows.length === 0) {
    return [];
  }

  const byDate = new Map(rows.map((row) => [row.date, row]));

  const start = from
    ? new Date(`${from}T00:00:00`)
    : new Date(`${rows[0]?.date ?? to}T00:00:00`);
  const end = to
    ? new Date(`${to}T00:00:00`)
    : new Date(`${rows[rows.length - 1]?.date ?? from}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return rows.map((row) => ({
      date: row.date,
      time: formatChartLabel(row.date),
      count: row.count,
      amount: row.amount,
    }));
  }

  const points: TransactionChartPoint[] = [];

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const iso = toIsoDate(cursor);
    const row = byDate.get(iso);

    points.push({
      date: iso,
      time: formatChartLabel(iso),
      count: row?.count ?? 0,
      amount: row?.amount ?? 0,
    });
  }

  return points;
}

function formatChartLabel(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
}
