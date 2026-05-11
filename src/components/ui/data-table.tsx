"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface Column<T> {
  key: string;
  header: string;
  render?: (value: unknown, row: T) => ReactNode;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
}

type SortDir = "asc" | "desc";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null || bVal == null) return 0;
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const alignClass = (align?: string) =>
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";

  return (
    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/70 shadow-[0_12px_28px_rgba(8,13,34,0.18)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/70 bg-muted/55">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "cursor-pointer select-none px-3 py-2 font-mono text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground",
                  alignClass(col.align)
                )}
                onClick={() => handleSort(col.key)}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {sortKey === col.key && (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
                      {sortDir === "asc" ? (
                        <path d="M6 2l4 5H2z" />
                      ) : (
                        <path d="M6 10L2 5h8z" />
                      )}
                    </svg>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={i}
              className={cn(
                "border-b border-border/65 transition-colors",
                i % 2 === 1 && "bg-muted/18",
                onRowClick && "cursor-pointer hover:bg-card-hover/85"
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-2 font-tabular",
                    alignClass(col.align),
                    typeof row[col.key] === "number" && "font-mono"
                  )}
                >
                  {col.render ? col.render(row[col.key], row) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
