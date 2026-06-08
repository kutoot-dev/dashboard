import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { merchantIncentiveAgreementSections } from "@/lib/legal/merchant-incentive-agreement-sections";

export const metadata: Metadata = {
  title: "Merchant Incentive Agreement — Kutoot Business",
  description:
    "Agreement governing Growth Boost commission changes and merchant incentive programs on Kutoot Business.",
};

export default function MerchantIncentiveAgreementPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business"
      subtitle="Merchant Incentive Agreement"
      effectiveDate="08.06.2026"
      lastUpdated="08.06.2026"
      sections={merchantIncentiveAgreementSections}
    />
  );
}
