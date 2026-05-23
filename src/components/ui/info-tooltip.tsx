"use client";

import { useState, useRef, useEffect, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

interface InfoTooltipProps {
  text: string;
  className?: string;
  /** Accessible name for the trigger button */
  label?: string;
  size?: "sm" | "md";
  iconClassName?: string;
}

function HelpIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function InfoTooltip({
  text,
  className,
  label = "How this is calculated",
  size = "md",
  iconClassName,
}: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; position: "top" | "bottom" }>({
    top: 0,
    left: 0,
    position: "top",
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const hitSize = size === "sm" ? "h-6 w-6" : "h-7 w-7";

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: globalThis.MouseEvent) {
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
    const showBelow = rect.top < 100;
    setCoords({
      top: showBelow ? rect.bottom + 8 : rect.top - 8,
      left: rect.left + rect.width / 2,
      position: showBelow ? "bottom" : "top",
    });
  }, [open]);

  function stopBubble(e: ReactMouseEvent) {
    e.stopPropagation();
  }

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors",
          "hover:bg-muted/60 hover:text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45",
          hitSize,
        )}
        aria-label={label}
        aria-expanded={open}
        onPointerDown={stopBubble}
        onClick={(e) => {
          stopBubble(e);
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        <HelpIcon className={cn(iconSize, iconClassName)} />
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
              "z-[9999] max-w-[min(320px,calc(100vw-2rem))] rounded-lg px-3 py-2 text-xs leading-relaxed text-white shadow-xl",
              "pointer-events-none border border-white/10 bg-slate-900/95 backdrop-blur-sm",
            )}
            onPointerDown={stopBubble}
          >
            {text}
          </div>,
          document.body,
        )}
    </span>
  );
}
