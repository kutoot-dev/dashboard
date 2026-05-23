"use client";

interface ImprovementModalProps {
  label: string;
  recommendation: string;
  example: string;
  onClose: () => void;
}

/**
 * Full-screen overlay on mobile (bottom sheet) and centered dialog on larger screens.
 */
export function ImprovementModal({
  label,
  recommendation,
  example,
  onClose,
}: ImprovementModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-dark/72 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="improvement-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[min(88vh,640px)] w-full overflow-y-auto rounded-t-2xl border border-accent/35 bg-card-solid p-4 shadow-[0_24px_60px_rgba(4,8,26,0.56)] sm:max-w-xl sm:rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 hidden h-1 w-10 rounded-full bg-border/80 sm:hidden" aria-hidden />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p id="improvement-modal-title" className="text-sm font-semibold text-accent">
              How to improve: {label}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{recommendation}</p>
            <p className="mt-2 rounded-md border border-border/80 bg-muted/55 px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
              {example}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md border border-border/80 px-3 py-2 text-xs text-foreground transition-colors touch-manipulation hover:bg-card-hover"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
