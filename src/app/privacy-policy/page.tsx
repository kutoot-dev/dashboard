import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const metadata: Metadata = {
  title: "Privacy Policy — Kutoot Business",
  description:
    "How Kutoot Innovations Private Limited collects, uses, and protects merchant data on Kutoot Business.",
};

const sections = [
  {
    heading: "Introduction",
    paragraphs: [
      'Kutoot Innovations Private Limited ("Kutoot", "we", "our", or "us") values the privacy and trust of merchants using Kutoot Business.',
      'This Privacy Policy explains how we collect, use, store, process, and protect information shared by merchants, business representatives, and platform users ("you" or "your") while using Kutoot Business, including the merchant dashboard, website, QR systems, payment-linked systems, campaigns, analytics tools, and related merchant services (collectively, the "Platform").',
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
    trailingParagraphs: ["This Policy applies to all merchant-related data processed by Kutoot."],
  },
  {
    heading: "2. Information We Collect",
    subsections: [
      {
        title: "2.1 Merchant & Business Information",
        bullets: [
          "merchant name",
          "business/store name",
          "phone number",
          "email address",
          "business address",
          "GST details",
          "business registration details",
          "authorized representative information",
        ],
      },
      {
        title: "2.2 KYC & Verification Information",
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
        title: "2.3 Transaction & Platform Information",
        bullets: [
          "transaction records",
          "payment activity",
          "settlement details",
          "refunds and reversals",
          "reward activity",
          "merchant rankings and performance metrics",
          "customer engagement activity",
        ],
      },
      {
        title: "2.4 Device & Technical Information",
        bullets: [
          "IP address",
          "device information",
          "operating system",
          "browser type",
          "app version",
          "usage logs",
          "analytics data",
        ],
      },
    ],
  },
  {
    heading: "3. How We Use Information",
    paragraphs: ["Kutoot may use collected information to:"],
    bullets: [
      "onboard and verify merchants",
      "process transactions and settlements",
      "manage campaigns and rewards",
      "operate scoring and ranking systems",
      "provide analytics and dashboard insights",
      "improve platform performance",
      "detect fraud and suspicious activity",
      "communicate service updates",
      "provide customer support",
      "comply with legal and regulatory obligations",
    ],
  },
  {
    heading: "4. Merchant Rankings & Performance Data",
    paragraphs: [
      "Kutoot may display certain merchant-related business information on the Platform, including:",
    ],
    bullets: [
      "merchant rankings",
      "performance scores",
      "badges and tiers",
      "leaderboard positions",
      "campaign performance indicators",
      "customer engagement insights",
    ],
    trailingParagraphs: [
      "Such information may be visible to customers, other merchants, and platform users.",
      "Rankings, scores, analytics, and visibility indicators are system-generated and may change dynamically based on platform activity, merchant performance, and operational calculations.",
      "Kutoot does not publicly display sensitive personal information unless required by law or explicitly permitted.",
    ],
  },
  {
    heading: "5. Data Sharing & Disclosure",
    paragraphs: ["Kutoot may share information with:"],
    subsections: [
      {
        title: "5.1 Service Providers",
        paragraphs: ["Including:"],
        bullets: [
          "payment gateways",
          "banks and financial partners",
          "cloud hosting providers",
          "analytics providers",
          "KYC verification partners",
          "communication service providers",
        ],
      },
      {
        title: "5.2 Legal & Regulatory Authorities",
        paragraphs: [
          "Where required under applicable law, regulation, court order, or government request.",
        ],
      },
      {
        title: "5.3 Business Operations",
        paragraphs: [
          "Kutoot may share limited information with affiliates or operational partners for platform management and service delivery.",
          "Kutoot does not sell merchant personal data to third parties.",
        ],
      },
    ],
  },
  {
    heading: "6. Aggregated & Analytics Data",
    paragraphs: ["Kutoot may use aggregated, anonymized, or non-personal business data for:"],
    bullets: [
      "analytics",
      "benchmarking",
      "fraud prevention",
      "operational insights",
      "platform improvements",
      "reporting and research",
    ],
    trailingParagraphs: [
      "Such data does not directly identify individual merchants or customers.",
    ],
  },
  {
    heading: "7. Data Retention",
    paragraphs: ["Kutoot retains information only for as long as necessary to:"],
    bullets: [
      "provide platform services",
      "complete settlements and payouts",
      "comply with legal obligations",
      "resolve disputes",
      "enforce agreements",
      "prevent fraud and abuse",
    ],
    trailingParagraphs: [
      "Certain financial, tax, and compliance records may be retained as required by law.",
    ],
  },
  {
    heading: "8. Data Security",
    paragraphs: ["Kutoot uses reasonable security practices and protection measures, including:"],
    bullets: [
      "encrypted systems",
      "access controls",
      "secure infrastructure",
      "authentication measures",
      "internal security procedures",
    ],
    trailingParagraphs: [
      "While we work to protect information, no digital platform can guarantee complete security.",
    ],
  },
  {
    heading: "9. Merchant Rights",
    paragraphs: ["Subject to applicable law, merchants may request to:"],
    bullets: [
      "access their information",
      "update inaccurate information",
      "correct incomplete information",
      "withdraw consent where applicable",
      "request deletion of certain data",
      "raise privacy-related concerns",
    ],
    trailingParagraphs: [
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
    paragraphs: ["Kutoot may use cookies and similar technologies to:"],
    bullets: [
      "improve user experience",
      "remember preferences",
      "analyze usage patterns",
      "enhance platform performance",
    ],
    trailingParagraphs: [
      "Users may manage cookie settings through their browser or device settings.",
    ],
  },
  {
    heading: "12. Fraud Prevention & Monitoring",
    paragraphs: ["Kutoot may monitor platform activity to:"],
    bullets: [
      "detect suspicious transactions",
      "prevent fake activity",
      "identify fraud risks",
      "protect merchants and customers",
      "maintain platform security",
    ],
    trailingParagraphs: [
      "Fraud investigations may involve temporary restrictions, payout holds, or account reviews.",
    ],
  },
  {
    heading: "13. Third-Party Services",
    paragraphs: ["The Platform may include integrations with third-party services."],
    bullets: [
      "Kutoot is not responsible for third-party websites.",
      "Kutoot is not responsible for external payment systems.",
      "Kutoot is not responsible for external platform downtime.",
      "Kutoot is not responsible for third-party privacy practices.",
    ],
    trailingParagraphs: [
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
    paragraphs: ["In the event of a data breach, Kutoot may take appropriate steps to:"],
    bullets: [
      "contain and investigate the issue",
      "reduce potential impact",
      "notify affected parties where required by law",
      "comply with applicable legal obligations",
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
      "Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru – 560102",
      "Support: support@kutoot.com",
      "Legal: legal@kutoot.com",
      "Website: www.kutoot.com",
    ],
  },
  {
    heading: "20. Grievance Redressal",
    paragraphs: [
      "In accordance with applicable law, merchants may contact the Grievance Officer for concerns related to privacy; data usage; account information; and platform-related complaints.",
    ],
    subsections: [
      {
        title: "Grievance Officer Details",
        bullets: [
          "Name: Mr. Arun Kumar",
          "Phone: +91 72597 77622",
          "Company: Kutoot Innovations Private Limited",
          "Email: legal@kutoot.com",
        ],
      },
    ],
    trailingParagraphs: [
      "Kutoot will make reasonable efforts to acknowledge and resolve grievances within timelines required under applicable law.",
    ],
  },
];

export default function MerchantBusinessPrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business"
      subtitle="Privacy Policy"
      effectiveDate="06.05.2026"
      lastUpdated="06.05.2026"
      sections={sections}
    />
  );
}
