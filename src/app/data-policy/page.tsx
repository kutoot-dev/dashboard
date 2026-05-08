import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";
import { dataGovernancePolicySections } from "@/lib/legal/data-governance-policy-sections";

export const metadata: Metadata = {
  title: "Data Governance Policy — Kutoot Merchant",
  description:
    "Data Governance, Processing & Protection Policy for Kutoot Innovations Private Limited and the Kutoot merchant platform.",
};

export default function DataPolicyPage() {
  return (
    <LegalDocumentPage
      title="Data Governance, Processing & Protection Policy"
      subtitle="Kutoot Innovations Private Limited"
      sections={dataGovernancePolicySections}
    />
  );
}
