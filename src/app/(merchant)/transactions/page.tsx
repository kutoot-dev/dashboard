"use client";

import type { AxiosResponse } from "axios";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  downloadInvoicesZip,
  downloadTransactionInvoice,
  exportGstSummaryCsv,
  exportTransactionsCsv,
  getGstSummary,
  getTransactions,
  getTransactionsSummary,
  type Transaction,
} from "@/lib/api/services/merchant.service";
import { TransactionsTrendChart, type TransactionChartMetric } from "@/components/charts";
import { buildDailyTransactionSeries } from "@/lib/utils/transactions-chart";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToastStore } from "@/lib/stores/toast.store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { FilterChip } from "@/components/ui/filter-chip";
import { formatINR, formatINRDecimal } from "@/lib/utils/format";
import {
  getPaymentStatusDisplay,
  getPaymentStatusGuide,
  PAYMENT_STATUS_FILTERS,
  PAYMENT_STATUS_GUIDE,
} from "@/lib/utils/payment-status";
import { Badge } from "@/components/ui/badge";
import { StatCardsSkeleton, TableRowsSkeleton } from "@/components/ui/loading-skeletons";
import { useQuerySkeleton } from "@/lib/hooks/use-query-skeleton";
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
  const blob = response.data;
  const fileName = parseFileName(response, fallbackName);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);

  return fileName;
}

