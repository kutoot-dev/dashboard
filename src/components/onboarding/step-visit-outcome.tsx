"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { faCheck, faPlus, faXmark } from "@/lib/icons";
import { useOnboardingStore } from "@/lib/stores/onboarding.store";
import { VISIT_OUTCOME_OPTIONS } from "@/lib/constants/onboarding";
import { cn } from "@/lib/utils/cn";
import type { FollowUpSchedule, VisitOutcome } from "@/lib/types";

interface StepVisitOutcomeProps {
  onNext: () => void;
  onBack: () => void;
}

function newSlot(): FollowUpSchedule {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: "",
    time: "",
    notes: "",
  };
}

/**
 * Field Executive step: capture the outcome of the merchant visit
 * before deciding whether to proceed with full onboarding or just
 * log a visit record.
 */
export function StepVisitOutcome({ onNext, onBack }: StepVisitOutcomeProps) {
  const { formData, updateFormData } = useOnboardingStore();
  const [error, setError] = useState("");

  const selectedOutcome = formData.visit_outcome;
  const schedules = formData.follow_up_schedules;

  const selectedConfig = VISIT_OUTCOME_OPTIONS.find(
    (o) => o.value === selectedOutcome,
  );

  const handleSelect = (outcome: VisitOutcome) => {
    updateFormData({ visit_outcome: outcome });
    setError("");
    // Seed one empty slot when switching to a schedulable outcome
    const cfg = VISIT_OUTCOME_OPTIONS.find((o) => o.value === outcome);
    if (cfg?.supportsSchedule && formData.follow_up_schedules.length === 0) {
      updateFormData({ follow_up_schedules: [newSlot()] });
    }
    if (!cfg?.supportsSchedule) {
      updateFormData({ follow_up_schedules: [] });
    }
  };

  /* ── schedule helpers ──────────────────────────────────────────── */
  const addSlot = () => {
    updateFormData({ follow_up_schedules: [...schedules, newSlot()] });
  };

  const removeSlot = (id: string) => {
    updateFormData({
      follow_up_schedules: schedules.filter((s) => s.id !== id),
    });
  };

  const updateSlot = (id: string, patch: Partial<FollowUpSchedule>) => {
    updateFormData({
      follow_up_schedules: schedules.map((s) =>
        s.id === id ? { ...s, ...patch } : s,
      ),
    });
  };

  /* ── validation ────────────────────────────────────────────────── */
  const handleNext = () => {
    if (!selectedOutcome) {
      setError("Please select the outcome of this visit before proceeding.");
      return;
    }
    if (selectedConfig?.supportsSchedule) {
      if (schedules.length === 0) {
        setError("Add at least one follow-up date and time.");
        return;
      }
      const incomplete = schedules.find((s) => !s.date || !s.time);
      if (incomplete) {
        setError("Each scheduled slot must have a date and time.");
        return;
      }
    }
    onNext();
  };

  /* ── current datetime in YYYY-MM-DDTHH:mm (min for datetime-local) ─ */
  const nowLocal = new Date().toISOString().slice(0, 16);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Visit Outcome</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Select what happened during your visit to this merchant.
          {selectedConfig?.isOnboarding
            ? " You'll proceed to the full onboarding form."
            : " Basic details will be captured and this will be logged as a visit record."}
        </p>
      </div>

      {/* Outcome grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {VISIT_OUTCOME_OPTIONS.map((opt) => {
          const isSelected = selectedOutcome === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value as VisitOutcome)}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition-all",
                opt.color,
                isSelected
                  ? "ring-2 ring-primary shadow-sm scale-[1.01]"
                  : "border-border",
              )}
            >
              <Icon icon={opt.icon} className="mt-0.5 h-5 w-5 text-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground leading-snug">
                  {opt.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                  {opt.description}
                </p>
              </div>
              {isSelected && (
                <Icon icon={faCheck} className="ml-auto mt-0.5 h-4 w-4 shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Notes area */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">
          Visit Notes{" "}
          <span className="text-xs font-normal text-muted-foreground">
            (optional)
          </span>
        </label>
        <textarea
          className="w-full min-h-[80px] rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="e.g. Merchant asked to revisit next Tuesday evening, or owner runs a single-person shop and was out for lunch…"
          value={formData.visit_notes}
          onChange={(e) => updateFormData({ visit_notes: e.target.value })}
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground text-right">
          {formData.visit_notes.length}/500
        </p>
      </div>

      {/* ── Follow-up scheduling (only for schedulable outcomes) ──── */}
      {selectedConfig?.supportsSchedule && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Follow-up Schedule
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set one or more dates &amp; times to revisit or call back this
                merchant.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={addSlot}
              className="text-primary text-xs gap-1.5"
            >
              <Icon icon={faPlus} className="h-3.5 w-3.5" />
              Add Slot
            </Button>
          </div>

          {schedules.length === 0 && (
            <button
              type="button"
              onClick={addSlot}
              className="w-full rounded-xl border-2 border-dashed border-border py-5 text-sm text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Tap to add a follow-up date &amp; time
            </button>
          )}

          {schedules.map((slot, idx) => (
            <div
              key={slot.id}
              className="rounded-xl border border-border bg-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Slot {idx + 1}
                </p>
                <button
                  type="button"
                  onClick={() => removeSlot(slot.id)}
                  aria-label="Remove slot"
                  className="text-muted-foreground hover:text-error transition-colors"
                >
                  <Icon icon={faXmark} className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  When <span className="text-error">*</span>
                </label>
                <input
                  type="datetime-local"
                  min={nowLocal}
                  value={slot.date && slot.time ? `${slot.date}T${slot.time}` : ""}
                  onChange={(e) => {
                    const [date, time] = e.target.value.split("T");
                    updateSlot(slot.id, { date: date ?? "", time: time ?? "" });
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Note for this slot{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call between 3–5 PM, ask for Rajesh"
                  value={slot.notes}
                  onChange={(e) =>
                    updateSlot(slot.id, { notes: e.target.value })
                  }
                  maxLength={200}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          ))}

          {schedules.length > 0 && (
            <button
              type="button"
              onClick={addSlot}
              className="w-full rounded-xl border border-dashed border-border py-3 text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
            >
              + Add another slot
            </button>
          )}
        </div>
      )}

      {/* Outcome callout */}
      {selectedConfig && (
        <div
          className={cn(
            "rounded-lg border p-3 flex items-start gap-2",
            selectedConfig.isOnboarding
              ? "border-success/40 bg-success/5"
              : "border-info/40 bg-info/5",
          )}
        >
          <Icon icon={selectedConfig.icon} className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {selectedConfig.isOnboarding
                ? "Proceeding to full onboarding"
                : "This will be saved as a visit record"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedConfig.isOnboarding
                ? "Complete the remaining steps to register this merchant on Kutoot Business."
                : "Basic shop details (phone & owner name optional) will be captured and the visit will be logged for follow-up tracking."}
            </p>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-error font-medium">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" onClick={handleNext} disabled={!selectedOutcome}>
          {selectedConfig?.isOnboarding ? "Start Onboarding →" : "Continue →"}
        </Button>
      </div>
    </div>
  );
}
