"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import { useQueryClient } from "@tanstack/react-query";
import { getMerchantMe, updateCommission } from "@/lib/api/services/merchant.service";
import { getMerchantLegalDocumentBySlug } from "@/lib/api/services/legal.service";
import { LegalDocumentModal } from "@/components/onboarding/legal-document-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import { SUB_SCORE_ORDER } from "@/lib/constants/scoring";
import { useScoringWeights } from "@/lib/hooks/use-scoring-weights";
import { getScoringWeight } from "@/lib/utils/scoring-weights";
import { formatDecimal, formatPercent } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import type { LegalAcceptResult, LegalDocumentSummary } from "@/lib/types";

const INCENTIVE_AGREEMENT_SLUG = "merchant_incentive_agreement";

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
 *
 * Applying a change requires reading and accepting the Merchant Incentive Agreement.
 */
export function CommissionSliderCard({ className, ceiling = 100 }: CommissionSliderCardProps) {
  const qc = useQueryClient();
  const { weights } = useScoringWeights(SUB_SCORE_ORDER);
  const [me, setMe] = useState<Awaited<ReturnType<typeof getMerchantMe>>["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [incentiveAgreement, setIncentiveAgreement] = useState<LegalDocumentSummary | null>(null);
  const [loadingAgreement, setLoadingAgreement] = useState(false);
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
  const commissionWeight = getScoringWeight("commission_score", SUB_SCORE_ORDER, weights);
  const normalizedBoost = useMemo(() => {
    const spread = Math.max(0.01, max - min);
    return Math.max(0, Math.min(1, (value - min) / spread));
  }, [max, min, value]);
  const weightedInfluence = normalizedBoost * commissionWeight * 100;
  const dirty = Math.abs(value - current) > 0.001;
  const merchantLocationId = me?.id ? Number(me.id) : null;

  async function openConsentModal() {
    if (!me || submitting || !dirty) return;

    setError(null);

    if (incentiveAgreement) {
      setConsentOpen(true);
      return;
    }

    setLoadingAgreement(true);
    try {
      const res = await getMerchantLegalDocumentBySlug(INCENTIVE_AGREEMENT_SLUG);
      if (!res.success || !res.data) {
        setError("Unable to load the Merchant Incentive Agreement. Please try again.");
        return;
      }

      setIncentiveAgreement(res.data);
      setConsentOpen(true);
    } catch {
      setError("Unable to load the Merchant Incentive Agreement. Please try again.");
    } finally {
      setLoadingAgreement(false);
    }
  }

  async function applyWithConsent(acceptance?: LegalAcceptResult) {
    if (!me || submitting || !dirty) return;

    if (!acceptance?.acceptance_id) {
      setError("Agreement acceptance is required before applying Growth Boost changes.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await updateCommission(Number(value.toFixed(2)), acceptance.acceptance_id);
      if (!res.success) {
        setError(res.error?.message ?? "Failed to update commission.");
        return;
      }
      setMe({
        ...me,
        commission_percentage: res.data.commission_percentage,
      });
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
    <>
      <div ref={confettiRef} className={cn("glass-card p-4 space-y-3", className)}>
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Growth Boost
          </h3>
          <InfoTooltip text="Set your commission between your category minimum and 100%. Score impact is calculated from real backend scoring after you apply changes. You must read and accept the Merchant Incentive Agreement each time you apply a change." />
        </div>

        <div className="flex items-baseline justify-between">
          <div>
            <p className="font-mono text-3xl font-bold text-accent">
              {formatPercent(value)}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              currently {formatPercent(current)} · min {formatPercent(min)} · max {formatPercent(max)}
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
            Commission drives <span className="font-mono font-semibold">{formatPercent(commissionWeight * 100)}</span> of total score.
            Current boost level: <span className="font-mono font-semibold text-accent">{formatDecimal(weightedInfluence)} / {formatDecimal(commissionWeight * 100)}</span> score-share potential.
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
            <span>{formatPercent(min)}</span>
            <span>{formatPercent((min + max) / 2)}</span>
            <span>{formatPercent(max)}</span>
          </div>
        </div>

        {error && (
          <p className="font-mono text-[10px] text-loss">{error}</p>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={() => void openConsentModal()}
            disabled={!dirty || submitting || loadingAgreement}
            loading={submitting || loadingAgreement}
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
              disabled={submitting || loadingAgreement}
              className="rounded-md border border-border/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
            >
              Reset
            </button>
          )}
        </div>

        {dirty ? (
          <p className="text-[10px] text-muted-foreground">
            Applying a change requires reading the Merchant Incentive Agreement and confirming consent after scrolling to the end.
          </p>
        ) : null}
      </div>

      <LegalDocumentModal
        open={consentOpen}
        document={incentiveAgreement}
        merchantLocationId={merchantLocationId}
        context="growth_boost"
        overlayClassName="z-[70]"
        acceptLabel="I agree and apply commission change"
        onClose={() => setConsentOpen(false)}
        onAccepted={(result) => {
          setConsentOpen(false);
          void applyWithConsent(result);
        }}
      />
    </>
  );
}
