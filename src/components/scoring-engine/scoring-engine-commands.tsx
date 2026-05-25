"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  runScoringEngineCommand,
  type RunScoringEngineCommandPayload,
  type ScoringEngineCommand,
} from "@/lib/api/services/scoring-engine.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

const COMMAND_META: Record<
  ScoringEngineCommand,
  { label: string; description: string; danger?: boolean }
> = {
  "scores:tick": {
    label: "Live score tick",
    description: "Recompute live composite + live_rank for all active branches (same as scores:tick).",
  },
  "scores:compute-daily": {
    label: "Compute daily scores",
    description: "Persist merchant_location_scores and final_rank for the chosen date (default: yesterday).",
  },
  "payouts:distribute-daily": {
    label: "Distribute daily payouts",
    description: "Build bonus pool from platform fees and write payout_records. Use dry-run to preview only.",
    danger: true,
  },
  "demo:add-txn": {
    label: "Add demo transactions",
    description: "Simulate paid bills on this demo branch to grow the pool and scores.",
  },
};

interface ScoringEngineCommandsProps {
  defaultDate?: string;
}

export function ScoringEngineCommands({ defaultDate }: ScoringEngineCommandsProps) {
  const qc = useQueryClient();
  const [date, setDate] = useState(defaultDate ?? "");
  const [dryRun, setDryRun] = useState(true);
  const [catchUp, setCatchUp] = useState(false);
  const [txnCount, setTxnCount] = useState("1");
  const [billAmount, setBillAmount] = useState("");
  const [lastOutput, setLastOutput] = useState<{
    command: string;
    exit_code: number;
    output: string;
    ran_at: string;
  } | null>(null);

  const { mutate, isPending, variables } = useMutation({
    mutationFn: (payload: RunScoringEngineCommandPayload) => runScoringEngineCommand(payload),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setLastOutput({
          command: res.data.command,
          exit_code: res.data.exit_code,
          output: res.data.output,
          ran_at: res.data.ran_at,
        });
      }
      void qc.invalidateQueries({ queryKey: ["scoring-engine"] });
      void qc.invalidateQueries({ queryKey: ["branch-payouts"] });
      void qc.invalidateQueries({ queryKey: ["merchant-dashboard"] });
      void qc.invalidateQueries({ queryKey: ["branchScore"] });
    },
  });

  function run(command: ScoringEngineCommand) {
    const payload: RunScoringEngineCommandPayload = { command };
    if (date) payload.date = date;
    if (command === "payouts:distribute-daily") {
      payload.dry_run = dryRun;
      payload.catch_up = catchUp;
    }
    if (command === "demo:add-txn") {
      payload.count = Math.min(20, Math.max(1, parseInt(txnCount, 10) || 1));
      if (billAmount) payload.bill_amount = parseFloat(billAmount);
      payload.random = !billAmount;
    }
    mutate(payload);
  }

  const runningCommand = isPending ? variables?.command : null;

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Run artisan commands
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Demo merchants only. Commands run on the server with your live DB configuration.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Date (YYYY-MM-DD, optional)"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <div className="flex flex-col justify-end gap-2 sm:col-span-2 sm:flex-row sm:flex-wrap">
            <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="rounded border-glass-border"
              />
              Payout dry-run (no DB writes)
            </label>
            <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={catchUp}
                onChange={(e) => setCatchUp(e.target.checked)}
                className="rounded border-glass-border"
              />
              Payout catch-up all missed days
            </label>
          </div>
          <Input
            label="Demo txn count (1–20)"
            type="number"
            min={1}
            max={20}
            value={txnCount}
            onChange={(e) => setTxnCount(e.target.value)}
          />
          <Input
            label="Demo bill ₹ (blank = random)"
            type="number"
            min={1}
            value={billAmount}
            onChange={(e) => setBillAmount(e.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.keys(COMMAND_META) as ScoringEngineCommand[]).map((cmd) => {
            const meta = COMMAND_META[cmd];
            const isRunning = runningCommand === cmd;
            return (
              <div
                key={cmd}
                className={cn(
                  "rounded-xl border p-3",
                  meta.danger ? "border-loss/30 bg-loss/5" : "border-glass-border bg-glass-bg/40",
                )}
              >
                <p className="font-mono text-xs font-semibold text-foreground">{meta.label}</p>
                <p className="mt-1 text-[10px] leading-snug text-muted-foreground">{meta.description}</p>
                <p className="mt-2 font-mono text-[10px] text-accent">{cmd}</p>
                <Button
                  className="mt-3 w-full"
                  size="sm"
                  variant={meta.danger && !dryRun && cmd === "payouts:distribute-daily" ? "danger" : "primary"}
                  disabled={isPending}
                  onClick={() => run(cmd)}
                >
                  {isRunning ? "Running…" : "Run"}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {lastOutput ? (
        <Card className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
              Last output
            </h3>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px]",
                lastOutput.exit_code === 0
                  ? "bg-gain/15 text-gain"
                  : "bg-loss/15 text-loss",
              )}
            >
              exit {lastOutput.exit_code}
            </span>
          </div>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {lastOutput.command} · {new Date(lastOutput.ran_at).toLocaleString()}
          </p>
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-glass-border bg-background/80 p-3 font-mono text-[11px] leading-relaxed text-foreground whitespace-pre-wrap">
            {lastOutput.output || "(no console output)"}
          </pre>
        </Card>
      ) : null}
    </div>
  );
}
