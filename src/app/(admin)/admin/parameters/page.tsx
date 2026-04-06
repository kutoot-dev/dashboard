"use client";

import { useState } from "react";
import { useParameters, useUpdateParameter } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import type { ScoringParameter } from "@/lib/types";
import { SCORING_PARAMETER_DEFINITIONS } from "@/lib/constants/scoring";
import { formatDate } from "@/lib/utils/format";

type Row = Record<string, unknown>;

export default function ParametersPage() {
  const { data: parameters, isLoading } = useParameters();
  const updateMutation = useUpdateParameter();

  const [editingParam, setEditingParam] = useState<ScoringParameter | null>(null);
  const [editValue, setEditValue] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleEdit = (row: Row) => {
    const param = row as unknown as ScoringParameter;
    setEditingParam(param);
    setEditValue(String(param.parameter_value));
    setFeedback(null);
  };

  const handleSave = () => {
    if (!editingParam) return;
    const numValue = parseFloat(editValue);
    if (isNaN(numValue)) {
      setFeedback({ type: "error", message: "Please enter a valid number" });
      return;
    }
    updateMutation.mutate(
      { key: editingParam.parameter_key, value: numValue },
      {
        onSuccess: () => {
          setFeedback({ type: "success", message: "Parameter updated successfully" });
          setTimeout(() => {
            setEditingParam(null);
            setFeedback(null);
          }, 1000);
        },
        onError: () => {
          setFeedback({ type: "error", message: "Failed to update parameter" });
        },
      }
    );
  };

  const columns = [
    {
      key: "parameter_key",
      header: "Key",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-foreground">{String(row.parameter_key)}</span>
      ),
    },
    {
      key: "parameter_description",
      header: "Description",
      render: (_: unknown, row: Row) => {
        const key = String(row.parameter_key);
        return (
          <span className="text-xs text-muted-foreground">
            {String(row.parameter_description || SCORING_PARAMETER_DEFINITIONS[key]?.description || "—")}
          </span>
        );
      },
    },
    {
      key: "parameter_value",
      header: "Value",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-sm font-bold text-foreground">{String(row.parameter_value)}</span>
      ),
    },
    {
      key: "last_updated_at",
      header: "Updated",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.last_updated_at ? formatDate(String(row.last_updated_at)) : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right" as const,
      render: (_: unknown, row: Row) => (
        <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Scoring Parameters" subtitle="Manage 21 scoring configuration values" />

      {isLoading ? (
        <Card>
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-8" />
            ))}
          </div>
        </Card>
      ) : parameters ? (
        <DataTable
          columns={columns}
          data={parameters as unknown as Row[]}
        />
      ) : null}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingParam}
        onClose={() => { setEditingParam(null); setFeedback(null); }}
        title="Edit Parameter"
      >
        {editingParam && (
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs text-muted-foreground">Parameter</p>
              <p className="font-mono text-sm font-bold text-foreground">{editingParam.parameter_key}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-muted-foreground">Description</p>
              <p className="text-sm text-foreground">
                {editingParam.parameter_description || SCORING_PARAMETER_DEFINITIONS[editingParam.parameter_key]?.description || "—"}
              </p>
            </div>
            <Input
              label="Value"
              type="number"
              step="any"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
            />
            {feedback && (
              <p className={`text-xs font-mono ${feedback.type === "success" ? "text-gain" : "text-loss"}`}>
                {feedback.message}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setEditingParam(null); setFeedback(null); }}>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={updateMutation.isPending}>
                Save
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
