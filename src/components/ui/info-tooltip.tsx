"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils/cn";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"top" | "bottom">("top");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    // If not enough space above, show below
    setPosition(rect.top < 80 ? "bottom" : "top");
  }, [open]);

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-muted-foreground/40 text-muted-foreground text-[10px] leading-none hover:text-foreground hover:border-foreground/60 transition-colors cursor-help"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="More info"
      >
        i
      </button>

      {open && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={cn(
            "absolute z-50 max-w-[280px] rounded-md px-2 py-1.5 text-xs text-white shadow-lg",
            "transition-opacity duration-150 ease-in-out",
            "bg-[#1e293b]",
            position === "top"
              ? "bottom-full mb-1.5 left-1/2 -translate-x-1/2"
              : "top-full mt-1.5 left-1/2 -translate-x-1/2"
          )}
        >
          {text}
        </div>
      )}
    </span>
  );
}
