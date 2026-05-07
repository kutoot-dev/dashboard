import { LegalDocumentPage } from "@/components/legal/legal-document-page";

const sections = [
  {
    heading: "Policy Statement",
    paragraphs: [
      "KUTOOT INNOVATION PRIVATE LIMITED DATA GOVERNANCE, PROCESSING & PROTECTION POLICY",
      "This Data Governance, Processing & Protection Policy (\"Data Policy\") is adopted and implemented by Kutoot Innovations Private Limited, a company incorporated under the laws of India, having its registered office at Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru - 560102 (\"Kutoot\", \"Company\", \"we\", \"us\", or \"our\").",
      "This Data Policy governs the internal and external handling of data processed through Kutoot Business, the Kutoot customer platform, merchant dashboards, payment systems, analytics engines, and associated infrastructure (collectively, the \"Platform\").",
    ],
  },
  {
    heading: "1. Purpose and Objective",
    bullets: [
      "This Data Policy establishes a framework for lawful collection and processing of data, secure storage and transmission, responsible data sharing and disclosure, data lifecycle management, risk mitigation, and compliance.",
      "This Policy is intended to ensure compliance with applicable laws including the Digital Personal Data Protection Act, 2023 and Information Technology Act, 2000.",
      "This Policy protects the interests of merchants, customers, and stakeholders and maintains integrity, confidentiality, and availability of data.",
    ],
  },
  {
    heading: "2. Applicability",
    bullets: [
      "This Policy applies to all data processed by Kutoot.",
      "This Policy applies to all employees, contractors, vendors, and partners.",
      "This Policy applies to all systems, applications, and databases associated with the Platform.",
      "This Policy applies irrespective of data format (digital, physical, or hybrid) and location of processing.",
    ],
  },
  {
    heading: "3. Definitions",
    bullets: [
      "Personal Data: Any data relating to an identifiable individual.",
      "Business Data: Data relating to merchant operations, transactions, performance metrics, and analytics.",
      "Sensitive Data: Financial data, KYC documents, authentication credentials, and data requiring enhanced protection.",
      "Processing: Collection, recording, storage, use, sharing, analysis, or deletion of data.",
      "Data Lifecycle: Stages through which data passes, including creation, storage, usage, archival, and deletion.",
    ],
  },
  {
    heading: "4. Data Classification Framework",
    paragraphs: [
      "Kutoot classifies data into categories and applies appropriate safeguards based on sensitivity.",
    ],
    bullets: [
      "Personal Data: Merchant personal details and authorized representative data.",
      "Financial Data: Bank account details, transaction records, and settlement data.",
      "Operational Data: Discounts created, campaign participation, walk-in and redemption data.",
      "Performance Data: Performance scores, rankings and leaderboard positions, conversion and retention metrics.",
      "Technical Data: Device identifiers, IP addresses, logs, and usage patterns.",
    ],
  },
  {
    heading: "5. Principles of Data Processing",
    bullets: [
      "Lawfulness, Fairness, and Transparency: Data shall be processed in a lawful and transparent manner.",
      "Purpose Limitation: Data shall be collected only for specified and legitimate purposes.",
      "Data Minimization: Only necessary data shall be collected and processed.",
      "Accuracy: Reasonable steps shall be taken to ensure data accuracy.",
      "Storage Limitation: Data shall not be retained longer than necessary.",
      "Integrity and Confidentiality: Appropriate security measures shall be implemented.",
    ],
  },
  {
    heading: "6. Data Collection and Processing",
    bullets: [
      "Data may be collected through merchant onboarding through Kutoot Business, platform usage and transactions, customer interactions through Kutoot, and third-party integrations including payment gateways and KYC providers.",
      "All data collection shall be authorized, logged, and traceable.",
    ],
  },
  {
    heading: "7. Data Usage and Processing",
    bullets: [
      "Data may be processed for functionality of Kutoot and Kutoot Business, payment facilitation and settlements, performance scoring and rankings, fraud detection and prevention, analytics and product improvements, and operational insights and reporting.",
      "Automated systems may be used for performance scoring, rankings and visibility, risk assessment, and fraud monitoring.",
    ],
  },
  {
    heading: "8. Performance Data Governance",
    bullets: [
      "Performance Data is a core component of Kutoot Business and related merchant systems, including scores, rankings, behavioural metrics, and performance indicators.",
      "Kutoot may aggregate and analyse such data, display performance metrics publicly, and use such data for benchmarking and insights.",
      "Performance Data shall not be treated as confidential business information when displayed as part of Platform functionality and may be used for comparative insights across merchants.",
    ],
  },
  {
    heading: "9. Data Sharing and Disclosure",
    bullets: [
      "Data may be shared with payment processors and banks, verification agencies, technology service providers, regulatory authorities, and internal teams and authorized personnel.",
      "All third-party sharing shall be contractually governed and subject to confidentiality obligations.",
    ],
  },
  {
    heading: "10. Data Storage and Localization",
    bullets: [
      "Data shall be stored in secure environments including cloud infrastructure and encrypted databases.",
      "Where required, data shall be stored within India or in compliance with applicable laws.",
    ],
  },
  {
    heading: "11. Data Security Controls",
    bullets: [
      "Technical Controls: Encryption at rest and in transit, firewalls, intrusion detection systems, and access control mechanisms.",
      "Organizational Controls: Role-based access, employee training, and confidentiality agreements.",
      "Monitoring and Auditing: Continuous monitoring and periodic audits.",
    ],
  },
  {
    heading: "12. Data Retention and Deletion",
    bullets: [
      "Data shall be retained for the duration necessary to fulfil business and legal requirements.",
      "Data may be deleted, anonymized, or archived upon expiry.",
      "Certain data may be retained for legal compliance, dispute resolution, and fraud prevention.",
    ],
  },
  {
    heading: "13. Data Breach Management",
    bullets: [
      "A data breach includes unauthorized access, disclosure, or loss of data.",
      "Kutoot shall detect and contain breaches, assess impact, notify affected stakeholders and authorities where required, and implement corrective measures.",
    ],
  },
  {
    heading: "14. Access Control and Authorization",
    bullets: [
      "Access to data shall be restricted based on role and shall be logged and monitored.",
      "Unauthorized access may result in disciplinary action and legal consequences.",
    ],
  },
  {
    heading: "15. Third-Party Data Processors",
    bullets: [
      "All third-party processors shall enter into binding agreements and comply with security and data protection standards.",
      "Kutoot may conduct due diligence before engagement.",
    ],
  },
  {
    heading: "16. Data Subject Rights Handling",
    paragraphs: [
      "Requests for access, correction, deletion, and withdrawal of consent shall be processed in accordance with applicable laws.",
    ],
  },
  {
    heading: "17. Cross-Border Data Transfer",
    bullets: [
      "Data transfers outside India shall comply with applicable legal requirements and be subject to reasonable safeguards.",
    ],
  },
  {
    heading: "18. Audit and Compliance",
    bullets: [
      "Kutoot may conduct internal audits and maintain compliance records.",
      "Non-compliance may result in disciplinary action and contractual termination.",
    ],
  },
  {
    heading: "19. Policy Enforcement",
    bullets: [
      "Violations of this Policy may result in suspension of access, termination of contracts, and legal action.",
    ],
  },
  {
    heading: "20. Amendments",
    paragraphs: [
      "Kutoot reserves the right to amend this Policy at any time. Updated versions shall become effective upon publication.",
    ],
  },
  {
    heading: "21. Governing Law",
    paragraphs: [
      "This Policy shall be governed by the laws of India.",
    ],
  },
  {
    heading: "22. Contact and Accountability",
    bullets: [
      "For data-related concerns, contact legal@kutoot.com.",
      "Company: Kutoot Innovations Private Limited.",
    ],
  },
];

export default function DataGovernancePolicyPage() {
  return (
    <LegalDocumentPage
      title="Data Governance, Processing and Protection Policy"
      subtitle="Kutoot Innovations Private Limited"
      sections={sections}
    />
  );
}
