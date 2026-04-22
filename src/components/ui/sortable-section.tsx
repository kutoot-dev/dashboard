"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils/cn";

interface SortableSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Wraps a dashboard card so the merchant can drag-reorder rows. The drag
 * handle is a small grip pill in the top-left of each section that's only
 * visible on hover so it never competes with content.
 */
export function SortableSection({ id, children, className }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("group/sortable relative", className)}>
      <button
        type="button"
        aria-label="Drag to reorder"
        className={cn(
          "absolute left-1 top-1 z-20 hidden h-6 w-6 cursor-grab items-center justify-center rounded-md",
          "border border-border/40 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm",
          "opacity-0 transition-opacity",
          "group-hover/sortable:flex group-hover/sortable:opacity-100",
          "focus-visible:flex focus-visible:opacity-100",
          "active:cursor-grabbing",
        )}
        {...attributes}
        {...listeners}
      >
        <span aria-hidden className="leading-none text-[11px]">⋮⋮</span>
      </button>
      {children}
    </div>
  );
}
