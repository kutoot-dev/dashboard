"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useApplicationList } from "@/lib/hooks";
import { useAuth } from "@/components/providers/auth-provider";
import type { ApplicationSummary } from "@/lib/types";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants/onboarding";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Under Review" },
  { value: "pending_kyc_review", label: "KYC Review" },
  { value: "pending_bank_verify", label: "Bank Verification" },
  { value: "active", label: "Active" },
  { value: "rejected", label: "Rejected" },
];

export default function HOApplicationsPage() {
  const { user } = useAuth();
  const hoId = user?.ho_id ?? "";
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useApplicationList({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(hoId ? { ho_id: hoId } : {}),
  });

  const applications = useMemo(() => {
    const list = data?.items || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  const columns = [
    {
      key: "application_id",
      header: "App ID",
      render: (v: unknown) => (
        <span className="font-mono text-xs">{String(v).slice(0, 8)}...</span>
      ),
    },
    {
      key: "shop_name",
      header: "Shop Name",
      render: (v: unknown) => (
        <span className="font-medium text-foreground">{String(v)}</span>
      ),
    },
    {
      key: "owner_name",
      header: "Owner",
    },
    {
      key: "phone_masked",
      header: "Phone",
    },
    {
      key: "sector_name",
      header: "Category",
    },
    {
      key: "city",
      header: "City",
    },
    {
      key: "state",
      header: "State",
    },
    {
      key: "commission_rate",
      header: "Comm %",
      align: "right" as const,
      render: (v: unknown) =>
        v !== null && v !== undefined ? `${v}%` : "—",
    },
    {
      key: "status",
      header: "Status",
      render: (v: unknown) => {
        const s = String(v);
        const colors = APPLICATION_STATUS_COLORS[s] || {
          bg: "bg-gray-500/10",
          text: "text-gray-400",
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors.bg} ${colors.text}`}>
            {APPLICATION_STATUS_LABELS[s] || s}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Created",
      render: (v: unknown) => {
        if (!v) return "—";
        return new Date(String(v)).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "2-digit",
        });
      },
    },
  ];

  // Aggregate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const active = applications.filter((a) => a.status === "active").length;
    const pending = applications.filter((a) => a.status.startsWith("pending")).length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    const draft = applications.filter((a) => a.status === "draft").length;

    const withRate = applications.filter((a) => a.commission_rate !== null);
    const avgCommission =
      withRate.length > 0
        ? (withRate.reduce((sum, a) => sum + (a.commission_rate ?? 0), 0) / withRate.length).toFixed(2)
        : "—";

    return { total, active, pending, rejected, draft, avgCommission };
  }, [applications]);

  // CSV Export
  const exportCSV = () => {
    if (applications.length === 0) return;
    const headers = [
      "ID",
      "Shop Name",
      "Owner",
      "Phone (masked)",
      "Category",
      "City",
      "State",
      "Commission %",
      "Status",
      "Created",
    ];
    const rows = applications.map((a) => [
      a.application_id,
      a.shop_name,
      a.owner_name,
      a.phone_masked,
      a.sector_name,
      a.city,
      a.state,
      a.commission_rate ?? "",
      APPLICATION_STATUS_LABELS[a.status] || a.status,
      a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN") : "",
    ]);

    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Linked Applications"
        subtitle="Applications linked to your head office"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total" value={String(stats.total)} loading={isLoading} />
        <StatCard label="Active" value={String(stats.active)} loading={isLoading} color="text-success" />
        <StatCard label="Pending" value={String(stats.pending)} loading={isLoading} color="text-warning" />
        <StatCard label="Rejected" value={String(stats.rejected)} loading={isLoading} color="text-error" />
        <StatCard label="Drafts" value={String(stats.draft)} loading={isLoading} color="text-muted-foreground" />
        <StatCard label="Avg Comm %" value={`${stats.avgCommission}%`} loading={isLoading} />
      </div>

      {/* Filters + Export */}
      <div className="flex items-center justify-between gap-3">
        <Select
          options={STATUS_FILTER_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="Filter by status"
        />
        <Button variant="ghost" onClick={exportCSV} disabled={applications.length === 0}>
          Export CSV
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications"
          description="No merchant applications match the selected filter."
        />
      ) : (
        <DataTable columns={columns} data={applications as unknown as Record<string, unknown>[]} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  color,
}: {
  label: string;
  value: string;
  loading: boolean;
  color?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-12 mt-1" />
      ) : (
        <p className={`text-2xl font-bold ${color || "text-foreground"}`}>
          {value}
        </p>
      )}
    </Card>
  );
}
