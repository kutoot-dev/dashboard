"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LegalDocumentModal } from "@/components/onboarding/legal-document-modal";
import { useRequiredLegalDocuments } from "@/lib/hooks/use-legal-documents";
import type { LegalDocumentSummary } from "@/lib/types";

type LegalAcceptanceBlockProps = {
  applicationId: string | null;
  merchantLocationId?: number | null;
  context?: "onboarding" | "merchant_portal";
  onCompletenessChange?: (allAccepted: boolean) => void;
};

export function LegalAcceptanceBlock({
  applicationId,
  merchantLocationId = null,
  context = "onboarding",
  onCompletenessChange,
}: LegalAcceptanceBlockProps) {
  const { data: documents = [], isLoading, isError, refetch } = useRequiredLegalDocuments(
    applicationId ?? null,
    { context },
  );
  const [activeDoc, setActiveDoc] = useState<LegalDocumentSummary | null>(null);

  // API marks accepted docs with is_required=false; show all returned docs so status updates after accept.
  const acceptedCount = documents.filter((d) => d.already_accepted).length;
  const allAccepted =
    documents.length === 0 || documents.every((d) => d.already_accepted);

  useEffect(() => {
    onCompletenessChange?.(allAccepted);
  }, [allAccepted, onCompletenessChange]);

  if (!applicationId) {
    return (
      <div className="rounded-lg border border-border p-4 text-sm text-muted-foreground">
        Save your application details first, then accept the required agreements.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Legal agreements</p>
        <p className="text-xs text-muted-foreground">
          Read each document in full and accept before submitting.{" "}
          {documents.length > 0
            ? `${acceptedCount} of ${documents.length} accepted`
            : null}
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading agreements…</p>
      ) : null}

      {isError ? (
        <div className="space-y-2">
          <p className="text-sm text-error">Could not load agreements.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {!isLoading && !isError && documents.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agreements required at this time.</p>
      ) : null}

      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-card/40 px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{doc.title}</p>
              <p className="text-xs text-muted-foreground">v{doc.version}</p>
            </div>
            {doc.already_accepted ? (
              <span className="text-xs font-medium text-success">Accepted</span>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setActiveDoc(doc)}>
                Read &amp; accept
              </Button>
            )}
          </li>
        ))}
      </ul>

      {allAccepted ? (
        <p className="text-xs text-success">All required agreements have been accepted.</p>
      ) : (
        <p className="text-xs text-muted-foreground">
          You must accept all listed agreements to submit your application.
        </p>
      )}

      <LegalDocumentModal
        open={activeDoc != null}
        document={activeDoc}
        applicationId={context === "onboarding" ? applicationId : null}
        merchantLocationId={merchantLocationId ?? (applicationId ? Number(applicationId) : null)}
        context={context}
        onClose={() => setActiveDoc(null)}
        onAccepted={() => {
          setActiveDoc(null);
          void refetch();
        }}
      />
    </div>
  );
}
