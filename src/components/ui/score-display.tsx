"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

interface ScoreDisplayProps {
  score: number;
  change?: number;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-3xl",
  lg: "text-5xl",
};

const changeSizeClasses = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function ScoreDisplay({ score, change, size = "md" }: ScoreDisplayProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const start = displayScore;
    const end = score;
    const duration = 600;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(start + (end - start) * eased);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  return (
    <div className="flex items-baseline gap-2">
      <span className={cn("font-mono font-bold font-tabular text-foreground", sizeClasses[size])}>
        {displayScore.toFixed(1)}
      </span>
      {change !== undefined && change !== 0 && (
        <span
          className={cn(
            "flex items-center gap-0.5 font-mono font-tabular",
            changeSizeClasses[size],
            change > 0 ? "text-gain" : "text-loss"
          )}
        >
          <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor">
            {change > 0 ? (
              <path d="M6 2l4 5H2z" />
            ) : (
              <path d="M6 10L2 5h8z" />
            )}
          </svg>
          {Math.abs(change).toFixed(1)}
        </span>
      )}
    </div>
  );
}
