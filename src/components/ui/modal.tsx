"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { faXmark } from "@/lib/icons";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Constrain height and scroll body content (useful for long forms). */
  scrollable?: boolean;
  maxWidthClass?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  scrollable = false,
  maxWidthClass = "max-w-lg",
}: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-dark/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className={`glass-card relative z-10 flex w-full flex-col rounded-2xl border border-border/80 p-6 ${maxWidthClass} ${
              scrollable ? "max-h-[min(90vh,48rem)]" : ""
            }`}
          >
            {/* Header */}
            <div className="mb-4 flex shrink-0 items-center justify-between">
              <h2 className="font-display text-lg font-bold text-foreground">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card-hover hover:text-foreground"
                aria-label="Close"
              >
                <Icon icon={faXmark} className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div
              className={
                scrollable
                  ? "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 -mr-1"
                  : undefined
              }
            >
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
