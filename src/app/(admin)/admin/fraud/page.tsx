"use client";

import { useState } from "react";
import { useFraudFlags, useUpdateFraudFlag } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { FraudFlag, FraudFlagType, Severity, InvestigationStatus, FraudAction } from "@/lib/types";
import { formatDate } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";

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

const SEVERITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const FLAG_TYPE_OPTIONS = [
  { value: "fake_transaction", label: "Fake Transaction" },
  { value: "referral_loop", label: "Referral Loop" },
  { value: "artificial_spike", label: "Artificial Spike" },
  { value: "discount_manipulation", label: "Discount Manipulation" },
  { value: "price_inflation", label: "Price Inflation" },
  { value: "category_abuse", label: "Category Abuse" },
  { value: "dormancy_gaming", label: "Dormancy Gaming" },
];

const INVESTIGATION_STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "resolved_genuine", label: "Resolved — Genuine" },
  { value: "resolved_fraudulent", label: "Resolved — Fraudulent" },
];

const ACTION_OPTIONS = [
  { value: "monitor", label: "Monitor" },
  { value: "score_hold", label: "Score Hold" },
  { value: "score_reduction", label: "Score Reduction" },
  { value: "exclusion", label: "Exclusion" },
];

export default function FraudQueuePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);

  // Editable form state for modal
  const [editSeverity, setEditSeverity] = useState("");
  const [editFlagType, setEditFlagType] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAction, setEditAction] = useState("");
  const [editSignal, setEditSignal] = useState("");

  const statusFilter = activeTab === "all" ? undefined : activeTab;
  const { data: fraudFlags, isLoading } = useFraudFlags(statusFilter);
  const updateMutation = useUpdateFraudFlag();

  const openDetailModal = (flag: FraudFlag) => {
    setSelectedFlag(flag);
    setEditSeverity(flag.severity);
    setEditFlagType(flag.flag_type);
    setEditStatus(flag.investigation_status);
    setEditAction(flag.action_taken);
    setEditSignal(flag.detection_signal);
  };

  const handleSave = () => {
    if (!selectedFlag) return;
    updateMutation.mutate(
      { id: selectedFlag.flag_id, action: editAction, status: editStatus },
      {
        onSuccess: () => setSelectedFlag(null),
      }
    );
  };

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
        <Button size="sm" variant="ghost" onClick={() => openDetailModal(row as unknown as FraudFlag)}>
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
            onRowClick={(row) => openDetailModal(row as unknown as FraudFlag)}
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
            </div>

            {/* Editable Type */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Flag Type
                <InfoTooltip text="Reclassify the fraud type if the initial auto-detection was incorrect." />
              </label>
              <Select
                options={FLAG_TYPE_OPTIONS}
                value={editFlagType}
                onChange={setEditFlagType}
              />
            </div>

            {/* Editable Severity */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Severity
                <InfoTooltip text="Adjust severity based on investigation findings. Critical = immediate action, Low = monitoring only." />
              </label>
              <Select
                options={SEVERITY_OPTIONS}
                value={editSeverity}
                onChange={setEditSeverity}
              />
            </div>

            {/* Editable Status */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Investigation Status
                <InfoTooltip text="Update the investigation status. 'Resolved — Genuine' clears the flag; 'Resolved — Fraudulent' triggers penalty actions." />
              </label>
              <Select
                options={INVESTIGATION_STATUS_OPTIONS}
                value={editStatus}
                onChange={setEditStatus}
              />
            </div>

            {/* Editable Action */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Action
                <InfoTooltip text="Monitor = no score impact. Score Hold = freeze score. Score Reduction = penalize. Exclusion = remove from rewards." />
              </label>
              <Select
                options={ACTION_OPTIONS}
                value={editAction}
                onChange={setEditAction}
              />
            </div>

            {/* Editable Detection Signal */}
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                Detection Signal
                <InfoTooltip text="Edit the detection signal description to add investigation notes or correct auto-generated text." />
              </label>
              <textarea
                value={editSignal}
                onChange={(e) => setEditSignal(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>

            {/* Save + Quick Actions */}
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button
                size="sm"
                onClick={handleSave}
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
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
