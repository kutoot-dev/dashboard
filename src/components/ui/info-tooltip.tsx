"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

interface InfoTooltipProps {
  text: string;
  className?: string;
}

export function InfoTooltip({ text, className }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; position: "top" | "bottom" }>({
    top: 0,
    left: 0,
    position: "top",
  });
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
    const showBelow = rect.top < 80;
    setCoords({
      top: showBelow ? rect.bottom + 6 : rect.top - 6,
      left: rect.left + rect.width / 2,
      position: showBelow ? "bottom" : "top",
    });
  }, [open]);

  return (
    <span className={cn("inline-flex items-center", className)}>
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

      {open &&
        createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: coords.position === "top" ? undefined : coords.top,
              bottom:
                coords.position === "top"
                  ? `${window.innerHeight - coords.top}px`
                  : undefined,
              left: coords.left,
              transform: "translateX(-50%)",
            }}
            className={cn(
              "z-[9999] max-w-[280px] rounded-md px-2 py-1.5 text-xs text-white shadow-lg pointer-events-auto",
              "transition-opacity duration-150 ease-in-out",
              "bg-[#1e293b]"
            )}
          >
            {text}
          </div>,
          document.body,
        )}
    </span>
  );
}
