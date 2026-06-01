"use client";

import { useMemo, useState } from "react";
import type { LegalDocumentSummary, PendingLegalAcceptance } from "@/lib/types";
import { LegalDocumentModal } from "@/components/onboarding/legal-document-modal";
import { useLegalStatus } from "@/lib/hooks/use-legal-documents";
import { getRequiredLegalDocuments } from "@/lib/api/services/legal.service";

type LegalReacceptGateProps = {
  children: React.ReactNode;
};

export function LegalReacceptGate({ children }: LegalReacceptGateProps) {
  const { data: status, isLoading, refetch } = useLegalStatus(true);
  const pending = status?.requires_legal_acceptance ?? [];
  const [active, setActive] = useState<{
    doc: LegalDocumentSummary;
    applicationId: string;
  } | null>(null);

  const blocking = !isLoading && pending.length > 0;

  const openNext = async (item: PendingLegalAcceptance) => {
    const required = await getRequiredLegalDocuments(String(item.merchant_location_id));
    const match = required.data?.find((d) => d.id === item.document_id)
      ?? required.data?.find((d) => d.slug === item.slug);
    if (!match) {
      return;
    }
    setActive({
      doc: match,
      applicationId: String(item.merchant_location_id),
    });
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
          <ul className="mt-4 space-y-2">
            {pending.map((item) => (
              <li
                key={`${item.merchant_location_id}-${item.document_id}`}
                className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2"
              >
                <span className="text-sm text-foreground">{item.title}</span>
                <button
                  type="button"
                  className="text-sm font-medium text-accent underline"
                  onClick={() => void openNext(item)}
                >
                  Read &amp; accept
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {active ? (
        <LegalDocumentModal
          open
          document={active.doc}
          applicationId={active.applicationId}
          context="merchant_portal"
          onClose={() => setActive(null)}
          onAccepted={() => {
            setActive(null);
            void refetch();
          }}
        />
      ) : null}
      <div className="pointer-events-none opacity-30">{children}</div>
    </>
  );
}
