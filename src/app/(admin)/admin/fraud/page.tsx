"use client";

import { useState } from "react";
import { useFraudFlags, useUpdateFraudFlag } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { FraudFlag, Severity, InvestigationStatus } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";

type Row = Record<string, unknown>;

const STATUS_TABS = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "under_review", label: "Investigating" },
  { id: "resolved_genuine", label: "Resolved" },
  { id: "resolved_fraudulent", label: "Escalated" },
];

const SEVERITY_VARIANTS: Record<Severity, "loss" | "warning" | "neutral" | "accent"> = {
  critical: "loss",
  high: "warning",
  medium: "accent",
  low: "neutral",
};

const STATUS_VARIANTS: Record<InvestigationStatus, "loss" | "warning" | "gain" | "accent"> = {
  open: "loss",
  under_review: "warning",
  resolved_genuine: "gain",
  resolved_fraudulent: "accent",
};

export default function FraudQueuePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data: fraudFlags, isLoading } = useFraudFlags(statusFilter);
  const updateMutation = useUpdateFraudFlag();

  const handleAction = (action: string, status: string) => {
    if (!selectedFlag) return;
    updateMutation.mutate(
      { id: selectedFlag.flag_id, action, status },
      {
        onSuccess: () => setSelectedFlag(null),
      }
    );
  };

  const columns = [
    {
      key: "flag_id",
      header: "ID",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-muted-foreground">{String(row.flag_id).slice(0, 8)}</span>
      ),
    },
    {
      key: "merchant_id",
      header: "Merchant",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-foreground">{String(row.merchant_id)}</span>
      ),
    },
    {
      key: "flag_type",
      header: "Type",
      render: (_: unknown, row: Row) => (
        <span className="text-xs text-foreground">{String(row.flag_type).replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      render: (_: unknown, row: Row) => (
        <Badge variant={SEVERITY_VARIANTS[row.severity as Severity]}>{String(row.severity)}</Badge>
      ),
    },
    {
      key: "investigation_status",
      header: "Status",
      render: (_: unknown, row: Row) => (
        <Badge variant={STATUS_VARIANTS[row.investigation_status as InvestigationStatus]}>
          {String(row.investigation_status).replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-muted-foreground">{formatDate(String(row.created_at))}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <Button size="sm" variant="ghost" onClick={() => setSelectedFlag(row as unknown as FraudFlag)}>
          ▸
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Fraud Queue" subtitle="Review and manage fraud flags" />

      <Tabs tabs={STATUS_TABS} activeTab={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {isLoading ? (
          <Card>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </Card>
        ) : fraudFlags && fraudFlags.length > 0 ? (
          <DataTable
            columns={columns}
            data={fraudFlags as unknown as Row[]}
            onRowClick={(row) => setSelectedFlag(row as unknown as FraudFlag)}
          />
        ) : (
          <Card>
            <EmptyState
              title="No fraud flags"
              description={activeTab === "all" ? "No fraud flags in the system." : `No ${activeTab.replace(/_/g, " ")} fraud flags.`}
            />
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedFlag}
        onClose={() => setSelectedFlag(null)}
        title="Fraud Flag Details"
      >
        {selectedFlag && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Flag ID</p>
                <p className="font-mono text-sm text-foreground">{selectedFlag.flag_id}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Merchant</p>
                <p className="font-mono text-sm text-foreground">{selectedFlag.merchant_id}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Type</p>
                <p className="text-sm text-foreground">{selectedFlag.flag_type.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Period</p>
                <p className="font-mono text-sm text-foreground">{selectedFlag.period_id}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Severity</p>
                <Badge variant={SEVERITY_VARIANTS[selectedFlag.severity]}>{selectedFlag.severity}</Badge>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
                <Badge variant={STATUS_VARIANTS[selectedFlag.investigation_status]}>
                  {selectedFlag.investigation_status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Detection Signal</p>
              <p className="mt-1 rounded-md border border-border bg-muted/30 p-2 text-xs text-foreground">
                {selectedFlag.detection_signal}
              </p>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Current Action</p>
              <p className="text-sm text-foreground">{selectedFlag.action_taken.replace(/_/g, " ")}</p>
            </div>

            <div className={cn("flex flex-wrap gap-2 border-t border-border pt-4")}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAction("monitor", "resolved_genuine")}
                loading={updateMutation.isPending}
              >
                Clear — Genuine
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAction("score_hold", "under_review")}
                loading={updateMutation.isPending}
              >
                Hold Score
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction("score_reduction", "resolved_fraudulent")}
                loading={updateMutation.isPending}
              >
                Escalate
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleAction("exclusion", "resolved_fraudulent")}
                loading={updateMutation.isPending}
              >
                Suspend Merchant
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
