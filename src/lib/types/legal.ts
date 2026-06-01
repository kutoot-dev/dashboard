export interface LegalDocumentSummary {
  id: number;
  slug: string;
  title: string;
  version: string;
  content_hash: string;
  requires_scroll: boolean;
  already_accepted: boolean;
  is_required: boolean;
  published_at?: string | null;
}

export interface LegalDocumentDetail extends LegalDocumentSummary {
  content: string;
}

export interface LegalAcceptResult {
  acceptance_id: number;
  document_id: number;
  slug: string;
  version: string;
  accepted_at: string;
}

export interface PendingLegalAcceptance {
  slug: string;
  document_id: number;
  title: string;
  version: string;
  merchant_location_id: number;
}

export interface LegalStatusResponse {
  requires_legal_acceptance: PendingLegalAcceptance[];
  all_accepted: boolean;
}
