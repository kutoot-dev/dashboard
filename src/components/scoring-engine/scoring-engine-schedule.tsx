"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  runScoringEngineCommand,
  type ScoringEngineOverview,
} from "@/lib/api/services/scoring-engine.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ScoringEngineScheduleProps {
  schedule: ScoringEngineOverview["schedule"];
  allowedCommands: string[];
}

export function ScoringEngineSchedule({ schedule, allowedCommands }: ScoringEngineScheduleProps) {
  const qc = useQueryClient();
  const canRunSchedule = allowedCommands.includes("schedule:run");

  const { mutate, isPending, data } = useMutation({
    mutationFn: () => runScoringEngineCommand({ command: "schedule:run" }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["scoring-engine"] });
      void qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
      void qc.invalidateQueries({ queryKey: ["branchScore"] });
    },
  });

  const lastRun = data?.success ? data.data : null;

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
            Scheduled work
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Production cron runs these jobs automatically. Use the button to run all due tasks once
            (same as <span className="font-mono">php artisan schedule:run</span>).
          </p>
        </div>
        {canRunSchedule ? (
          <Button size="sm" disabled={isPending} onClick={() => mutate()}>
            {isPending ? "Running…" : "Run due schedule"}
          </Button>
        ) : null}
      </div>

      <ul className="mt-4 space-y-2">
        {schedule.map((step) => (
          <li
            key={step.id}
            className="rounded-lg border border-glass-border bg-glass-bg/40 px-3 py-2"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-secondary">
                {step.cron}
              </span>
              <span className="font-mono text-[10px] text-accent">{step.command}</span>
            </div>
            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ul>

      {lastRun ? (
        <div
          className={cn(
            "mt-4 rounded-lg border p-3",
            lastRun.exit_code === 0 ? "border-gain/30 bg-gain/5" : "border-loss/30 bg-loss/5",
          )}
        >
          <p className="font-mono text-[10px] text-muted-foreground">
            schedule:run · exit {lastRun.exit_code} · {new Date(lastRun.ran_at).toLocaleString()}
          </p>
          <pre className="mt-2 max-h-40 overflow-auto font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground">
            {lastRun.output || "(no console output)"}
          </pre>
        </div>
      ) : null}
    </Card>
  );
}
