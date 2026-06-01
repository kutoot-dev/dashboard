"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { LegalDocumentSummary } from "@/lib/types";
import { collectLegalAcceptanceMetadata } from "@/lib/legal/collect-acceptance-metadata";
import {
  useAcceptLegalDocument,
  useLegalDocument,
} from "@/lib/hooks/use-legal-documents";

type LegalDocumentModalProps = {
  open: boolean;
  document: LegalDocumentSummary | null;
  applicationId: string;
  context?: "onboarding" | "merchant_portal";
  overlayClassName?: string;
  onClose: () => void;
  onAccepted: () => void;
};

export function LegalDocumentModal({
  open,
  document: docSummary,
  applicationId,
  context = "onboarding",
  overlayClassName = "z-[60]",
  onClose,
  onAccepted,
}: LegalDocumentModalProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollectingMetadata, setIsCollectingMetadata] = useState(false);

  const { data: docDetail, isLoading } = useLegalDocument(open && docSummary ? docSummary.id : null);
  const acceptMutation = useAcceptLegalDocument();

  useEffect(() => {
    if (open) {
      setScrolledToBottom(false);
      setError(null);
    }
  }, [open, docSummary?.id]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom) {
      setScrolledToBottom(true);
    }
  }, []);

  if (!open || !docSummary) {
    return null;
  }

  const requiresScroll = docSummary.requires_scroll;
  const canAccept = !requiresScroll || scrolledToBottom;

  const handleAccept = async () => {
    setError(null);
    setIsCollectingMetadata(true);
    try {
      const metadata = await collectLegalAcceptanceMetadata();
      const res = await acceptMutation.mutateAsync({
        document_id: docSummary.id,
        version: docSummary.version,
        content_hash: docSummary.content_hash,
        application_id: applicationId,
        scroll_completed: requiresScroll ? scrolledToBottom : true,
        context,
        ...metadata,
      });

      if (!res.success) {
        setError("Could not record acceptance. Please try again.");
        return;
      }

      onAccepted();
      onClose();
    } catch {
      setError("Could not record acceptance. Please try again.");
    } finally {
      setIsCollectingMetadata(false);
    }
  };

  const isSubmitting = isCollectingMetadata || acceptMutation.isPending;

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${overlayClassName}`}>
      <div
        className="absolute inset-0 bg-dark/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border/80 bg-card shadow-xl">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {docSummary.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Version {docSummary.version} — please read the full document before accepting.
          </p>
        </div>

        <div
          className="min-h-[40vh] flex-1 overflow-y-auto bg-card px-5 py-4"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading document…</p>
          ) : docDetail?.content ? (
            <div
              className="prose prose-sm max-w-none text-muted-foreground prose-headings:text-foreground"
              dangerouslySetInnerHTML={{ __html: docDetail.content }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Document unavailable.</p>
          )}
        </div>

        {error ? <p className="px-5 text-xs text-error">{error}</p> : null}

        <div className="space-y-2 border-t border-border px-5 py-4">
          <Button
            variant="primary"
            className="w-full"
            disabled={!canAccept || isSubmitting || isLoading}
            loading={isSubmitting}
            onClick={handleAccept}
          >
            I have read and accept
          </Button>
          {requiresScroll && !scrolledToBottom ? (
            <p className="text-center text-xs text-muted-foreground">
              Scroll to the bottom to enable acceptance
            </p>
          ) : null}
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
