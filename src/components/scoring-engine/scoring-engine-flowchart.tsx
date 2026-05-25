"use client";

import type { ScoringEngineOverview } from "@/lib/api/services/scoring-engine.service";
import { cn } from "@/lib/utils/cn";

interface ScoringEngineFlowchartProps {
  rules: ScoringEngineOverview["payout_rules"];
  className?: string;
}

function FlowNode({
  title,
  body,
  accent = "accent",
}: {
  title: string;
  body: string;
  accent?: "accent" | "secondary" | "gain";
}) {
  const accentClass =
    accent === "gain"
      ? "border-gain/40 bg-gain/10"
      : accent === "secondary"
        ? "border-secondary/40 bg-secondary/10"
        : "border-accent/40 bg-accent/10";

  return (
    <div
      className={cn(
        "rounded-xl border px-3 py-2.5 text-center shadow-[0_8px_20px_rgba(8,13,34,0.2)]",
        accentClass,
      )}
    >
      <p className="font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground">
        {title}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{body}</p>
    </div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <div className="h-5 w-px bg-accent/50" />
      <div className="h-0 w-0 border-x-4 border-t-6 border-x-transparent border-t-accent/60" />
      {label ? (
        <span className="font-mono text-[9px] text-muted-foreground">{label}</span>
      ) : null}
    </div>
  );
}

export function ScoringEngineFlowchart({ rules, className }: ScoringEngineFlowchartProps) {
  const feeLabel =
    rules.platform_fee_mode === "percentage"
      ? `${rules.platform_fee_percentage}% platform fee`
      : "Fixed platform fee";

  return (
    <div className={cn("space-y-4", className)}>
      <p className="text-xs text-muted-foreground">
        End-to-end flow using live DB parameters. Rankings and payouts run in parallel
        tracks; midnight jobs settle the calendar day.
      </p>

      <div className="grid gap-2 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
        {/* Money track */}
        <div className="space-y-0">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-accent">
            Bonus pool (money)
          </p>
          <FlowNode title="Paid transaction" body="Bill → platform_fee on txn" accent="secondary" />
          <FlowArrow label={`× ${rules.merchant_bonus_pool_percentage}% → pool`} />
          <FlowNode
            title="Daily bonus pool"
            body={rules.pool_formula}
            accent="gain"
          />
          <FlowArrow label="Eligible branches only" />
          <FlowNode
            title="Weighted split"
            body={`composite ≥ ${rules.payout_min_score_threshold}; cap ${(rules.payout_max_single_branch_share * 100).toFixed(0)}% / branch`}
          />
          <FlowArrow />
          <FlowNode title="payout_records" body="allocated_amount · status pending" accent="gain" />
        </div>

        {/* Connector */}
        <div className="hidden items-center justify-center lg:flex">
          <div className="rounded-full border border-glass-border bg-glass-bg px-2 py-1 font-mono text-[9px] text-muted-foreground">
            uses composite
          </div>
        </div>

        {/* Score track */}
        <div className="space-y-0">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-secondary">
            Ranking (score v{rules.score_formula_version})
          </p>
          <FlowNode
            title="8 sub-scores"
            body="GMV · commission · platform · growth · repeat · discount · referral · fairness"
            accent="secondary"
          />
          <FlowArrow label="+ behavior penalties" />
          <FlowNode
            title="Composite"
            body={`Clamp ${rules.score_floor} – ${rules.score_ceiling}`}
          />
          <FlowArrow label="Every minute: live_rank" />
          <FlowNode title="merchant_metrics_live" body="live_composite_score · live_rank" />
          <FlowArrow label="00:00: final_rank" />
          <FlowNode title="merchant_location_scores" body="Daily snapshot + payout_amount" accent="secondary" />
        </div>
      </div>

      <div className="rounded-xl border border-glass-border bg-glass-bg/60 p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Share formula
        </p>
        <p className="mt-1 font-mono text-xs text-foreground">{rules.share_formula}</p>
      </div>

      {/* Scheduled jobs row */}
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { t: "Every minute", c: "scores:tick", d: "Live score + rank" },
          { t: "Every minute", c: "scores:track-composite", d: "Trend snapshots" },
          { t: "00:00 daily", c: "scores:compute-daily", d: "Close day scores" },
          { t: "00:00 daily", c: "payouts:distribute-daily", d: "Settle bonus pool" },
        ].map((step) => (
          <div
            key={step.c}
            className="rounded-lg border border-border/60 bg-card/40 px-2.5 py-2"
          >
            <p className="font-mono text-[9px] text-accent">{step.t}</p>
            <p className="font-mono text-[10px] font-semibold text-foreground">{step.c}</p>
            <p className="text-[10px] text-muted-foreground">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
