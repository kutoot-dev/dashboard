"use client";

import { useMemo, useState } from "react";
import type { ScoringEngineOverview } from "@/lib/api/services/scoring-engine.service";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

interface ScoringEngineConfigProps {
  config: ScoringEngineOverview["config"];
  payoutRules: ScoringEngineOverview["payout_rules"];
}

function formatValue(value: string | number | boolean | null): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "number") {
    return Number.isInteger(value) ? String(value) : value.toFixed(4).replace(/\.?0+$/, "");
  }
  return String(value);
}

export function ScoringEngineConfig({ config, payoutRules }: ScoringEngineConfigProps) {
  const [openGroup, setOpenGroup] = useState<string | null>("Payout");
  const [filter, setFilter] = useState("");

  const weightEntries = useMemo(
    () =>
      Object.entries(config.weights).map(([key, value]) => ({
        key,
        label: key.replace(/_/g, " "),
        pct: (value * 100).toFixed(1),
      })),
    [config.weights],
  );

  const filteredGroups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return config.groups;

    return config.groups
      .map((g) => ({
        ...g,
        parameters: g.parameters.filter(
          (p) =>
            p.key.toLowerCase().includes(q) ||
            p.label.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.parameters.length > 0);
  }, [config.groups, filter]);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          Live payout rules (DB)
        </h3>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          {[
            ["Platform fee", `${payoutRules.platform_fee_percentage}% (${payoutRules.platform_fee_mode})`],
            ["Bonus pool % of fee", `${payoutRules.merchant_bonus_pool_percentage}%`],
            ["Min score for payout", String(payoutRules.payout_min_score_threshold)],
            ["Max branch share", `${(payoutRules.payout_max_single_branch_share * 100).toFixed(0)}%`],
            ["Formula version", `v${payoutRules.score_formula_version}`],
            ["Score floor / ceiling", `${payoutRules.score_floor} / ${payoutRules.score_ceiling}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-glass-border bg-glass-bg/50 px-3 py-2">
              <dt className="text-[10px] text-muted-foreground">{label}</dt>
              <dd className="font-mono text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="p-4">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-secondary">
          Composite weights (normalized)
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {weightEntries.map((w) => (
            <span
              key={w.key}
              className="rounded-full border border-secondary/30 bg-secondary/10 px-2.5 py-1 font-mono text-[10px] text-foreground"
            >
              {w.label} {w.pct}%
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
            All scoring parameters
          </h3>
          <input
            type="search"
            placeholder="Filter keys…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-8 w-full max-w-xs rounded-lg border border-glass-border bg-glass-bg px-3 font-mono text-xs text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="mt-3 space-y-2">
          {filteredGroups.map((group) => {
            const isOpen = openGroup === group.group;
            return (
              <div
                key={group.group}
                className="overflow-hidden rounded-xl border border-glass-border"
              >
                <button
                  type="button"
                  onClick={() => setOpenGroup(isOpen ? null : group.group)}
                  className="flex w-full items-center justify-between bg-card/50 px-3 py-2.5 text-left transition-colors hover:bg-card-hover/60"
                >
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {group.group}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {group.parameters.length} · {isOpen ? "−" : "+"}
                  </span>
                </button>
                {isOpen ? (
                  <div className="divide-y divide-border/50 border-t border-glass-border">
                    {group.parameters.map((param) => (
                      <div key={param.key} className="grid gap-1 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <div>
                          <p className="font-mono text-[11px] font-semibold text-accent">
                            {param.label}
                          </p>
                          <p className="font-mono text-[10px] text-muted-foreground">{param.key}</p>
                          {param.description ? (
                            <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                              {param.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right sm:pl-4">
                          <p className="font-mono text-sm font-semibold text-gain">
                            {formatValue(param.value)}
                          </p>
                          {param.unit ? (
                            <p className="font-mono text-[9px] text-muted-foreground">{param.unit}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