function TransactionAmounts({ row }: { row: Transaction }) {
  const discounted = Number(row.discounted_bill_amount ?? row.bill_amount - row.discount);
  const platformFee = Number(row.platform_fee ?? 0);
  const platformGst = Number(row.platform_fee_gst_amount ?? row.gst_amount ?? 0);
  const commission = Number(row.commission ?? 0);
  const commissionGst = Number(row.commission_gst_amount ?? 0);
  const settlement = Number(row.merchant_settlement_wallet ?? 0);

  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs sm:grid-cols-3">
      <div>
        <dt className="text-muted-foreground">Discounted bill</dt>
        <dd className="font-mono text-foreground">{formatINRDecimal(discounted)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Platform fee + GST</dt>
        <dd className="font-mono text-foreground">{formatINRDecimal(platformFee + platformGst)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">KC + GST</dt>
        <dd className="font-mono text-foreground">{formatINRDecimal(commission + commissionGst)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Customer paid</dt>
        <dd className="font-mono font-medium text-foreground">{formatINR(row.total_paid)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Your settlement</dt>
        <dd className="font-mono font-medium text-foreground">{formatINRDecimal(settlement)}</dd>
      </div>
    </dl>
  );
}

function TransactionRowCard({
  row,
  onDownloadInvoice,
  downloading,
}: {
  row: Transaction;
  onDownloadInvoice: (id: number) => void;
  downloading: boolean;
}) {
  const status = getPaymentStatusDisplay(row.status);

  return (
    <article className="rounded-lg border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-medium text-foreground">{row.customer_name || "Walk-in customer"}</p>
          <p className="text-xs text-muted-foreground">{row.customer_phone || "No phone"}</p>
          <p className="text-xs text-muted-foreground">
            {new Date(row.created_at).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={status.variant} title={`${status.description}. ${status.detail}`}>
            {status.label}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            loading={downloading}
            onClick={() => onDownloadInvoice(row.id)}
          >
            Invoice PDF
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-4 border-t border-border/50 pt-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Gross bill</p>
          <p className="font-mono font-medium">{formatINR(row.bill_amount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Discount</p>
          <p className="font-mono">{formatINR(row.discount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Customer paid</p>
          <p className="font-mono font-semibold text-foreground">{formatINR(row.total_paid)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Settlement</p>
          <p className="font-mono font-semibold text-foreground">
            {formatINRDecimal(Number(row.merchant_settlement_wallet ?? 0))}
          </p>
        </div>
      </div>

      <TransactionAmounts row={row} />
    </article>
  );
}

export default function TransactionsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const pushToast = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState(DEFAULT_FILTER_DATE_RANGE);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);
  const [chartMetric, setChartMetric] = useState<TransactionChartMetric>("amount");

  const filters = useMemo(() => {
    const next: {
      page: number;
      limit: number;
      search?: string;
      status?: string;
      from?: string;
      to?: string;
    } = {
      page,
      limit: 20,
    };

    if (search.trim()) next.search = search.trim();
    if (status !== "all") next.status = status;
    if (range.start) next.from = range.start;
    if (range.end) next.to = range.end;
    return next;
  }, [page, range.end, range.start, search, status]);

  const transactionsQuery = useQuery({
    queryKey: ["transactions", branchId, filters],
    queryFn: () => getTransactions(branchId, filters),
    enabled: Boolean(branchId),
    retry: false,
  });

  const summaryFilters = useMemo(
    () => ({
      from: filters.from,
      to: filters.to,
      status: filters.status,
      search: filters.search,
    }),
    [filters.from, filters.search, filters.status, filters.to],
  );

  const transactionsSummaryQuery = useQuery({
    queryKey: ["transactions-summary", branchId, summaryFilters],
    queryFn: () => getTransactionsSummary(branchId, summaryFilters),
    enabled: Boolean(branchId),
    retry: false,
  });

  const gstSummaryQuery = useQuery({
    queryKey: ["gst-summary", branchId, { ...filters, page: undefined, limit: undefined }],
    queryFn: () =>
      getGstSummary(branchId, {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        search: filters.search,
      }),
    enabled: Boolean(branchId),
    retry: false,
  });

  const exportTransactionsMutation = useMutation({
    onMutate: () => {
      pushToast({ title: "Preparing transactions CSV", description: "Your filtered export is being generated.", variant: "info" });
    },
    mutationFn: () =>
      exportTransactionsCsv(branchId, {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        search: filters.search,
      }),
    onSuccess: (response) => {
      const fileName = triggerDownload(response, `transactions-${Date.now()}.csv`);
      pushToast({ title: "Transactions CSV downloaded", description: fileName, variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "CSV export failed";
      pushToast({ title: "Export failed", description: message, variant: "error" });
    },
  });

  const exportGstMutation = useMutation({
    onMutate: () => {
      pushToast({ title: "Preparing GST summary", description: "Calculating monthly GST buckets for export.", variant: "info" });
    },
    mutationFn: () =>
      exportGstSummaryCsv(branchId, {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        search: filters.search,
      }),
    onSuccess: (response) => {
      const fileName = triggerDownload(response, `gst-summary-${Date.now()}.csv`);
      pushToast({ title: "GST summary downloaded", description: fileName, variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "GST export failed";
      pushToast({ title: "Export failed", description: message, variant: "error" });
    },
  });

  const exportZipMutation = useMutation({
    onMutate: () => {
      pushToast({ title: "Preparing invoice ZIP", description: "Generating PDF invoices and building archive.", variant: "info" });
    },
    mutationFn: () =>
      downloadInvoicesZip(branchId, {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        search: filters.search,
      }),
    onSuccess: (response) => {
      const fileName = triggerDownload(response, `invoices-${Date.now()}.zip`);
      pushToast({ title: "Invoice ZIP downloaded", description: fileName, variant: "success" });
    },
    onError: (error) => {
      const message = error instanceof ApiError ? error.message : "ZIP export failed";
      pushToast({ title: "Export failed", description: message, variant: "error" });
    },
  });

  async function handleInvoiceDownload(transactionId: number) {
    setDownloadingInvoiceId(transactionId);
    pushToast({ title: `Preparing invoice #${transactionId}`, variant: "info" });
    try {
      const response = await downloadTransactionInvoice(branchId, transactionId);
      const fileName = triggerDownload(response, `invoice-${transactionId}.pdf`);
      pushToast({ title: "Invoice downloaded", description: fileName, variant: "success" });
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Invoice download failed";
      pushToast({ title: "Download failed", description: message, variant: "error" });
    } finally {
      setDownloadingInvoiceId(null);
    }
  }

  const rows = transactionsQuery.data?.success ? transactionsQuery.data.data.rows : [];
  const total = transactionsQuery.data?.success ? transactionsQuery.data.data.total : 0;
  const pages = transactionsQuery.data?.success ? transactionsQuery.data.data.pages : 1;
  const showGstSkeleton = useQuerySkeleton(gstSummaryQuery);
  const showTransactionsSkeleton = useQuerySkeleton(transactionsQuery);
  const showChartSkeleton = useQuerySkeleton(transactionsSummaryQuery);

  const chartData = useMemo(() => {
    const summaryRows = transactionsSummaryQuery.data?.success ? transactionsSummaryQuery.data.data.rows : [];
    return buildDailyTransactionSeries(summaryRows, range.start, range.end);
  }, [range.end, range.start, transactionsSummaryQuery.data]);

  const chartTotals = useMemo(
    () =>
      chartData.reduce(
        (acc, point) => {
          acc.count += point.count;
          acc.amount += point.amount;
          return acc;
        },
        { count: 0, amount: 0 },
      ),
    [chartData],
  );
  const gstRows = useMemo(
    () => (gstSummaryQuery.data?.success ? gstSummaryQuery.data.data.rows : []),
    [gstSummaryQuery.data],
  );

  const totals = useMemo(() => {
    return gstRows.reduce(
      (acc, row) => {
        acc.gross += row.gross_bill_amount;
        acc.discount += row.discount_amount;
        acc.userPaid += Number(row.user_paid_amount ?? 0);
        acc.platformFee += Number(row.platform_fee_amount ?? 0);
        acc.platformGst += row.gst_amount;
        acc.commission += row.commission_amount;
        acc.commissionGst += Number(row.commission_gst_amount ?? 0);
        acc.settlement += Number(row.settlement_amount ?? 0);
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
      },
    );
  }, [gstRows]);

  const activeStatusGuide = useMemo(
    () => getPaymentStatusGuide(status as (typeof PAYMENT_STATUS_FILTERS)[number]["value"]),
    [status],
  );

  const summaryCards = [
    { label: "Gross bill", value: formatINRDecimal(totals.gross), hint: "Before discounts" },
    { label: "Discounts", value: formatINRDecimal(totals.discount), hint: "Coupon savings" },
    { label: "Customer paid", value: formatINRDecimal(totals.userPaid), hint: "Collected via payment gateway" },
    { label: "Your settlement", value: formatINRDecimal(totals.settlement), hint: "After KC and taxes" },
    { label: "Platform fee", value: formatINRDecimal(totals.platformFee), hint: "Kutoot service fee" },
    { label: "GST on platform fee", value: formatINRDecimal(totals.platformGst), hint: "Tax on service fee" },
    { label: "KC commission", value: formatINRDecimal(totals.commission), hint: "Kutoot Coins fee" },
    { label: "GST on KC", value: formatINRDecimal(totals.commissionGst), hint: "Tax on commission" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        subtitle="See customer payments, settlements, and download invoices for your filtered period."
      />

      <Card className="space-y-4 overflow-visible">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="min-w-0 w-full flex-1 sm:min-w-[12rem]">
            <Input
              label="Search customer"
              placeholder="Name or phone"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <DateRangePicker
            label="Date range"
            value={range}
            onChange={(value) => {
              setRange(value);
              setPage(1);
            }}
          />
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-muted-foreground">Payment status (payment gateway)</p>
            <p className="text-[11px] text-muted-foreground">
              Statuses update from the payment gateway — not entered manually
            </p>
          </div>
          <div
            className="-mx-0.5 flex gap-2 overflow-x-auto overflow-y-visible scroll-px-1 py-1.5 scrollbar-hide sm:flex-wrap sm:overflow-visible"
            role="tablist"
            aria-label="Payment status filters"
          >
            {PAYMENT_STATUS_FILTERS.map((option) => (
              <FilterChip
                key={option.value}
                label={option.label}
                selected={status === option.value}
                onSelect={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
              />
            ))}
          </div>

          <div
            className="rounded-lg border border-accent/25 bg-accent/5 px-3 py-3 sm:px-4"
            role="region"
            aria-labelledby="payment-status-guide-heading"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p id="payment-status-guide-heading" className="text-xs font-semibold text-foreground">
                  {status === "all" ? "Payment status guide" : activeStatusGuide.label}
                </p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Gateway event: {activeStatusGuide.gatewayEvent}
                </p>
              </div>
              <Badge variant={activeStatusGuide.variant}>{activeStatusGuide.label}</Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-foreground">{activeStatusGuide.summary}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{activeStatusGuide.detail}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">For your branch: </span>
              {activeStatusGuide.forMerchant}
            </p>
          </div>

          {status === "all" && (
            <details className="group rounded-lg border border-border/70 bg-muted/15">
              <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-foreground sm:px-4 [&::-webkit-details-marker]:hidden">
                Compare all statuses
                <span className="ml-1 text-muted-foreground group-open:hidden">▾</span>
                <span className="ml-1 text-muted-foreground hidden group-open:inline">▴</span>
              </summary>
              <ul className="space-y-3 border-t border-border/60 px-3 py-3 sm:px-4">
                {PAYMENT_STATUS_GUIDE.filter((entry) => entry.value !== "all").map((entry) => (
                  <li key={entry.value} className="text-xs leading-relaxed">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={entry.variant}>{entry.label}</Badge>
                      <span className="font-mono text-[10px] text-muted-foreground">{entry.gatewayEvent}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{entry.summary}</p>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
          <Button
            variant="secondary"
            loading={exportTransactionsMutation.isPending}
            onClick={() => exportTransactionsMutation.mutate()}
          >
            Export CSV
          </Button>
          <Button
            variant="secondary"
            loading={exportGstMutation.isPending}
            onClick={() => exportGstMutation.mutate()}
          >
            Export GST CSV
          </Button>
          <Button
            variant="outline"
            loading={exportZipMutation.isPending}
            onClick={() => exportZipMutation.mutate()}
          >
            Download invoices (ZIP)
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Transaction trend
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {chartTotals.count} payments · {formatINR(chartTotals.amount)} gross in selected range
            </p>
          </div>
          <div className="flex gap-2" role="tablist" aria-label="Chart metric">
            <FilterChip
              label="Gross bill"
              selected={chartMetric === "amount"}
              onSelect={() => setChartMetric("amount")}
            />
            <FilterChip
              label="Count"
              selected={chartMetric === "count"}
              onSelect={() => setChartMetric("count")}
            />
          </div>
        </div>

        {showChartSkeleton ? (
          <div className="h-60 animate-pulse rounded-lg bg-muted/30" />
        ) : (
          <TransactionsTrendChart data={chartData} metric={chartMetric} height={240} />
        )}
      </Card>

      {showGstSkeleton ? (
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

      <Card>
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Transactions {showTransactionsSkeleton ? "" : `(${total})`}
            </p>
            <p className="text-xs text-muted-foreground">
              Customer paid and settlement are the main amounts; expand details on smaller screens.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(1, pages)}</p>
        </div>

        {showTransactionsSkeleton ? (
          <TableRowsSkeleton rows={8} columns={7} minWidth="min-w-[960px]" />
        ) : rows.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No transactions match your filters. Try a wider date range or another payment status.
          </p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {rows.map((row) => (
                <TransactionRowCard
                  key={row.id}
                  row={row}
                  downloading={downloadingInvoiceId === row.id}
                  onDownloadInvoice={handleInvoiceDownload}
                />
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="px-2 py-2">Date</th>
                    <th className="px-2 py-2">Customer</th>
                    <th className="px-2 py-2">Gross</th>
                    <th className="px-2 py-2">Discount</th>
                    <th className="px-2 py-2">Customer paid</th>
                    <th className="px-2 py-2">Settlement</th>
                    <th className="px-2 py-2">Payment</th>
                    <th className="px-2 py-2">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const paymentStatus = getPaymentStatusDisplay(row.status);
                    const discounted = Number(row.discounted_bill_amount ?? row.bill_amount - row.discount);

                    return (
                      <tr key={row.id} className="border-b border-border/60 align-top hover:bg-muted/15">
                        <td className="px-2 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(row.created_at).toLocaleString("en-IN")}
                        </td>
                        <td className="px-2 py-3 min-w-[10rem]">
                          <p className="font-medium text-foreground">{row.customer_name || "Walk-in customer"}</p>
                          <p className="text-xs text-muted-foreground">{row.customer_phone || "—"}</p>
                          {(row.campaign_reward_name || row.coupon_code) && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {[row.campaign_reward_name, row.coupon_code ? `Coupon ${row.coupon_code}` : null]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                          )}
                        </td>
                        <td className="px-2 py-3 font-mono whitespace-nowrap">{formatINR(row.bill_amount)}</td>
                        <td className="px-2 py-3 font-mono whitespace-nowrap">{formatINR(row.discount)}</td>
                        <td className="px-2 py-3">
                          <p className="font-mono font-medium whitespace-nowrap">{formatINR(row.total_paid)}</p>
                          <p className="text-[11px] text-muted-foreground">Bill {formatINRDecimal(discounted)} after discount</p>
                        </td>
                        <td className="px-2 py-3 font-mono font-medium whitespace-nowrap">
                          {formatINRDecimal(Number(row.merchant_settlement_wallet ?? 0))}
                        </td>
                        <td className="px-2 py-3">
                          <Badge
                            variant={paymentStatus.variant}
                            title={`${paymentStatus.description}. ${paymentStatus.detail}`}
                          >
                            {paymentStatus.label}
                          </Badge>
                        </td>
                        <td className="px-2 py-3">
                          <Button
                            variant="outline"
                            size="sm"
                            loading={downloadingInvoiceId === row.id}
                            onClick={() => handleInvoiceDownload(row.id)}
                          >
                            PDF
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-4 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}
