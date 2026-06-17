"use client";

import { useState } from "react";
import type { ScoringEngineOverview } from "@/lib/api/services/scoring-engine.service";
import { DISCOUNT_HEALTH_CONFIGURABLE } from "@/lib/constants/features";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const ALL_SUB_SCORES: Array<{
  key: string;
  label: string;
  weightKey: string;
  formula: string;
  example: string;
}> = [
  {
    key: "gmv",
    label: "GMV",
    weightKey: "gmv_weight",
    formula: "branch_gmv ÷ max(cohort gmv)  OR  min(1, gmv ÷ target)",
    example:
      "Branch GMV ₹50,000; cohort max ₹100,000 → gmv_score = 0.50. With weight 0.15 → adds 0.075 to composite.",
  },
  {
    key: "commission",
    label: "Commission",
    weightKey: "commission_weight",
    formula: "sigmoid(k × (gmv_norm − x₀)) with commission cap on raw earnings",
    example:
      "gmv_norm = 0.50, k = 3, x₀ = 0.50 → commission_score ≈ 0.50. weight 0.20 → +0.10 composite.",
  },
  {
    key: "platform_capture",
    label: "Platform capture",
    weightKey: "platform_capture_weight",
    formula: "min(1, (platform_net ÷ GMV) ÷ target_capture_ratio)",
    example:
      "Net platform ₹800 on ₹10,000 GMV → ratio 0.08. Target 0.10 → score 0.80 × weight 0.15 = 0.12.",
  },
  {
    key: "user_growth",
    label: "User growth",
    weightKey: "user_growth_weight",
    formula: "new_users ÷ max(new_users in cohort)",
    example: "45 new users vs cohort max 150 → 0.30 × weight 0.15 = 0.045.",
  },
  {
    key: "repeat_rate",
    label: "Repeat rate",
    weightKey: "repeat_rate_weight",
    formula: "returning_customers ÷ unique_customers",
    example: "80 repeat / 100 unique → 0.80 × weight 0.10 = 0.08.",
  },
  {
    key: "discount",
    label: "Discount health",
    weightKey: "discount_aggression_weight",
    formula: "1 − penalty(merchant discount depth vs sustainable band threshold)",
    example: "Deep merchant discount band offers lower this sub-score; sustainable band pricing keeps it near 1.0.",
  },
  {
    key: "referral",
    label: "Referral",
    weightKey: "referral_weight",
    formula: "referral_credits ÷ cohort max referral credits",
    example: "Branch earned 12 referral credits; max in cohort 40 → 0.30 × weight.",
  },
  {
    key: "fairness",
    label: "Fairness",
    weightKey: "fairness_weight",
    formula: "1 − gini(customer spend distribution)",
    example: "Even spend across customers → fairness near 1.0; one whale customer lowers it.",
  },
];

const SUB_SCORES = DISCOUNT_HEALTH_CONFIGURABLE
  ? ALL_SUB_SCORES
  : ALL_SUB_SCORES.filter((sub) => sub.key !== "discount");

interface ScoringEngineFormulaGuideProps {
  weights: ScoringEngineOverview["config"]["weights"];
  payoutRules: ScoringEngineOverview["payout_rules"];
}

export function ScoringEngineFormulaGuide({ weights, payoutRules }: ScoringEngineFormulaGuideProps) {
  const [openKey, setOpenKey] = useState<string | null>("gmv");

  return (
    <Card className="p-4">
      <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-secondary">
        Score engine (formula v{payoutRules.score_formula_version})
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Composite = Σ(weight × sub_score) + behavior_adjustment, then clamped to{" "}
        {payoutRules.score_floor}–{payoutRules.score_ceiling}. Each sub-score is 0–1.
      </p>

      <div className="mt-3 space-y-1.5">
        {SUB_SCORES.map((sub) => {
          const weight = weights[sub.weightKey];
          const weightPct =
            typeof weight === "number" ? `${(weight * 100).toFixed(1)}%` : "—";
          const isOpen = openKey === sub.key;

          return (
            <div
              key={sub.key}
              className="overflow-hidden rounded-lg border border-glass-border"
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : sub.key)}
                className="flex w-full items-center justify-between gap-2 bg-glass-bg/40 px-3 py-2 text-left hover:bg-glass-bg/70"
              >
                <span className="font-mono text-[11px] font-semibold text-foreground">
                  {sub.label}
                </span>
                <span className="shrink-0 font-mono text-[10px] text-accent">
                  weight {weightPct} · {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen ? (
                <div className="space-y-2 border-t border-glass-border px-3 py-2">
                  <p className="font-mono text-[10px] text-muted-foreground">{sub.formula}</p>
                  <p className="text-[10px] leading-snug text-foreground">
                    <span className="font-semibold text-gain">Example: </span>
                    {sub.example}
                  </p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <p
        className={cn(
          "mt-3 rounded-lg border border-glass-border bg-glass-bg/50 px-3 py-2 font-mono text-[10px] text-muted-foreground",
        )}
      >
        Behavior penalties (velocity spikes, discount abuse, etc.) adjust the composite after
        sub-scores. Payout share uses live composite during the day; midnight{" "}
        <span className="text-accent">scores:compute-daily</span> freezes final_rank.
      </p>
    </Card>
  );
}
