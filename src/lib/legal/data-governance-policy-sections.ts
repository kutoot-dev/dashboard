import type { LegalSection } from "@/components/legal/legal-document-page";

export const dataGovernancePolicySections: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      'This Data Governance, Processing & Protection Policy ("Data Policy") is adopted and implemented by:',
      'Kutoot Innovations Private Limited, a company incorporated under the laws of India, having its registered office at Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru – 560102 ("Kutoot", "Company", "we", "us", or "our").',
      'This Data Policy governs the internal and external handling of data processed through Kutoot Business, the Kutoot customer platform, merchant dashboards, payment systems, analytics engines, and associated infrastructure (collectively, the "Platform").',
    ],
  },
  {
    heading: "1. PURPOSE AND OBJECTIVE",
    subsections: [
      {
        title: "1.1",
        paragraphs: ["This Data Policy establishes a framework for:"],
        bullets: [
          "lawful collection and processing of data",
          "secure storage and transmission",
          "responsible data sharing and disclosure",
          "data lifecycle management",
          "risk mitigation and compliance",
        ],
      },
      {
        title: "1.2",
        paragraphs: ["This Policy is intended to:"],
        bullets: [
          "ensure compliance with applicable laws including the Digital Personal Data Protection Act, 2023 and Information Technology Act, 2000",
          "protect the interests of merchants, customers, and stakeholders",
          "maintain integrity, confidentiality, and availability of data",
        ],
      },
    ],
  },
  {
    heading: "2. APPLICABILITY",
    subsections: [
      {
        title: "2.1",
        paragraphs: ["This Policy applies to:"],
        bullets: [
          "all data processed by Kutoot",
          "all employees, contractors, vendors, and partners",
          "all systems, applications, and databases associated with the Platform",
        ],
      },
      {
        title: "2.2",
        paragraphs: ["This Policy applies irrespective of:"],
        bullets: ["data format (digital, physical, or hybrid)", "location of processing"],
      },
    ],
  },
  {
    heading: "3. DEFINITIONS",
    subsections: [
      {
        title: '3.1 "Personal Data"',
        paragraphs: ["Means any data relating to an identifiable individual."],
      },
      {
        title: '3.2 "Business Data"',
        paragraphs: ["Means data relating to merchant operations, transactions, performance metrics, and analytics."],
      },
      {
        title: '3.3 "Sensitive Data"',
        paragraphs: [
          "Includes financial data, KYC documents, authentication credentials, and data requiring enhanced protection.",
        ],
      },
      {
        title: '3.4 "Processing"',
        paragraphs: ["Includes collection, recording, storage, use, sharing, analysis, or deletion of data."],
      },
      {
        title: '3.5 "Data Lifecycle"',
        paragraphs: ["Means the stages through which data passes, including creation, storage, usage, archival, and deletion."],
      },
    ],
  },
  {
    heading: "4. DATA CLASSIFICATION FRAMEWORK",
    paragraphs: ["Kutoot classifies data into the following categories:"],
    subsections: [
      {
        title: "4.1 Personal Data",
        bullets: ["Merchant personal details", "Authorized representative data"],
      },
      {
        title: "4.2 Financial Data",
        bullets: ["Bank account details", "Transaction records", "Settlement data"],
      },
      {
        title: "4.3 Operational Data",
        bullets: ["Discounts created", "Campaign participation", "Walk-in and redemption data"],
      },
      {
        title: "4.4 Performance Data",
        bullets: ["Performance scores", "Rankings and leaderboard positions", "Conversion and retention metrics"],
      },
      {
        title: "4.5 Technical Data",
        bullets: ["Device identifiers", "IP addresses", "Logs and usage patterns"],
      },
    ],
    trailingParagraphs: ["Each category shall be subject to appropriate safeguards based on sensitivity."],
  },
  {
    heading: "5. PRINCIPLES OF DATA PROCESSING",
    paragraphs: ["Kutoot adheres to the following principles:"],
    subsections: [
      { title: "5.1 Lawfulness, Fairness, and Transparency", paragraphs: ["Data shall be processed in a lawful and transparent manner."] },
      { title: "5.2 Purpose Limitation", paragraphs: ["Data shall be collected only for specified and legitimate purposes."] },
      { title: "5.3 Data Minimization", paragraphs: ["Only necessary data shall be collected and processed."] },
      { title: "5.4 Accuracy", paragraphs: ["Reasonable steps shall be taken to ensure data accuracy."] },
      { title: "5.5 Storage Limitation", paragraphs: ["Data shall not be retained longer than necessary."] },
      { title: "5.6 Integrity and Confidentiality", paragraphs: ["Appropriate security measures shall be implemented."] },
    ],
  },
  {
    heading: "6. DATA COLLECTION AND PROCESSING",
    subsections: [
      {
        title: "6.1",
        paragraphs: ["Data may be collected through:"],
        bullets: [
          "merchant onboarding through Kutoot Business",
          "platform usage and transactions",
          "customer interactions through Kutoot",
          "third-party integrations including payment gateways and KYC providers",
        ],
      },
      {
        title: "6.2",
        paragraphs: ["All data collection shall be:"],
        bullets: ["authorized", "logged", "traceable"],
      },
    ],
  },
  {
    heading: "7. DATA USAGE AND PROCESSING",
    subsections: [
      {
        title: "7.1",
        paragraphs: ["Data may be processed for:"],
        bullets: [
          "functionality of Kutoot and Kutoot Business",
          "payment facilitation and settlements",
          "performance scoring and rankings",
          "fraud detection and prevention",
          "analytics and product improvements",
          "operational insights and reporting",
        ],
      },
      {
        title: "7.2",
        paragraphs: ["Automated systems may be used for:"],
        bullets: ["performance scoring", "rankings and visibility", "risk assessment", "fraud monitoring"],
      },
    ],
  },
  {
    heading: "8. PERFORMANCE DATA GOVERNANCE",
    subsections: [
      {
        title: "8.1",
        paragraphs: [
          "Performance Data is a core component of Kutoot Business and related merchant systems, including:",
        ],
        bullets: ["scores", "rankings", "behavioural metrics", "performance indicators"],
      },
      {
        title: "8.2",
        paragraphs: ["Kutoot may:"],
        bullets: ["aggregate and analyse such data", "display performance metrics publicly", "use such data for benchmarking and insights"],
      },
      {
        title: "8.3",
        paragraphs: ["Performance Data:"],
        bullets: [
          "shall not be treated as confidential business information when displayed as part of Platform functionality",
          "may be used for comparative insights across merchants",
        ],
      },
    ],
  },
  {
    heading: "9. DATA SHARING AND DISCLOSURE",
    subsections: [
      {
        title: "9.1",
        paragraphs: ["Data may be shared with:"],
        bullets: [
          "payment processors and banks",
          "verification agencies",
          "technology service providers",
          "regulatory authorities",
          "internal teams and authorized personnel",
        ],
      },
      {
        title: "9.2",
        paragraphs: ["All third-party sharing shall be:"],
        bullets: ["contractually governed", "subject to confidentiality obligations"],
      },
    ],
  },
  {
    heading: "10. DATA STORAGE AND LOCALIZATION",
    subsections: [
      {
        title: "10.1",
        paragraphs: ["Data shall be stored in secure environments including:"],
        bullets: ["cloud infrastructure", "encrypted databases"],
      },
      {
        title: "10.2",
        paragraphs: ["Where required, data shall be stored within India or in compliance with applicable laws."],
      },
    ],
  },
  {
    heading: "11. DATA SECURITY CONTROLS",
    paragraphs: ["Kutoot shall implement:"],
    subsections: [
      {
        title: "11.1 Technical Controls",
        bullets: ["encryption at rest and in transit", "firewalls and intrusion detection systems", "access control mechanisms"],
      },
      {
        title: "11.2 Organizational Controls",
        bullets: ["role-based access", "employee training", "confidentiality agreements"],
      },
      {
        title: "11.3 Monitoring and Auditing",
        bullets: ["continuous monitoring", "periodic audits"],
      },
    ],
  },
  {
    heading: "12. DATA RETENTION AND DELETION",
    subsections: [
      {
        title: "12.1",
        paragraphs: ["Data shall be retained for the duration necessary to fulfil business and legal requirements."],
      },
      {
        title: "12.2",
        paragraphs: ["Data may be:"],
        bullets: ["deleted", "anonymized", "archived upon expiry"],
      },
      {
        title: "12.3",
        paragraphs: ["Certain data may be retained for:"],
        bullets: ["legal compliance", "dispute resolution", "fraud prevention"],
      },
    ],
  },
  {
    heading: "13. DATA BREACH MANAGEMENT",
    subsections: [
      {
        title: "13.1",
        paragraphs: ["A data breach includes unauthorized access, disclosure, or loss of data."],
      },
      {
        title: "13.2",
        paragraphs: ["Kutoot shall:"],
        bullets: [
          "detect and contain breaches",
          "assess impact",
          "notify affected stakeholders and authorities where required",
          "implement corrective measures",
        ],
      },
    ],
  },
  {
    heading: "14. ACCESS CONTROL AND AUTHORIZATION",
    subsections: [
      {
        title: "14.1",
        paragraphs: ["Access to data shall be:"],
        bullets: ["restricted based on role", "logged and monitored"],
      },
      {
        title: "14.2",
        paragraphs: ["Unauthorized access may result in:"],
        bullets: ["disciplinary action", "legal consequences"],
      },
    ],
  },
  {
    heading: "15. THIRD-PARTY DATA PROCESSORS",
    subsections: [
      {
        title: "15.1",
        paragraphs: ["All third-party processors shall:"],
        bullets: ["enter into binding agreements", "comply with security and data protection standards"],
      },
      {
        title: "15.2",
        paragraphs: ["Kutoot may conduct due diligence before engagement."],
      },
    ],
  },
  {
    heading: "16. DATA SUBJECT RIGHTS HANDLING",
    paragraphs: ["Requests for:"],
    bullets: ["access", "correction", "deletion", "withdrawal of consent"],
    trailingParagraphs: ["shall be processed in accordance with applicable laws."],
  },
  {
    heading: "17. CROSS-BORDER DATA TRANSFER",
    subsections: [
      {
        title: "17.1",
        paragraphs: ["Data transfers outside India shall:"],
        bullets: ["comply with applicable legal requirements", "be subject to reasonable safeguards"],
      },
    ],
  },
  {
    heading: "18. AUDIT AND COMPLIANCE",
    subsections: [
      {
        title: "18.1",
        paragraphs: ["Kutoot may:"],
        bullets: ["conduct internal audits", "maintain compliance records"],
      },
      {
        title: "18.2",
        paragraphs: ["Non-compliance may result in:"],
        bullets: ["disciplinary action", "contractual termination"],
      },
    ],
  },
  {
    heading: "19. POLICY ENFORCEMENT",
    paragraphs: ["Violations of this Policy may result in:"],
    bullets: ["suspension of access", "termination of contracts", "legal action"],
  },
  {
    heading: "20. AMENDMENTS",
    paragraphs: [
      "Kutoot reserves the right to amend this Policy at any time.",
      "Updated versions shall become effective upon publication.",
    ],
  },
  {
    heading: "21. GOVERNING LAW",
    paragraphs: ["This Policy shall be governed by the laws of India."],
  },
  {
    heading: "22. CONTACT AND ACCOUNTABILITY",
    paragraphs: [
      "For data-related concerns:",
      "Email: legal@kutoot.com",
      "Company: Kutoot Innovations Private Limited",
    ],
  },
];
