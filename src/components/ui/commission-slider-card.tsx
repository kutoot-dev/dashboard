"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";
import { getMerchantMe, updateCommission } from "@/lib/api/services/merchant.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SUB_SCORE_WEIGHTS } from "@/lib/constants/scoring";
import { cn } from "@/lib/utils/cn";

interface CommissionSliderCardProps {
  className?: string;
  /** Absolute cap for the slider (default 100%). */
  ceiling?: number;
}

/**
 * Commission slider — lets the merchant contribute a higher platform commission
 * in exchange for a projected score boost. Uses an optimistic PATCH and fires a
 * confetti burst when the new commission is accepted by the backend.
 *
 * The slider is bounded by the category minimum (fetched from /merchant/me) and
 * a configurable ceiling. Commits happen on explicit "Apply" to avoid chatter
 * on the backend; the slider itself is debounced for the projected-score hint.
 */
export function CommissionSliderCard({ className, ceiling = 100 }: CommissionSliderCardProps) {
  const qc = useQueryClient();
  const [me, setMe] = useState<Awaited<ReturnType<typeof getMerchantMe>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confettiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    getMerchantMe()
      .then((res) => {
        if (!active || !res.success) return;
        setMe(res.data);
        setValue(Number(res.data.commission_percentage ?? res.data.category_min_commission ?? 0));
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load commission settings.");
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const min = Number(me?.category_min_commission ?? 0);
  const max = Math.max(min, ceiling);
  const current = Number(me?.commission_percentage ?? min);
  const commissionWeight = Number(SUB_SCORE_WEIGHTS.commission_score ?? 0.2);
  const normalizedBoost = useMemo(() => {
    const spread = Math.max(0.01, max - min);
    return Math.max(0, Math.min(1, (value - min) / spread));
  }, [max, min, value]);
  const weightedInfluence = normalizedBoost * commissionWeight * 100;
  const dirty = Math.abs(value - current) > 0.001;

  async function apply() {
    if (!me || submitting || !dirty) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await updateCommission(Number(value.toFixed(2)));
      if (!res.success) {
        setError(res.error?.message ?? "Failed to update commission.");
        return;
      }
      setMe({
        ...me,
        commission_percentage: res.data.commission_percentage,
      });
      // Confetti burst — constrained to the card origin when available.
      const origin = confettiRef.current?.getBoundingClientRect();
      confetti({
        particleCount: 80,
        spread: 70,
        startVelocity: 35,
        origin: origin
          ? {
              x: (origin.left + origin.width / 2) / window.innerWidth,
              y: (origin.top + origin.height / 2) / window.innerHeight,
            }
          : undefined,
      });

      // Refetch downstream queries (dashboard KPIs, merchant /me, etc.)
      qc.invalidateQueries({ queryKey: ["merchant", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["merchant", "me"] });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update commission.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className={cn("glass-card p-4", className)}>
        <Skeleton variant="rect" className="h-32" />
      </div>
    );
  }

  if (!me) {
    return (
      <div className={cn("glass-card p-4 text-sm text-muted-foreground", className)}>
        {error ?? "Commission controls unavailable."}
      </div>
    );
  }

  return (
    <div ref={confettiRef} className={cn("glass-card p-4 space-y-3", className)}>
      <div className="flex items-center gap-2">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Growth Boost
        </h3>
        <InfoTooltip text="Set your commission between your category minimum and 100%. Score impact is calculated from real backend scoring after you apply changes." />
      </div>

      <div className="flex items-baseline justify-between">
        <div>
          <p className="font-mono text-3xl font-bold text-accent">
            {value.toFixed(2)}
            <span className="ml-1 text-base text-muted-foreground">%</span>
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            currently {current.toFixed(2)}% · min {min.toFixed(2)}% · max {max.toFixed(2)}%
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[10px] uppercase text-muted-foreground tracking-widest">
            Real impact
          </p>
          <p className="font-mono text-[11px] text-muted-foreground">
            Updates after Apply
          </p>
        </div>
      </div>

      <div className="rounded-md border border-accent/30 bg-accent/5 px-3 py-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
          Growth value
        </p>
        <p className="mt-1 text-xs text-foreground">
          Commission drives <span className="font-mono font-semibold">{Math.round(commissionWeight * 100)}%</span> of total score.
          Current boost level: <span className="font-mono font-semibold text-accent">{weightedInfluence.toFixed(1)} / {(commissionWeight * 100).toFixed(0)}</span> score-share potential.
        </p>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={0.25}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="w-full accent-accent"
          aria-label="Commission percentage"
        />
        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
          <span>{min.toFixed(2)}%</span>
          <span>{((min + max) / 2).toFixed(2)}%</span>
          <span>{max.toFixed(2)}%</span>
        </div>
      </div>

      {error && (
        <p className="font-mono text-[10px] text-loss">{error}</p>
      )}

      <div className="flex items-center gap-2">
        <Button
          onClick={apply}
          disabled={!dirty || submitting}
          loading={submitting}
          className={cn(
            "flex-1",
            dirty ? "bg-accent text-accent-foreground hover:bg-accent/90" : "",
          )}
        >
          {dirty ? "Apply new commission" : "No change"}
        </Button>
        {dirty && (
          <button
            type="button"
            onClick={() => setValue(current)}
            disabled={submitting}
            className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
