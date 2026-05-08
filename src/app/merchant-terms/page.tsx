import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { merchantTermsSections } from "@/lib/legal/merchant-terms-sections";

export const metadata: Metadata = {
  title: "Merchant Terms and Conditions — Kutoot Business",
  description:
    "Terms and Conditions Agreement for merchants on Kutoot Business (Kutoot Innovations Private Limited).",
};

export default function MerchantTermsPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business"
      subtitle="Merchant Terms and Conditions"
      effectiveDate="07.05.2026"
      lastUpdated="07.05.2026"
      sections={merchantTermsSections}
    />
  );
}
