"use client";

import { useState } from "react";
import type { AxiosResponse } from "axios";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  downloadPayoutInvoice,
  type BranchPayoutHistoryItem,
} from "@/lib/api/services/branches.service";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { useToastStore } from "@/lib/stores/toast.store";
import { formatINRDecimal } from "@/lib/utils/format";
import { PAYOUTS } from "@/lib/constants/strings";
import { cn } from "@/lib/utils/cn";
import { faTrophy } from "@/lib/icons";
import { ApiError } from "@/lib/api/client";

function statusBadgeVariant(status: string) {
  const normalized = status.toLowerCase();
  if (normalized.includes("paid")) return "gain" as const;
  if (normalized.includes("pending")) return "warning" as const;
  if (normalized.includes("failed")) return "loss" as const;
  return "neutral" as const;
}

function formatRank(rank: number | null | undefined) {
  return typeof rank === "number" ? `#${rank}` : "—";
}

function rankTone(rank: number | null | undefined) {
  if (typeof rank !== "number") return "text-muted-foreground";
  if (rank <= 3) return "text-gold font-semibold";
  if (rank <= 10) return "text-accent font-medium";
  return "text-foreground";
}

function parseFileName(response: AxiosResponse<Blob>, fallback: string): string {
  const disposition = response.headers?.["content-disposition"] as string | undefined;
  if (!disposition) return fallback;

  const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1]);

  const plainMatch = disposition.match(/filename="?([^\";]+)"?/i);
  if (plainMatch?.[1]) return plainMatch[1];

  return fallback;
}

function triggerDownload(response: AxiosResponse<Blob>, fallbackName: string): string {
  const fileName = parseFileName(response, fallbackName);
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return fileName;
}

function InvoiceCell({
  row,
  downloading,
  onDownload,
}: {
  row: BranchPayoutHistoryItem;
  downloading: boolean;
  onDownload: () => void;
}) {
  const invoice = row.invoice;

  if (!invoice) {
    return (
      <Badge variant="neutral" title={PAYOUTS.INVOICE_PENDING}>
        {PAYOUTS.INVOICE_PENDING}
      </Badge>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div>
        <p className="font-mono text-xs text-foreground">{invoice.invoice_number}</p>
        {invoice.invoice_date ? (
          <p className="text-[11px] text-muted-foreground">{invoice.invoice_date}</p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          {formatINRDecimal(invoice.total_amount)} · {PAYOUTS.INVOICE_RAISED}
        </p>
      </div>
      <Button variant="outline" size="sm" loading={downloading} onClick={onDownload}>
        {PAYOUTS.DOWNLOAD_INVOICE}
      </Button>
    </div>
  );
}

interface BonusPayoutHistoryProps {
  rows: BranchPayoutHistoryItem[];
}

export function BonusPayoutHistory({ rows }: BonusPayoutHistoryProps) {
  const branchId = useEffectiveBranchId();
  const pushToast = useToastStore((s) => s.push);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (row: BranchPayoutHistoryItem) => {
    if (!branchId) return;

    setDownloadingId(row.payout_id);
    try {
      const response = await downloadPayoutInvoice(branchId, row.payout_id);
      const fileName = triggerDownload(response, `payout-invoice-${row.payout_id}.pdf`);
      pushToast({
        title: "Payout invoice downloaded",
        description: fileName,
        variant: "success",
      });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not download invoice.";
      pushToast({ title: "Download failed", description: message, variant: "error" });
    } finally {
      setDownloadingId(null);
    }
  };

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/70 py-14 text-center text-sm text-muted-foreground">
        <Icon icon={faTrophy} className="h-8 w-8 text-gold/50" aria-hidden />
        <p>{PAYOUTS.EMPTY}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <article
            key={row.payout_id}
            className="rounded-xl border border-border/70 bg-background/30 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">{row.date || row.period_id}</p>
                <p className={cn("mt-0.5 font-mono text-xs", rankTone(row.rank))}>
                  {PAYOUTS.COL_RANK} {formatRank(row.rank)}
                </p>
              </div>
              <Badge variant={statusBadgeVariant(row.status || "")}>
                {(row.status || "unknown").toUpperCase()}
              </Badge>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="text-muted-foreground">{PAYOUTS.COL_DAILY_POOL}</dt>
                <dd className="mt-0.5 font-mono text-foreground">{formatINRDecimal(row.daily_pool)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{PAYOUTS.COL_YOUR_SHARE}</dt>
                <dd className="mt-0.5 font-mono text-lg font-semibold text-gold">{formatINRDecimal(row.your_share)}</dd>
              </div>
            </dl>
            <div className="mt-3 border-t border-border/50 pt-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {PAYOUTS.COL_INVOICE}
              </p>
              <div className="mt-2">
                <InvoiceCell
                  row={row}
                  downloading={downloadingId === row.payout_id}
                  onDownload={() => void handleDownload(row)}
                />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border/80 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_DATE}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_RANK}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_DAILY_POOL}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_YOUR_SHARE}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_STATUS}</th>
              <th className="px-3 py-2.5 font-medium">{PAYOUTS.COL_INVOICE}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.payout_id}
                className={cn(
                  "border-b border-border/40 transition-colors hover:bg-gold/5",
                  index % 2 === 0 ? "bg-transparent" : "bg-muted/15",
                )}
              >
                <td className="px-3 py-3.5 font-medium text-foreground">{row.date || row.period_id}</td>
                <td className={cn("px-3 py-3.5 font-mono", rankTone(row.rank))}>{formatRank(row.rank)}</td>
                <td className="px-3 py-3.5 font-mono text-foreground">{formatINRDecimal(row.daily_pool)}</td>
                <td className="px-3 py-3.5 font-mono text-base font-semibold text-gold">
                  {formatINRDecimal(row.your_share)}
                </td>
                <td className="px-3 py-3.5">
                  <Badge variant={statusBadgeVariant(row.status || "")}>
                    {(row.status || "unknown").toUpperCase()}
                  </Badge>
                </td>
                <td className="px-3 py-3.5">
                  <InvoiceCell
                    row={row}
                    downloading={downloadingId === row.payout_id}
                    onDownload={() => void handleDownload(row)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
