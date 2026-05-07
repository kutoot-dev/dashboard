import { LegalDocumentPage } from "@/components/legal/legal-document-page";

const sections = [
  {
    heading: "Introduction",
    paragraphs: [
      "Kutoot Innovations Private Limited (\"Kutoot\", \"we\", \"our\", or \"us\") values the privacy and trust of merchants using Kutoot Business.",
      "This Privacy Policy explains how we collect, use, store, process, and protect information shared by merchants, business representatives, and platform users (\"you\" or \"your\") while using Kutoot Business, including the merchant dashboard, website, QR systems, payment-linked systems, campaigns, analytics tools, and related merchant services (collectively, the \"Platform\").",
      "By registering, onboarding, or using Kutoot Business, you agree to this Privacy Policy.",
    ],
  },
  {
    heading: "1. Purpose of This Policy",
    paragraphs: [
      "This Policy is published in accordance with applicable Indian laws, including:",
    ],
    bullets: [
      "Digital Personal Data Protection Act, 2023",
      "Information Technology Act, 2000",
      "Applicable rules and regulations related to digital services and data protection",
    ],
  },
  {
    heading: "2. Information We Collect",
    paragraphs: [
      "This Policy applies to all merchant-related data processed by Kutoot.",
    ],
  },
  {
    heading: "2.1 Merchant & Business Information",
    paragraphs: ["We may collect:"],
    bullets: [
      "Merchant name",
      "Business/store name",
      "Phone number",
      "Email address",
      "Business address",
      "GST details",
      "Business registration details",
      "Authorized representative information",
    ],
  },
  {
    heading: "2.2 KYC & Verification Information",
    paragraphs: ["For onboarding and compliance purposes, we may collect:"],
    bullets: [
      "PAN Card",
      "Aadhaar Card",
      "GST Certificate",
      "Shop License",
      "Business Registration Proof",
      "Bank Account Details",
      "Cancelled Cheque",
      "Other compliance-related documents",
    ],
  },
  {
    heading: "2.3 Transaction & Platform Information",
    paragraphs: ["We may collect:"],
    bullets: [
      "Transaction records",
      "Payment activity",
      "Settlement details",
      "Refunds and reversals",
      "Reward activity",
      "Merchant rankings and performance metrics",
      "Customer engagement activity",
    ],
  },
  {
    heading: "2.4 Device & Technical Information",
    paragraphs: ["We may collect:"],
    bullets: [
      "IP address",
      "Device information",
      "Operating system",
      "Browser type",
      "App version",
      "Usage logs",
      "Analytics data",
    ],
  },
  {
    heading: "3. How We Use Information",
    paragraphs: ["Kutoot may use collected information to:"],
    bullets: [
      "Onboard and verify merchants",
      "Process transactions and settlements",
      "Manage campaigns and rewards",
      "Operate scoring and ranking systems",
      "Provide analytics and dashboard insights",
      "Improve platform performance",
      "Detect fraud and suspicious activity",
      "Communicate service updates",
      "Provide customer support",
      "Comply with legal and regulatory obligations",
    ],
  },
  {
    heading: "4. Merchant Rankings & Performance Data",
    paragraphs: [
      "Kutoot may display certain merchant-related business information on the Platform, including:",
    ],
    bullets: [
      "Merchant rankings",
      "Performance scores",
      "Badges and tiers",
      "Leaderboard positions",
      "Campaign performance indicators",
      "Customer engagement insights",
    ],
  },
  {
    heading: "4. Merchant Rankings & Performance Data (Visibility)",
    paragraphs: ["Such information may be visible to:"],
    bullets: ["Customers", "Other merchants", "Platform users"],
  },
  {
    heading: "4. Merchant Rankings & Performance Data (Disclosures)",
    paragraphs: [
      "Rankings, scores, analytics, and visibility indicators are system-generated and may change dynamically based on platform activity, merchant performance, and operational calculations.",
      "Kutoot does not publicly display sensitive personal information unless required by law or explicitly permitted.",
    ],
  },
  {
    heading: "5. Data Sharing & Disclosure",
    paragraphs: ["Kutoot may share information with:"],
  },
  {
    heading: "5.1 Service Providers",
    paragraphs: ["Including:"],
    bullets: [
      "Payment gateways",
      "Banks and financial partners",
      "Cloud hosting providers",
      "Analytics providers",
      "KYC verification partners",
      "Communication service providers",
    ],
  },
  {
    heading: "5.2 Legal & Regulatory Authorities",
    paragraphs: [
      "Where required under applicable law, regulation, court order, or government request.",
    ],
  },
  {
    heading: "5.3 Business Operations",
    paragraphs: [
      "Kutoot may share limited information with affiliates or operational partners for platform management and service delivery.",
      "Kutoot does not sell merchant personal data to third parties.",
    ],
  },
  {
    heading: "6. Aggregated & Analytics Data",
    paragraphs: [
      "Kutoot may use aggregated, anonymized, or non-personal business data for:",
    ],
    bullets: [
      "Analytics",
      "Benchmarking",
      "Fraud prevention",
      "Operational insights",
      "Platform improvements",
      "Reporting and research",
    ],
  },
  {
    heading: "6. Aggregated & Analytics Data (Clarification)",
    paragraphs: [
      "Such data does not directly identify individual merchants or customers.",
    ],
  },
  {
    heading: "7. Data Retention",
    paragraphs: ["Kutoot retains information only for as long as necessary to:"],
    bullets: [
      "Provide platform services",
      "Complete settlements and payouts",
      "Comply with legal obligations",
      "Resolve disputes",
      "Enforce agreements",
      "Prevent fraud and abuse",
    ],
  },
  {
    heading: "7. Data Retention (Legal Records)",
    paragraphs: [
      "Certain financial, tax, and compliance records may be retained as required by law.",
    ],
  },
  {
    heading: "8. Data Security",
    paragraphs: [
      "Kutoot uses reasonable security practices and protection measures, including:",
    ],
    bullets: [
      "Encrypted systems",
      "Access controls",
      "Secure infrastructure",
      "Authentication measures",
      "Internal security procedures",
    ],
  },
  {
    heading: "8. Data Security (Disclaimer)",
    paragraphs: [
      "While we work to protect information, no digital platform can guarantee complete security.",
    ],
  },
  {
    heading: "9. Merchant Rights",
    paragraphs: ["Subject to applicable law, merchants may request to:"],
    bullets: [
      "Access their information",
      "Update inaccurate information",
      "Correct incomplete information",
      "Withdraw consent where applicable",
      "Request deletion of certain data",
      "Raise privacy-related concerns",
    ],
  },
  {
    heading: "9. Merchant Rights (Limitations)",
    paragraphs: [
      "Some requests may be limited where retention is required for legal, compliance, fraud prevention, or operational purposes.",
    ],
  },
  {
    heading: "10. Withdrawal of Consent",
    paragraphs: [
      "Merchants may withdraw consent for certain data processing activities where legally permitted.",
      "Withdrawal of consent may affect access to certain platform features or services.",
    ],
  },
  {
    heading: "11. Cookies & Tracking Technologies",
    paragraphs: [
      "Kutoot may use cookies and similar technologies to:",
    ],
    bullets: [
      "Improve user experience",
      "Remember preferences",
      "Analyze usage patterns",
      "Enhance platform performance",
    ],
  },
  {
    heading: "11. Cookies & Tracking Technologies (Controls)",
    paragraphs: [
      "Users may manage cookie settings through their browser or device settings.",
    ],
  },
  {
    heading: "12. Fraud Prevention & Monitoring",
    paragraphs: ["Kutoot may monitor platform activity to:"],
    bullets: [
      "Detect suspicious transactions",
      "Prevent fake activity",
      "Identify fraud risks",
      "Protect merchants and customers",
      "Maintain platform security",
    ],
  },
  {
    heading: "12. Fraud Prevention & Monitoring (Actions)",
    paragraphs: [
      "Fraud investigations may involve temporary restrictions, payout holds, or account reviews.",
    ],
  },
  {
    heading: "13. Third-Party Services",
    paragraphs: [
      "The Platform may include integrations with third-party services.",
      "Kutoot is not responsible for:",
    ],
    bullets: [
      "Third-party websites",
      "External payment systems",
      "External platform downtime",
      "Third-party privacy practices",
    ],
  },
  {
    heading: "13. Third-Party Services (External Terms)",
    paragraphs: [
      "Use of third-party services may be subject to their own terms and privacy policies.",
    ],
  },
  {
    heading: "14. Cross-Border Data Transfers",
    paragraphs: [
      "Where necessary, information may be processed or stored outside India in accordance with applicable laws.",
      "Kutoot shall implement reasonable safeguards for such transfers.",
    ],
  },
  {
    heading: "15. Children's Privacy",
    paragraphs: [
      "The Platform is intended only for individuals above 18 years of age.",
      "Kutoot does not knowingly collect personal information from minors.",
    ],
  },
  {
    heading: "16. Data Breach Response",
    paragraphs: [
      "In the event of a data breach, Kutoot may take appropriate steps to:",
    ],
    bullets: [
      "Contain and investigate the issue",
      "Reduce potential impact",
      "Notify affected parties where required by law",
      "Comply with applicable legal obligations",
    ],
  },
  {
    heading: "17. Updates to This Policy",
    paragraphs: [
      "Kutoot may update this Privacy Policy from time to time.",
      "Updated versions may be published through Kutoot Business, the website, or other official communication channels.",
      "Continued use of the Platform after updates constitutes acceptance of the revised Policy.",
    ],
  },
  {
    heading: "18. Governing Law",
    paragraphs: [
      "This Privacy Policy shall be governed by the laws of India.",
      "Courts located in Bengaluru, Karnataka shall have jurisdiction over matters related to this Policy.",
    ],
  },
  {
    heading: "19. Contact Information",
    paragraphs: [
      "For questions, support, or privacy-related concerns, please contact:",
      "Kutoot Innovations Private Limited",
      "Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru - 560102",
      "Support: support@kutoot.com",
      "Legal: legal@kutoot.com",
      "Website: www.kutoot.com",
    ],
  },
  {
    heading: "20. Grievance Redressal",
    paragraphs: [
      "In accordance with applicable law, merchants may contact the Grievance Officer for concerns related to:",
    ],
    bullets: [
      "Privacy",
      "Data usage",
      "Account information",
      "Platform-related complaints",
    ],
  },
  {
    heading: "20. Grievance Officer Details",
    paragraphs: [
      "Name: Mr. Arun Kumar",
      "Phone: +91 72597 77622",
      "Company: Kutoot Innovations Private Limited",
      "Email: legal@kutoot.com",
      "Kutoot will make reasonable efforts to acknowledge and resolve grievances within timelines required under applicable law.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business Privacy Policy"
      subtitle="Kutoot Innovations Private Limited"
      effectiveDate="06.05.2026"
      lastUpdated="06.05.2026"
      sections={sections}
    />
  );
}
