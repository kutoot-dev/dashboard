import type { LegalSection } from "@/components/legal/legal-document-page";

export const merchantTermsSections: LegalSection[] = [
  {
    heading: "Introduction",
    paragraphs: [
      'This Terms and Conditions Agreement ("Agreement") is entered into between:',
      'Kutoot Innovations Private Limited, a company incorporated under the laws of India, having its registered office at Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru – 560102, referred to as "Kutoot", "Company", "we", "our", or "us";',
      "AND",
      'The individual, proprietorship, partnership firm, company, or other legal entity registering on Kutoot Business, referred to as the "Merchant", "Store", "Partner", "you", or "your".',
      'Kutoot and the Merchant are collectively referred to as the "Parties" and individually as a "Party".',
    ],
  },
  {
    heading: "1. Definitions",
    paragraphs: ["Unless the context otherwise requires:"],
    subsections: [
      {
        title: '1.1 "Platform"',
        paragraphs: [
          '"Platform" means the Kutoot Business application, web interface, merchant dashboard, QR systems, and associated merchant technology systems operated by Kutoot.',
        ],
      },
      {
        title: '1.2 "Services"',
        paragraphs: [
          '"Services" means services provided by Kutoot including merchant onboarding, discount hosting, analytics, rankings, campaigns, payment facilitation, and related merchant services.',
        ],
      },
      {
        title: '1.3 "Customer"',
        paragraphs: ['"Customer" means any end-user using Kutoot to transact with a Merchant.'],
      },
      {
        title: '1.4 "Transaction"',
        paragraphs: [
          '"Transaction" means any successful redemption, payment, booking, reward activity, or campaign interaction facilitated through Kutoot.',
        ],
      },
      {
        title: '1.5 "Performance Score"',
        paragraphs: [
          '"Performance Score" means the system-generated score assigned to a Merchant based on defined operational and platform parameters.',
        ],
      },
    ],
  },
  {
    heading: "2. Scope and nature of services",
    subsections: [
      {
        title: "2.1",
        paragraphs: [
          "Kutoot Business is a technology-enabled merchant engagement and commerce platform facilitating:",
        ],
        bullets: [
          "Merchant visibility",
          "Discount-led engagement",
          "Payment facilitation",
          "Merchant analytics and insights",
          "Rankings and reward systems",
        ],
      },
      {
        title: "2.2",
        paragraphs: ["Kutoot does not:"],
        bullets: [
          "Sell merchant goods or services",
          "Act as an agent of the Merchant",
          "Guarantee demand, sales, or revenue",
          "Guarantee rankings, visibility, or rewards",
        ],
      },
      {
        title: "2.3",
        paragraphs: ["The Merchant is solely responsible for:"],
        bullets: [
          "Sale and delivery of goods/services",
          "Pricing accuracy",
          "Customer support and refunds",
          "Compliance with applicable laws",
          "Business operations",
        ],
      },
    ],
  },
  {
    heading: "3. Merchant registration and representations",
    subsections: [
      {
        title: "3.1",
        paragraphs: ["The Merchant represents and confirms that:"],
        bullets: [
          "It is legally eligible to enter into this Agreement",
          "All information provided is true, accurate, and complete",
          "It holds all necessary licenses, registrations, and approvals",
        ],
      },
      {
        title: "3.2",
        paragraphs: ["The Merchant shall provide:"],
        bullets: [
          "KYC documentation",
          "Bank account details",
          "Business registration details",
          "GST details and other compliance documents where applicable",
        ],
      },
      {
        title: "3.3",
        paragraphs: ["Kutoot reserves the right to:"],
        bullets: [
          "Approve or reject merchant onboarding",
          "Conduct periodic verification checks",
          "Request updated documents or information",
        ],
      },
    ],
  },
  {
    heading: "4. Discount obligations",
    subsections: [
      {
        title: "4.1",
        paragraphs: [
          "All discounts, offers, and campaigns listed on the Platform shall be treated as valid and binding during the active period.",
        ],
      },
      {
        title: "4.2",
        paragraphs: ["The Merchant shall:"],
        bullets: [
          "Honour all valid redemptions",
          "Maintain reasonable service quality",
          "Provide accurate offer details",
        ],
      },
      {
        title: "4.3",
        paragraphs: ["The Merchant shall not:"],
        bullets: [
          "Artificially inflate prices",
          "Discriminate against Kutoot users",
          "Misuse campaign systems",
          "Create fake promotional activity",
        ],
      },
    ],
    trailingParagraphs: [
      "Violation of campaign policies may result in campaign removal, payout holds, reward reversal, or account suspension.",
    ],
  },
  {
    heading: "5. Performance scoring, ranking & public disclosure",
    subsections: [
      {
        title: "5.1",
        paragraphs: ["Kutoot operates a proprietary performance scoring and ranking system."],
      },
      {
        title: "5.2",
        paragraphs: ["Performance Scores may be calculated using factors including:"],
        bullets: [
          "Discount competitiveness",
          "Conversion rates",
          "Transaction volumes",
          "Repeat customer ratios",
          "Referral metrics",
          "Customer ratings and feedback",
          "Complaint and cancellation rates",
          "Service fulfilment reliability",
        ],
      },
      {
        title: "5.3",
        paragraphs: ["The Merchant acknowledges that:"],
        bullets: [
          "The scoring methodology is dynamic and proprietary",
          "Rankings and scores may change periodically",
          "Kutoot may update scoring logic, parameters, and calculations from time to time",
        ],
      },
      {
        title: "5.4 Public disclosure & visibility",
        paragraphs: ["The Merchant agrees that Kutoot may publicly display:"],
        bullets: [
          "Performance Scores",
          "Rankings and leaderboard positions",
          "Category rankings",
          "Performance indicators",
          "Comparative insights",
          "Badges, tiers, and classifications",
        ],
      },
      {
        title: "Who may see this information",
        paragraphs: ["Such information may be visible to:"],
        bullets: ["Customers", "Other merchants", "General platform users"],
      },
      {
        title: "5.5 Score transparency",
        paragraphs: ["Kutoot may display:"],
        bullets: [
          "Parameter-wise score breakdowns",
          "Graphical score representations",
          "Comparative performance insights",
        ],
      },
      {
        title: "Transparency acknowledgement",
        paragraphs: [
          "The Merchant acknowledges that such transparency is a core feature of the Platform.",
        ],
      },
      {
        title: "5.6 Anti-manipulation",
        paragraphs: [
          "Any attempt to manipulate platform systems, including:",
        ],
        bullets: [
          "Fake or self-generated transactions",
          "Artificial referrals",
          "Collusive practices",
          "Reward abuse",
        ],
      },
      {
        title: "Consequences",
        paragraphs: ["may result in:"],
        bullets: [
          "Immediate suspension",
          "Score invalidation",
          "Payout holds",
          "Reward reversals",
          "Account termination",
          "Legal action",
        ],
      },
    ],
  },
  {
    heading: "6. Commercial terms",
    subsections: [
      {
        title: "6.1 Commission & fees",
        paragraphs: ["The Merchant agrees that Kutoot may charge:"],
        bullets: [
          "Transaction-based commissions",
          "Performance-based commissions",
          "Promotional or campaign fees",
          "Platform or service fees",
        ],
      },
      {
        title: "6.2",
        paragraphs: ["Kutoot may:"],
        bullets: [
          "Modify fee structures with reasonable notice",
          "Introduce new pricing models or service structures",
        ],
      },
      {
        title: "6.3 Performance-based reward distribution",
        paragraphs: [
          "Kutoot may operate performance-based reward, incentive, or revenue-sharing programs for eligible merchants.",
          "Merchants may receive a proportion of platform-generated incentive or reward pools based on factors including:",
        ],
        bullets: [
          "transaction performance",
          "customer engagement",
          "sales activity",
          "platform contribution",
          "merchant rankings",
          "operational performance",
        ],
      },
    ],
    trailingParagraphs: [
      "Reward distributions, calculations, eligibility, and payout structures shall be determined by Kutoot and may change from time to time.",
      "Kutoot does not guarantee rewards, earnings, or fixed returns under such programs.",
    ],
  },
  {
    heading: "7. Payout & settlement",
    subsections: [
      {
        title: "7.1 Settlement cycle",
        paragraphs: [
          "Payments may be settled on a 15 to 20 days basis, subject to:",
        ],
        bullets: [
          "Payment gateway timelines",
          "Banking systems",
          "Compliance verification",
          "Settlement reconciliation",
        ],
      },
      {
        title: "7.2 Deductions",
        paragraphs: ["Kutoot may deduct:"],
        bullets: [
          "Commissions",
          "Refunds and chargebacks",
          "Campaign adjustments",
          "Applicable taxes",
          "Settlement corrections",
        ],
      },
      {
        title: "7.3 Hold & review",
        paragraphs: ["Kutoot may:"],
        bullets: ["Withhold payouts", "Maintain temporary reserves"],
      },
      {
        title: "Circumstances for hold or review",
        paragraphs: ["in cases involving:"],
        bullets: [
          "Fraud suspicion",
          "High dispute ratios",
          "Compliance risks",
          "Verification reviews",
        ],
      },
      {
        title: "7.4 Reconciliation",
        paragraphs: [
          "Merchants must raise settlement discrepancies within 15 days, failing which records may be treated as accepted.",
        ],
      },
    ],
  },
  {
    heading: "8. Fraud & enforcement",
    subsections: [
      {
        title: "8.1",
        paragraphs: [
          "Fraudulent or abusive activities include but are not limited to:",
        ],
        bullets: [
          "Fabricated transactions",
          "Discount abuse",
          "Fake customer activity",
          "Data misuse",
          "Manipulation of rankings or rewards",
        ],
      },
      {
        title: "8.2",
        paragraphs: ["Kutoot may:"],
        bullets: [
          "Suspend accounts",
          "Withhold payouts",
          "Reverse rewards",
          "Restrict campaign participation",
          "Initiate legal proceedings",
        ],
      },
    ],
  },
  {
    heading: "9. Customer obligations",
    paragraphs: ["The Merchant shall:"],
    bullets: [
      "Provide fair and non-discriminatory service",
      "Honour valid commitments and offers",
      "Maintain reasonable service standards",
      "Responsibly address customer concerns",
    ],
  },
  {
    heading: "10. Data protection & confidentiality",
    subsections: [
      {
        title: "10.1",
        paragraphs: [
          "Both Parties shall comply with applicable laws including the Digital Personal Data Protection Act, 2023.",
        ],
      },
      {
        title: "10.2",
        paragraphs: ["The Merchant shall:"],
        bullets: [
          "Use customer data only for service fulfilment",
          "Not misuse or disclose customer data",
          "Maintain confidentiality of customer information",
        ],
      },
      {
        title: "10.3",
        paragraphs: ["Kutoot retains ownership of:"],
        bullets: [
          "Aggregated data",
          "Platform analytics",
          "Operational insights",
          "Scoring methodologies",
        ],
      },
    ],
  },
  {
    heading: "11. Taxation",
    subsections: [
      {
        title: "11.1",
        paragraphs: ["The Merchant shall remain solely responsible for:"],
        bullets: [
          "GST compliance",
          "Tax filings",
          "Invoicing obligations",
          "Statutory compliance",
        ],
      },
      {
        title: "11.2",
        paragraphs: ["Kutoot may:"],
        bullets: ["Deduct applicable taxes", "Comply with TDS/TCS obligations where applicable"],
      },
    ],
  },
  {
    heading: "12. Suspension & termination",
    subsections: [
      {
        title: "Grounds",
        paragraphs: ["Kutoot may suspend or terminate merchant access:"],
        bullets: [
          "Immediately in cases involving fraud",
          "For policy violations or compliance concerns",
          "For inaccurate KYC or business information",
        ],
      },
      {
        title: "Consequences",
        paragraphs: ["Consequences may include:"],
        bullets: [
          "Account deactivation",
          "Withholding of payouts",
          "Removal from campaigns or rankings",
          "Reward reversals",
        ],
      },
    ],
  },
  {
    heading: "13. Limitation of liability",
    paragraphs: [
      "To the maximum extent permitted under applicable law, Kutoot shall not be liable for:",
    ],
    bullets: [
      "Indirect or consequential damages",
      "Loss of profits or business",
      "Merchant-related disputes",
      "Campaign performance issues",
      "Third-party service failures",
    ],
  },
  {
    heading: "14. Indemnity",
    paragraphs: [
      "The Merchant shall indemnify and hold harmless Kutoot against claims arising from:",
    ],
    bullets: [
      "Merchant operations",
      "Legal violations",
      "Customer disputes",
      "Fraud or misuse of the Platform",
    ],
  },
  {
    heading: "15. Intellectual property",
    paragraphs: [
      "All rights related to the Platform, systems, branding, analytics, rankings, dashboards, and associated technology remain the exclusive property of Kutoot.",
    ],
  },
  {
    heading: "16. Force majeure",
    paragraphs: [
      "Neither Party shall be liable for delays or failures caused by events beyond reasonable control, including:",
    ],
    bullets: [
      "Natural disasters",
      "Banking disruptions",
      "Internet failures",
      "Cyber incidents",
      "Government actions",
      "Technical outages",
    ],
  },
  {
    heading: "17. Dispute resolution",
    subsections: [
      {
        title: "Governing law & jurisdiction (summary)",
        paragraphs: [
          "Governing Law: India",
          "Jurisdiction: Bengaluru courts",
        ],
      },
      {
        title: "17.1 Governing law",
        paragraphs: [
          "This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.",
        ],
      },
      {
        title: "17.2 Jurisdiction",
        paragraphs: [
          "Subject to the provisions of arbitration mentioned below, the courts located in Bengaluru, Karnataka, India, shall have exclusive jurisdiction over any disputes arising out of or in connection with this Agreement.",
        ],
      },
      {
        title: "17.3 Amicable resolution",
        paragraphs: [
          "In the event of any dispute, controversy, or claim arising out of or relating to this Agreement, including the breach, termination, or validity thereof, the Parties shall first attempt to resolve the dispute through good faith negotiations within 30 (thirty) days from the date on which either Party notifies the other Party of the dispute.",
        ],
      },
      {
        title: "17.4 Arbitration",
        paragraphs: [
          "If the dispute cannot be resolved through amicable negotiations within the above period, the dispute shall be referred to and finally resolved by arbitration in accordance with the provisions of the Arbitration and Conciliation Act, 1996, as amended from time to time.",
        ],
        bullets: [
          "The arbitration shall be conducted by a sole arbitrator mutually appointed by both Parties.",
          "If the Parties fail to agree on the appointment of an arbitrator within 15 (fifteen) days, the arbitrator shall be appointed in accordance with the provisions of the Arbitration and Conciliation Act, 1996.",
          "The seat and venue of arbitration shall be Bengaluru, Karnataka, India.",
          "The language of arbitration shall be English.",
          "The decision of the arbitrator shall be final and binding upon the Parties.",
        ],
      },
      {
        title: "17.5 Interim relief",
        paragraphs: [
          "Nothing in this clause shall prevent either Party from seeking interim or injunctive relief from a competent court in Bengaluru, Karnataka, if necessary to protect its rights pending the outcome of arbitration.",
        ],
      },
    ],
  },
  {
    heading: "18. Amendments",
    paragraphs: [
      "Kutoot may update or revise this Agreement from time to time.",
      "Continued use of the Platform constitutes acceptance of the revised Agreement.",
    ],
    subsections: [
      {
        title: "18.1 Right to amend",
        paragraphs: [
          "Kutoot reserves the right, at its sole discretion, to modify, update, or revise this Agreement from time to time in order to reflect changes in legal requirements, business practices, services offered, or platform policies.",
        ],
      },
      {
        title: "18.2 Notification of changes",
        paragraphs: [
          "Any amendments to this Agreement may be communicated to the Merchant/User through platform notifications, email communication, or publication on the Kutoot platform or website.",
        ],
      },
      {
        title: "18.3 Acceptance of amendments",
        paragraphs: [
          "Continued use of the Kutoot platform, services, or any related features after the effective date of such amendments shall constitute acceptance of the revised Agreement.",
        ],
      },
      {
        title: "18.4 Right to discontinue use",
        paragraphs: [
          "If the Merchant/User does not agree with any modification to this Agreement, the Merchant/User may choose to discontinue the use of the platform and terminate the relationship in accordance with the termination provisions of this Agreement.",
        ],
      },
      {
        title: "18.5 Superseding effect",
        paragraphs: [
          "Any amended version of this Agreement shall supersede all previous versions, unless explicitly stated otherwise.",
        ],
      },
    ],
  },
  {
    heading: "19. Entire agreement",
    paragraphs: [
      "This Agreement constitutes the complete understanding between the Parties regarding the use of Kutoot Business.",
    ],
  },
  {
    heading: "20. Acceptance",
    paragraphs: [
      'By clicking "I Agree", registering, onboarding, or using Kutoot Business, the Merchant confirms acceptance of this Agreement.',
    ],
  },
];
