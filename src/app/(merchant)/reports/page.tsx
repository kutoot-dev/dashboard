"use client";

import type { AxiosResponse } from "axios";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  exportGstSummaryCsv,
  getGstSummary,
  type GstSummaryRow,
} from "@/lib/api/services/merchant.service";
import { ApiError } from "@/lib/api/client";
import { useEffectiveBranchId } from "@/lib/hooks/use-effective-branch-id";
import { useToastStore } from "@/lib/stores/toast.store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { StatCardsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
import { formatINRDecimal } from "@/lib/utils/format";
import { DEFAULT_FILTER_DATE_RANGE } from "@/lib/utils/date-range";

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

function summarizeGstRows(rows: GstSummaryRow[]) {
  return rows.reduce(
    (acc, row) => {
      acc.gross += row.gross_bill_amount;
      acc.discount += row.discount_amount;
      acc.userPaid += Number(row.user_paid_amount ?? 0);
      acc.platformFee += Number(row.platform_fee_amount ?? 0);
      acc.platformGst += row.gst_amount;
      acc.commission += row.commission_amount;
      acc.commissionGst += Number(row.commission_gst_amount ?? 0);
      acc.settlement += Number(row.settlement_amount ?? 0);
      acc.count += row.transaction_count;
      return acc;
    },
    {
      gross: 0,
      discount: 0,
      userPaid: 0,
      platformFee: 0,
      platformGst: 0,
      commission: 0,
      commissionGst: 0,
      settlement: 0,
      count: 0,
    },
  );
}

export default function ReportsPage() {
  const branchId = useEffectiveBranchId();
  const pushToast = useToastStore((s) => s.push);
  const [range, setRange] = useState(DEFAULT_FILTER_DATE_RANGE);

  const filters = useMemo(
    () => ({
      from: range.start,
      to: range.end,
    }),
    [range.end, range.start],
  );

  const gstSummaryQuery = useQuery({
    queryKey: ["gst-summary-reports", branchId, filters],
    queryFn: () => getGstSummary(branchId, filters),
    enabled: Boolean(branchId),
    retry: false,
  });

  const exportGstMutation = useMutation({
    onMutate: () => {
      pushToast({
        title: "Preparing GST summary",
        description: "Calculating monthly GST buckets for export.",
        variant: "info",
      });
    },
    mutationFn: () => exportGstSummaryCsv(branchId, filters),
    onSuccess: (response) => {
      const fileName = triggerDownload(response, `gst-summary-${Date.now()}.csv`);
      pushToast({ title: "GST summary downloaded", description: fileName, variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "GST export failed";
      pushToast({ title: "Export failed", description: message, variant: "error" });
    },
  });

  const showSkeleton = useQuerySkeleton(gstSummaryQuery);
  const gstRows = gstSummaryQuery.data?.success ? gstSummaryQuery.data.data.rows : [];
  const totals = useMemo(() => summarizeGstRows(gstRows), [gstRows]);

  const summaryCards = [
    { label: "Transactions", value: String(totals.count), hint: "In selected period" },
    { label: "Gross bill", value: formatINRDecimal(totals.gross), hint: "Before discounts" },
    { label: "Customer paid", value: formatINRDecimal(totals.userPaid), hint: "Collected via gateway" },
    { label: "Your settlement", value: formatINRDecimal(totals.settlement), hint: "After KC and taxes" },
    { label: "Platform fee", value: formatINRDecimal(totals.platformFee), hint: "Kutoot service fee" },
    { label: "GST on platform fee", value: formatINRDecimal(totals.platformGst), hint: "Tax on service fee" },
    { label: "KC commission", value: formatINRDecimal(totals.commission), hint: "Kutoot Coins fee" },
    { label: "GST on KC", value: formatINRDecimal(totals.commissionGst), hint: "Tax on commission" },
  ];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Reports"
        subtitle="GST and settlement summary for your branch. Export monthly buckets for accounting."
      />

      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <DateRangePicker
            label="Report period"
            value={range}
            onChange={setRange}
          />
          <Button
            variant="secondary"
            loading={exportGstMutation.isPending}
            onClick={() => exportGstMutation.mutate()}
          >
            Export GST CSV
          </Button>
        </div>
      </Card>

      {showSkeleton ? (
        <StatCardsSkeleton count={8} className="md:grid-cols-2 xl:grid-cols-4" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Card key={card.label}>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</p>
              <p className="mt-2 font-mono text-xl text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-5 sm:p-6">
        <div className="mb-4">
          <p className="font-display text-lg font-semibold text-foreground">Monthly GST breakdown</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bucketed by calendar month for the selected date range.
          </p>
        </div>

        {showSkeleton ? (
          <div className="h-40 animate-pulse rounded-xl bg-muted/30" />
        ) : gstRows.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No report data for this period. Try a wider date range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-2 py-2">Month</th>
                  <th className="px-2 py-2">Txns</th>
                  <th className="px-2 py-2">Gross</th>
                  <th className="px-2 py-2">GST (platform)</th>
                  <th className="px-2 py-2">KC</th>
                  <th className="px-2 py-2">GST (KC)</th>
                  <th className="px-2 py-2">Settlement</th>
                </tr>
              </thead>
              <tbody>
                {gstRows.map((row) => (
                  <tr key={row.month} className="border-b border-border/60 hover:bg-muted/15">
                    <td className="px-2 py-3 font-medium">{row.month}</td>
                    <td className="px-2 py-3 font-mono">{row.transaction_count}</td>
                    <td className="px-2 py-3 font-mono">{formatINRDecimal(row.gross_bill_amount)}</td>
                    <td className="px-2 py-3 font-mono">{formatINRDecimal(row.gst_amount)}</td>
                    <td className="px-2 py-3 font-mono">{formatINRDecimal(row.commission_amount)}</td>
                    <td className="px-2 py-3 font-mono">{formatINRDecimal(row.commission_gst_amount ?? 0)}</td>
                    <td className="px-2 py-3 font-mono font-medium">{formatINRDecimal(row.settlement_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
