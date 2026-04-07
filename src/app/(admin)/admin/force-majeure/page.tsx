"use client";

import { useState } from "react";
import { useForceMajeure, useCreateForceMajeure } from "@/lib/hooks/use-admin";
import { PageHeader } from "@/components/layout/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { DataTable } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { ForceMajeureEvent, ForceMajeureEventType, ScoringAdjustmentType } from "@/lib/types";
import { cn } from "@/lib/utils/cn";
import { formatDate } from "@/lib/utils/format";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { FORCE_MAJEURE_INFO } from "@/lib/constants/scoring";

type Row = Record<string, unknown>;

const EVENT_TYPE_OPTIONS = [
  { value: "natural_disaster", label: "Natural Disaster" },
  { value: "civil_disruption", label: "Civil Disruption" },
  { value: "platform_outage", label: "Platform Outage" },
  { value: "macro_economic", label: "Macro Economic" },
];

const ADJUSTMENT_TYPE_OPTIONS = [
  { value: "pause", label: "Pause Scoring" },
  { value: "baseline_correction", label: "Baseline Correction" },
  { value: "tolerance_widening", label: "Tolerance Widening" },
];

const EVENT_TYPE_ICONS: Record<ForceMajeureEventType, string> = {
  natural_disaster: "🌊",
  civil_disruption: "⚠️",
  platform_outage: "🔧",
  macro_economic: "📉",
};

export default function ForceMajeurePage() {
  const { data: events, isLoading } = useForceMajeure();
  const createMutation = useCreateForceMajeure();
  const [showCreate, setShowCreate] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("natural_disaster");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formLocations, setFormLocations] = useState("");
  const [formAdjustment, setFormAdjustment] = useState<string>("pause");

  const now = new Date();
  const activeEvents = events?.filter((e) => new Date(e.end_timestamp) > now) ?? [];
  const pastEvents = events?.filter((e) => new Date(e.end_timestamp) <= now) ?? [];

  const resetForm = () => {
    setFormName("");
    setFormType("natural_disaster");
    setFormStartDate("");
    setFormEndDate("");
    setFormLocations("");
    setFormAdjustment("pause");
  };

  const handleCreate = () => {
    if (!formName || !formStartDate || !formEndDate) return;
    createMutation.mutate(
      {
        event_name: formName,
        event_type: formType as ForceMajeureEventType,
        affected_location_ids: formLocations.split(",").map((s) => s.trim()).filter(Boolean),
        start_timestamp: new Date(formStartDate).toISOString(),
        end_timestamp: new Date(formEndDate).toISOString(),
        scoring_adjustment_type: formAdjustment as ScoringAdjustmentType,
      },
      {
        onSuccess: () => {
          setShowCreate(false);
          resetForm();
        },
      }
    );
  };

  const pastColumns = [
    {
      key: "event_name",
      header: "Event",
      render: (_: unknown, row: Row) => (
        <span className="text-sm text-foreground">{String(row.event_name)}</span>
      ),
    },
    {
      key: "event_type",
      header: "Type",
      render: (_: unknown, row: Row) => (
        <span className="text-xs text-muted-foreground">{String(row.event_type).replace(/_/g, " ")}</span>
      ),
    },
    {
      key: "start_timestamp",
      header: "Start",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-muted-foreground">{formatDate(String(row.start_timestamp))}</span>
      ),
    },
    {
      key: "end_timestamp",
      header: "End",
      render: (_: unknown, row: Row) => (
        <span className="font-mono text-xs text-muted-foreground">{formatDate(String(row.end_timestamp))}</span>
      ),
    },
    {
      key: "scoring_adjustment_type",
      header: "Adjustment",
      render: (_: unknown, row: Row) => (
        <div className="flex items-center gap-1.5">
          <Badge variant="neutral">{String(row.scoring_adjustment_type).replace(/_/g, " ")}</Badge>
          <InfoTooltip text={FORCE_MAJEURE_INFO.adjustment_types[row.scoring_adjustment_type as keyof typeof FORCE_MAJEURE_INFO.adjustment_types] ?? ""} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Force Majeure" subtitle="Manage exceptional events affecting scoring">
        <InfoTooltip text={FORCE_MAJEURE_INFO.concept} />
        <Button onClick={() => setShowCreate(true)}>New Event</Button>
      </PageHeader>

      {/* Active Events */}
      <div>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Active Events
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} variant="rect" className="h-32" />
            ))}
          </div>
        ) : activeEvents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeEvents.map((event) => (
              <Card key={event.event_id} className="border-warning/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{EVENT_TYPE_ICONS[event.event_type]}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-mono text-sm font-bold text-foreground">{event.event_name}</h3>
                        <InfoTooltip text={FORCE_MAJEURE_INFO.event_types[event.event_type]} />
                      </div>
                      <p className="text-xs text-muted-foreground">{event.event_type.replace(/_/g, " ")}</p>
                    </div>
                  </div>
                  <Badge variant="warning">Active</Badge>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">Affected:</span>{" "}
                    {event.affected_location_ids.length > 0 ? event.affected_location_ids.join(", ") : "All locations"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-mono">Period:</span>{" "}
                    {formatDate(event.start_timestamp)} – {formatDate(event.end_timestamp)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="font-mono">Adjustment:</span>{" "}
                    {event.scoring_adjustment_type.replace(/_/g, " ")}
                    <InfoTooltip text={FORCE_MAJEURE_INFO.adjustment_types[event.scoring_adjustment_type]} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState title="No active events" description="No force majeure events currently in effect." />
          </Card>
        )}
      </div>

      {/* Past Events Table */}
      <div>
        <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Past Events
        </h2>
        {isLoading ? (
          <Card>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </Card>
        ) : pastEvents.length > 0 ? (
          <DataTable
            columns={pastColumns}
            data={pastEvents as unknown as Row[]}
          />
        ) : (
          <Card>
            <EmptyState title="No past events" description="Historical force majeure events will appear here." />
          </Card>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} title="Create Force Majeure Event">
        <div className="space-y-4">
          <Input
            label="Event Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Cyclone Fani"
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Event Type</label>
            <Select
              options={EVENT_TYPE_OPTIONS}
              value={formType}
              onChange={setFormType}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={formStartDate}
              onChange={(e) => setFormStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={formEndDate}
              onChange={(e) => setFormEndDate(e.target.value)}
            />
          </div>
          <Input
            label="Affected Location IDs (comma-separated)"
            value={formLocations}
            onChange={(e) => setFormLocations(e.target.value)}
            placeholder="loc-001, loc-002"
          />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Adjustment Type</label>
            <Select
              options={ADJUSTMENT_TYPE_OPTIONS}
              value={formAdjustment}
              onChange={setFormAdjustment}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button variant="secondary" onClick={() => { setShowCreate(false); resetForm(); }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={createMutation.isPending}
              disabled={!formName || !formStartDate || !formEndDate}
            >
              Create Event
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
