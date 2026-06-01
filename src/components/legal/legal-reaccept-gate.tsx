"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { LegalDocumentSummary, PendingLegalAcceptance } from "@/lib/types";
import { LegalDocumentModal } from "@/components/onboarding/legal-document-modal";
import { useLegalStatus } from "@/lib/hooks/use-legal-documents";
import {
  getLegalDocument,
  getRequiredLegalDocuments,
} from "@/lib/api/services/legal.service";

type LegalReacceptGateProps = {
  children: React.ReactNode;
};

export function LegalReacceptGate({ children }: LegalReacceptGateProps) {
  const { data: status, isLoading, refetch } = useLegalStatus(true);
  const pending = status?.requires_legal_acceptance ?? [];
  const [active, setActive] = useState<{
    doc: LegalDocumentSummary;
    merchantLocationId: number;
  } | null>(null);
  const [openingKey, setOpeningKey] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);

  const blocking = !isLoading && pending.length > 0;

  const openNext = async (item: PendingLegalAcceptance) => {
    const itemKey = `${item.merchant_location_id}-${item.document_id}`;
    setOpenError(null);
    setOpeningKey(itemKey);

    try {
      const required = await getRequiredLegalDocuments(String(item.merchant_location_id), {
        context: "merchant_portal",
      });
      let match =
        required.data?.find((d) => d.id === item.document_id) ??
        required.data?.find((d) => d.slug === item.slug);

      if (!match) {
        const detail = await getLegalDocument(item.document_id);
        if (detail.success && detail.data) {
          match = detail.data;
        }
      }

      if (!match) {
        setOpenError("Could not load this agreement. Please refresh and try again.");
        return;
      }

      setActive({
        doc: match,
        merchantLocationId: item.merchant_location_id,
      });
    } catch {
      setOpenError("Could not load this agreement. Please check your connection and try again.");
    } finally {
      setOpeningKey(null);
    }
  };

  const headline = useMemo(() => {
    if (pending.length === 1) {
      return pending[0]?.title ?? "Updated agreement";
    }
    return `${pending.length} agreements require your acceptance`;
  }, [pending]);

  if (!blocking) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-dark/90 p-4 backdrop-blur-md">
        <div className="glass-card w-full max-w-lg rounded-2xl border border-border p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">Action required</h2>
          <p className="mt-2 text-sm text-muted-foreground">{headline}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Please read each document in full and accept to continue using the merchant portal.
          </p>
          {openError ? (
            <p className="mt-3 text-sm text-error" role="alert">
              {openError}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {pending.map((item) => {
              const itemKey = `${item.merchant_location_id}-${item.document_id}`;
              const isOpening = openingKey === itemKey;

              return (
                <li
                  key={itemKey}
                  className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
                >
                  <span className="text-sm text-foreground">{item.title}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    loading={isOpening}
                    disabled={openingKey != null}
                    onClick={() => void openNext(item)}
                  >
                    Read &amp; accept
                  </Button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {active ? (
        <LegalDocumentModal
          open
          document={active.doc}
          merchantLocationId={active.merchantLocationId}
          context="merchant_portal"
          overlayClassName="z-[80]"
          onClose={() => setActive(null)}
          onAccepted={() => {
            setActive(null);
            void refetch();
          }}
        />
      ) : null}
    </>
  );
}
