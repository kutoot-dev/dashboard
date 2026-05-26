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

type CommandOption = {
  id: string;
  label: string;
  help: string;
  /** Controlled by parent state key */
  stateKey: "dryRun" | "catchUp" | "randomBill";
};

type CommandMeta = {
  label: string;
  description: string;
  howItWorks: string[];
  usesDate: boolean;
  options?: CommandOption[];
  danger?: boolean;
};

const COMMAND_META: Record<ScoringEngineCommand, CommandMeta> = {
  "scores:tick": {
    label: "Live score tick",
    description: "Recompute live composite and live_rank for every active branch.",
    howItWorks: [
      "Reads paid/completed transactions for today per branch.",
      "Runs ExchangeScoreService (v2) logic against live metrics.",
      "Upserts merchant_metrics_live (composite, rank, GMV, txn count).",
      "Same job as production cron every minute.",
    ],
    usesDate: false,
  },
  "scores:track-composite": {
    label: "Track composite history",
    description: "Persist 1-minute composite snapshots for dashboard trend charts.",
    howItWorks: [
      "Snapshots each branch's live_composite_score into history tables.",
      "Powers the score trend graph on the merchant dashboard.",
      "Runs every minute in production alongside scores:tick.",
    ],
    usesDate: false,
  },
  "schedule:run": {
    label: "Run due schedule",
    description: "Execute all scheduler tasks that are due now.",
    howItWorks: [
      "Invokes php artisan schedule:run on the server.",
      "May run scores:tick, track-composite, subscription jobs, etc. if their cron is due.",
      "Use the Scheduled work card above for a dedicated schedule:run button.",
    ],
    usesDate: false,
  },
  "scores:compute-daily": {
    label: "Compute daily scores",
    description: "Persist merchant_location_scores and final_rank for a calendar day.",
    howItWorks: [
      "Default date is yesterday when the date field is left empty.",
      "Loops all active branches; writes 8 sub-scores + composite_index_score.",
      "Recomputes final_rank for that period_date (used at payout time).",
      "Run after the business day ends, before payouts:distribute-daily.",
    ],
    usesDate: true,
  },
  "payouts:distribute-daily": {
    label: "Distribute daily payouts",
    description: "Build bonus pool from platform fees and write payout_records.",
    howItWorks: [
      "Pool = Σ(platform_fee × merchant_bonus_pool%) for paid/completed txns that day.",
      "Eligible branches: composite ≥ min threshold (fallback: all scored).",
      "Share = (composite ÷ Σ composite) × pool, capped at max_single_branch_share × pool.",
      "Creates scoring_period + payout_records unless dry-run is checked.",
    ],
    usesDate: true,
    options: [
      {
        id: "dry-run",
        label: "Dry-run (preview only)",
        help: "Prints pool, per-branch shares, and totals to console. No payout_records or period writes.",
        stateKey: "dryRun",
      },
      {
        id: "catch-up",
        label: "Catch-up missed days",
        help: "Processes every completed calendar day that was never closed, through yesterday.",
        stateKey: "catchUp",
      },
    ],
    danger: true,
  },
  "demo:add-txn": {
    label: "Add demo transactions",
    description: "Simulate paid bills on this demo branch to grow pool and scores.",
    howItWorks: [
      "Only works on is_test merchant locations (this demo branch).",
      "Creates paid transactions with platform_fee so the bonus pool grows.",
      "Triggers live metric refresh indirectly on next scores:tick.",
      "Count 1–20 per run; bill amount fixed or random ₹150–2500.",
    ],
    usesDate: false,
    options: [
      {
        id: "random-bill",
        label: "Random bill amount",
        help: "When checked, each txn uses a random bill (₹150–2500). Uncheck to use the fixed ₹ field.",
        stateKey: "randomBill",
      },
    ],
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
  const [randomBill, setRandomBill] = useState(true);
  const [txnCount, setTxnCount] = useState("1");
  const [billAmount, setBillAmount] = useState("");
  const [expandedCmd, setExpandedCmd] = useState<ScoringEngineCommand | null>(null);
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

  function getOptionChecked(stateKey: CommandOption["stateKey"]): boolean {
    if (stateKey === "dryRun") return dryRun;
    if (stateKey === "catchUp") return catchUp;
    return randomBill;
  }

  function setOptionChecked(stateKey: CommandOption["stateKey"], checked: boolean) {
    if (stateKey === "dryRun") setDryRun(checked);
    else if (stateKey === "catchUp") setCatchUp(checked);
    else setRandomBill(checked);
  }

  function run(command: ScoringEngineCommand) {
    const payload: RunScoringEngineCommandPayload = { command };
    const meta = COMMAND_META[command];

    if (meta.usesDate && date) payload.date = date;

    if (command === "payouts:distribute-daily") {
      payload.dry_run = dryRun;
      payload.catch_up = catchUp;
    }

    if (command === "demo:add-txn") {
      payload.count = Math.min(20, Math.max(1, parseInt(txnCount, 10) || 1));
      if (!randomBill && billAmount) payload.bill_amount = parseFloat(billAmount);
      payload.random = randomBill || !billAmount;
    }

    mutate(payload);
  }

  const runningCommand = isPending ? variables?.command : null;
  const runnableCommands = (Object.keys(COMMAND_META) as ScoringEngineCommand[]).filter(
    (cmd) => cmd !== "schedule:run",
  );

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Run artisan commands
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Demo merchants only. Each command runs on the server with your live DB configuration.
          Expand a card to see how it works; checkboxes apply only to that command.
        </p>

        <div className="mt-4">
          <Input
            label="Date (YYYY-MM-DD)"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Used by compute-daily and distribute-daily. Leave empty for artisan default (usually
            yesterday).
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {runnableCommands.map((cmd) => {
            const meta = COMMAND_META[cmd];
            const isRunning = runningCommand === cmd;
            const isExpanded = expandedCmd === cmd;
            const isPayout = cmd === "payouts:distribute-daily";
            const isDemoTxn = cmd === "demo:add-txn";

            return (
              <div
                key={cmd}
                className={cn(
                  "rounded-xl border",
                  meta.danger ? "border-loss/30 bg-loss/5" : "border-glass-border bg-glass-bg/40",
                )}
              >
                <div className="p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs font-semibold text-foreground">{meta.label}</p>
                      <p className="mt-0.5 font-mono text-[10px] text-accent">{cmd}</p>
                      <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                        {meta.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpandedCmd(isExpanded ? null : cmd)}
                      className="shrink-0 rounded-lg border border-glass-border px-2 py-1 font-mono text-[10px] text-muted-foreground hover:bg-glass-bg"
                    >
                      {isExpanded ? "Hide steps" : "How it works"}
                    </button>
                  </div>

                  {isExpanded ? (
                    <ol className="mt-3 list-decimal space-y-1 pl-4 text-[10px] leading-snug text-muted-foreground">
                      {meta.howItWorks.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  ) : null}

                  {meta.options?.length ? (
                    <div className="mt-3 space-y-2 rounded-lg border border-glass-border/80 bg-background/40 p-2">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                        Options for this command
                      </p>
                      {meta.options.map((opt) => (
                        <label
                          key={opt.id}
                          className="flex cursor-pointer items-start gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={getOptionChecked(opt.stateKey)}
                            onChange={(e) => setOptionChecked(opt.stateKey, e.target.checked)}
                            className="mt-0.5 rounded border-glass-border"
                          />
                          <span className="min-w-0">
                            <span className="font-mono text-[10px] text-foreground">{opt.label}</span>
                            <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                              {opt.help}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  {isDemoTxn ? (
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <Input
                        label="Txn count (1–20)"
                        type="number"
                        min={1}
                        max={20}
                        value={txnCount}
                        onChange={(e) => setTxnCount(e.target.value)}
                      />
                      <div>
                        <Input
                          label="Fixed bill ₹"
                          type="number"
                          min={1}
                          value={billAmount}
                          onChange={(e) => setBillAmount(e.target.value)}
                          disabled={randomBill}
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {randomBill
                            ? "Disabled while random bill is checked."
                            : "Required when random is off."}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  <Button
                    className="mt-3 w-full sm:w-auto"
                    size="sm"
                    variant={meta.danger && !dryRun && isPayout ? "danger" : "primary"}
                    disabled={isPending}
                    onClick={() => run(cmd)}
                  >
                    {isRunning ? "Running…" : "Run command"}
                  </Button>
                </div>
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
