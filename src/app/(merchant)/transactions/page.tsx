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
} from "@/lib/api/services/merchant.service";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToastStore } from "@/lib/stores/toast.store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatINR, formatINRDecimal } from "@/lib/utils/format";

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "paid", label: "Paid" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

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

export default function TransactionsPage() {
  const { user } = useAuth();
  const branchId = user?.branch_id ?? "";
  const pushToast = useToastStore((s) => s.push);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [range, setRange] = useState({ start: "", end: "" });
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<number | null>(null);

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
        acc.merchantBonus += Number(row.merchant_bonus_wallet ?? 0);
        acc.userReward += Number(row.user_reward_wallet ?? 0);
        acc.kutootCompany += Number(row.kutoot_company_wallet ?? 0);
        acc.taxable += row.taxable_amount;
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
        merchantBonus: 0,
        userReward: 0,
        kutootCompany: 0,
        taxable: 0,
        settlement: 0,
      },
    );
  }, [gstRows]);

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Filter transactions, download reports, and generate invoices." />

      <Card className="space-y-3">
        <div className="grid gap-3 md:grid-cols-4">
          <Input
            label="Search customer"
            placeholder="Name or phone"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Status</label>
            <Select
              options={STATUS_OPTIONS}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Date range</label>
            <DateRangePicker
              value={range}
              onChange={(value) => {
                setRange(value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            loading={exportTransactionsMutation.isPending}
            onClick={() => exportTransactionsMutation.mutate()}
          >
            Export Transactions CSV
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
            Download Invoices ZIP
          </Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gross bill</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.gross)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Before discounts</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Discount</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.discount)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Coupons redeemed</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">User paid</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.userPaid)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Gross - discount + fee + GST</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Merchant settlement</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.settlement)}</p>
          <p className="mt-1 text-xs text-muted-foreground">After KC and GST on KC</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Platform fee</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.platformFee)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Merchant bonus wallet source</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GST on platform fee</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.platformGst)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Tax collected by Kutoot</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">KC commission</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.commission)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Collected from merchant</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GST on KC</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.commissionGst)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Tax on commission</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Merchant bonus wallet</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.merchantBonus)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Full platform fee allocation</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">User reward wallet</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.userReward)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Configured share of KC</p>
        </Card>
        <Card>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Kutoot company wallet</p>
          <p className="mt-2 font-mono text-xl text-foreground">{formatINRDecimal(totals.kutootCompany)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Platform GST + KC GST + retained KC</p>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Transaction list ({total})</p>
          <p className="text-xs text-muted-foreground">Page {page} of {Math.max(1, pages)}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-350 text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-2 py-2">Date</th>
                <th className="px-2 py-2">Customer</th>
                <th className="px-2 py-2">Gross bill</th>
                <th className="px-2 py-2">Discount</th>
                <th className="px-2 py-2">Discounted bill</th>
                <th className="px-2 py-2">Platform fee</th>
                <th className="px-2 py-2">GST on fee</th>
                <th className="px-2 py-2">KC</th>
                <th className="px-2 py-2">GST on KC</th>
                <th className="px-2 py-2">User paid</th>
                <th className="px-2 py-2">Merchant settlement</th>
                <th className="px-2 py-2">Merchant bonus</th>
                <th className="px-2 py-2">User reward</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border/60 align-top">
                  <td className="px-2 py-3 text-xs text-muted-foreground">
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </td>
                  <td className="px-2 py-3">
                    <p className="font-medium text-foreground">{row.customer_name || "Walk-in customer"}</p>
                    <p className="text-xs text-muted-foreground">{row.customer_phone || "--"}</p>
                    <p className="text-xs text-muted-foreground">Branch: {row.merchant_branch_name || "--"}</p>
                    <p className="text-xs text-muted-foreground">Campaign: {row.campaign_reward_name || "--"}</p>
                  </td>
                  <td className="px-2 py-3 font-mono">{formatINR(row.bill_amount)}</td>
                  <td className="px-2 py-3 font-mono">{formatINR(row.discount)}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.discounted_bill_amount ?? row.bill_amount - row.discount))}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.platform_fee ?? 0))}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.platform_fee_gst_amount ?? row.gst_amount ?? 0))}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(row.commission)}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.commission_gst_amount ?? 0))}</td>
                  <td className="px-2 py-3 font-mono">{formatINR(row.total_paid)}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.merchant_settlement_wallet ?? 0))}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.merchant_bonus_wallet ?? 0))}</td>
                  <td className="px-2 py-3 font-mono">{formatINRDecimal(Number(row.user_reward_wallet ?? 0))}</td>
                  <td className="px-2 py-3">
                    <span className="rounded-full border border-border/70 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                      {row.status}
                    </span>
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
              ))}

              {!transactionsQuery.isLoading && rows.length === 0 && (
                <tr>
                  <td colSpan={16} className="px-2 py-8 text-center text-sm text-muted-foreground">
                    No transactions found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

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
