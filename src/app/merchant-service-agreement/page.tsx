import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { merchantServiceAgreementSections } from "@/lib/legal/merchant-service-agreement-sections";

export const metadata: Metadata = {
  title: "Merchant Service Agreement — Kutoot Business",
  description:
    "Commercial service agreement for merchants on Kutoot Business covering commissions, settlements, and platform fees.",
};

export default function MerchantServiceAgreementPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business"
      subtitle="Merchant Service Agreement"
      effectiveDate="07.05.2026"
      lastUpdated="07.05.2026"
      sections={merchantServiceAgreementSections}
    />
  );
}
