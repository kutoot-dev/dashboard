"use client";

import { cn } from "@/lib/utils/cn";
import { SUB_SCORE_LABELS, SUB_SCORE_ORDER, SUB_SCORE_DESCRIPTIONS } from "@/lib/constants/scoring";
import { useScoringWeights } from "@/lib/hooks/use-scoring-weights";
import { getScoringWeight } from "@/lib/utils/scoring-weights";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface ScoreRadarProps {
  scores: { key: string; value: number }[];
  className?: string;
}

function getColor(value: number): string {
  if (value > 75) return "#22c55e";
  if (value > 50) return "#f59e0b";
  if (value > 25) return "#f97316";
  return "#ef4444";
}

function getTextColor(value: number): string {
  if (value > 75) return "text-gain";
  if (value > 50) return "text-accent";
  if (value > 25) return "text-warning";
  return "text-loss";
}

/**
 * Renders scores as a polar grid / spider-ish visualisation using pure SVG.
 * Each parameter is a segment in a ring chart with weighted width.
 */
export function ScoreRadar({ scores, className }: ScoreRadarProps) {
  if (scores.length === 0) return null;
  const { weights } = useScoringWeights(SUB_SCORE_ORDER);

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 110;
  const innerR = 40;
  const totalWeight = scores.reduce(
    (sum, s) => sum + getScoringWeight(s.key, SUB_SCORE_ORDER, weights),
    0
  );

  let cumulativeAngle = -Math.PI / 2; // start from top

  const segments = scores.map((s) => {
    const weight = getScoringWeight(s.key, SUB_SCORE_ORDER, weights);
    const sweepAngle = (weight / totalWeight) * 2 * Math.PI;
    const fillR = innerR + ((outerR - innerR) * s.value) / 100;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sweepAngle;
    const midAngle = startAngle + sweepAngle / 2;
    cumulativeAngle = endAngle;

    return { ...s, weight, fillR, startAngle, endAngle, midAngle };
  });

  function polarToCartesian(angle: number, r: number) {
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  function arcPath(startAngle: number, endAngle: number, innerRadius: number, outerRadius: number): string {
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const s1 = polarToCartesian(startAngle, innerRadius);
    const s2 = polarToCartesian(endAngle, innerRadius);
    const s3 = polarToCartesian(endAngle, outerRadius);
    const s4 = polarToCartesian(startAngle, outerRadius);
    return [
      `M ${s1.x} ${s1.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${s2.x} ${s2.y}`,
      `L ${s3.x} ${s3.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${s4.x} ${s4.y}`,
      "Z",
    ].join(" ");
  }

  // Draw concentric guide rings
  const guideRings = [25, 50, 75, 100].map((pct) => ({
    r: innerR + ((outerR - innerR) * pct) / 100,
    pct,
  }));

  return (
    <div className={cn("space-y-4", className)}>
      {/* Radar SVG */}
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {/* Background ring */}
          {guideRings.map((ring) => (
            <circle
              key={ring.pct}
              cx={cx}
              cy={cy}
              r={ring.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-border"
              opacity={0.3}
            />
          ))}

          {/* Filled segments */}
          {segments.map((seg) => (
            <path
              key={seg.key}
              d={arcPath(seg.startAngle, seg.endAngle, innerR, seg.fillR)}
              fill={getColor(seg.value)}
              opacity={0.7}
              stroke="var(--glass-border)"
              strokeWidth={1}
            />
          ))}

          {/* Outer ring outline */}
          {segments.map((seg) => (
            <path
              key={`outline-${seg.key}`}
              d={arcPath(seg.startAngle, seg.endAngle, innerR, outerR)}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.5}
              className="text-border"
              opacity={0.4}
            />
          ))}

          {/* Segment dividers */}
          {segments.map((seg) => {
            const p1 = polarToCartesian(seg.startAngle, innerR);
            const p2 = polarToCartesian(seg.startAngle, outerR + 4);
            return (
              <line
                key={`div-${seg.key}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="currentColor"
                strokeWidth={0.5}
                className="text-muted-foreground"
                opacity={0.3}
              />
            );
          })}

          {/* Labels outside ring */}
          {segments.map((seg) => {
            const label = (SUB_SCORE_LABELS[seg.key] ?? seg.key).split(" ");
            const labelR = outerR + 18;
            const pt = polarToCartesian(seg.midAngle, labelR);
            const anchor = pt.x > cx + 5 ? "start" : pt.x < cx - 5 ? "end" : "middle";
            return (
              <text
                key={`label-${seg.key}`}
                x={pt.x}
                y={pt.y}
                textAnchor={anchor}
                dominantBaseline="central"
                className="fill-muted-foreground"
                fontSize={8}
                fontFamily="monospace"
              >
                {label.length > 1 ? (
                  <>
                    <tspan x={pt.x} dy="-4">{label[0]}</tspan>
                    <tspan x={pt.x} dy="10">{label.slice(1).join(" ")}</tspan>
                  </>
                ) : (
                  label[0]
                )}
              </text>
            );
          })}

          {/* Center score */}
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            className="fill-foreground"
            fontSize={18}
            fontWeight="bold"
            fontFamily="monospace"
          >
            {(scores.reduce((sum, s) => sum + s.value * getScoringWeight(s.key, SUB_SCORE_ORDER, weights), 0)).toFixed(1)}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            className="fill-muted-foreground"
            fontSize={8}
            fontFamily="monospace"
          >
            COMPOSITE
          </text>
        </svg>
      </div>

      {/* Detailed breakdown grid */}
      <div className="grid grid-cols-2 gap-2">
        {scores.map((s) => {
          const weight = getScoringWeight(s.key, SUB_SCORE_ORDER, weights);
          const weightPct = Math.round(weight * 100);
          const contribution = (s.value * weight).toFixed(1);
          return (
            <div
              key={s.key}
              className="rounded-lg border border-glass-border bg-glass-bg/30 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-medium text-foreground">
                    {SUB_SCORE_LABELS[s.key] ?? s.key}
                  </span>
                  {SUB_SCORE_DESCRIPTIONS[s.key] && (
                    <InfoTooltip text={SUB_SCORE_DESCRIPTIONS[s.key]} />
                  )}
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {weightPct}%
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className={cn("font-mono text-lg font-bold", getTextColor(s.value))}>
                  {s.value.toFixed(1)}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  / 100
                </span>
                <span className={cn("ml-auto font-mono text-[10px] font-semibold", getTextColor(s.value))}>
                  +{contribution}
                </span>
              </div>
              {/* Mini bar */}
              <div className="mt-1 h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(s.value, 100)}%`, backgroundColor: getColor(s.value) }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
