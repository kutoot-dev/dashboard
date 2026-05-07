import { LegalDocumentPage } from "@/components/legal/legal-document-page";

const sections = [
  {
    heading: "Agreement",
    paragraphs: [
      "This Terms and Conditions Agreement (\"Agreement\") is entered into between Kutoot Innovations Private Limited, a company incorporated under the laws of India, having its registered office at Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru - 560102 (\"Kutoot\", \"Company\", \"we\", \"our\", or \"us\"); and the individual, proprietorship, partnership firm, company, or other legal entity registering on Kutoot Business (\"Merchant\", \"Store\", \"Partner\", \"you\", or \"your\").",
      "Kutoot and the Merchant are collectively referred to as the \"Parties\" and individually as a \"Party\".",
    ],
  },
  {
    heading: "1. Definitions",
    bullets: [
      "1.1 \"Platform\" means the Kutoot Business application, web interface, merchant dashboard, QR systems, and associated merchant technology systems operated by Kutoot.",
      "1.2 \"Services\" means services provided by Kutoot including merchant onboarding, discount hosting, analytics, rankings, campaigns, payment facilitation, and related merchant services.",
      "1.3 \"Customer\" means any end-user using Kutoot to transact with a Merchant.",
      "1.4 \"Transaction\" means any successful redemption, payment, booking, reward activity, or campaign interaction facilitated through Kutoot.",
      "1.5 \"Performance Score\" means the system-generated score assigned to a Merchant based on defined operational and platform parameters.",
    ],
  },
  {
    heading: "2. Scope and Nature of Services",
    paragraphs: [
      "2.1 Kutoot Business is a technology-enabled merchant engagement and commerce platform facilitating merchant visibility, discount-led engagement, payment facilitation, merchant analytics and insights, and rankings and reward systems.",
    ],
    bullets: [
      "2.2 Kutoot does not sell merchant goods or services.",
      "2.2 Kutoot does not act as an agent of the Merchant.",
      "2.2 Kutoot does not guarantee demand, sales, or revenue.",
      "2.2 Kutoot does not guarantee rankings, visibility, or rewards.",
      "2.3 The Merchant is solely responsible for sale and delivery of goods/services, pricing accuracy, customer support and refunds, compliance with applicable laws, and business operations.",
    ],
  },
  {
    heading: "3. Merchant Registration and Representations",
    bullets: [
      "3.1 The Merchant represents and confirms it is legally eligible to enter into this Agreement, all information provided is true, accurate, and complete, and it holds all necessary licenses, registrations, and approvals.",
      "3.2 The Merchant shall provide KYC documentation, bank account details, business registration details, GST details, and other compliance documents where applicable.",
      "3.3 Kutoot reserves the right to approve or reject merchant onboarding, conduct periodic verification checks, and request updated documents or information.",
    ],
  },
  {
    heading: "4. Discount Obligations",
    bullets: [
      "4.1 All discounts, offers, and campaigns listed on the Platform shall be treated as valid and binding during the active period.",
      "4.2 The Merchant shall honour all valid redemptions, maintain reasonable service quality, and provide accurate offer details.",
      "4.3 The Merchant shall not artificially inflate prices, discriminate against Kutoot users, misuse campaign systems, or create fake promotional activity.",
      "Violation of campaign policies may result in campaign removal, payout holds, reward reversal, or account suspension.",
    ],
  },
  {
    heading: "5. Performance Scoring, Ranking, and Public Disclosure",
    paragraphs: [
      "5.1 Kutoot operates a proprietary performance scoring and ranking system.",
      "5.4 Public Disclosure and Visibility: The Merchant agrees that Kutoot may publicly display Performance Scores, rankings and leaderboard positions, category rankings, performance indicators, comparative insights, and badges, tiers, and classifications. Such information may be visible to Customers, other merchants, and general platform users.",
      "5.5 Score Transparency: Kutoot may display parameter-wise score breakdowns, graphical score representations, and comparative performance insights. The Merchant acknowledges that such transparency is a core feature of the Platform.",
      "5.6 Anti-Manipulation: Any attempt to manipulate platform systems, including fake or self-generated transactions, artificial referrals, collusive practices, or reward abuse, may result in immediate suspension, score invalidation, payout holds, reward reversals, account termination, and legal action.",
    ],
    bullets: [
      "5.2 Performance Scores may be calculated using factors including discount competitiveness, conversion rates, transaction volumes, repeat customer ratios, referral metrics, customer ratings and feedback, complaint and cancellation rates, and service fulfilment reliability.",
      "5.3 The Merchant acknowledges that the scoring methodology is dynamic and proprietary, rankings and scores may change periodically, and Kutoot may update scoring logic, parameters, and calculations from time to time.",
    ],
  },
  {
    heading: "6. Commercial Terms",
    paragraphs: [
      "6.3 Performance-Based Reward Distribution: Kutoot may operate performance-based reward, incentive, or revenue-sharing programs for eligible merchants. Merchants may receive a proportion of platform-generated incentive or reward pools based on factors including transaction performance, customer engagement, sales activity, platform contribution, merchant rankings, and operational performance.",
      "Reward distributions, calculations, eligibility, and payout structures shall be determined by Kutoot and may change from time to time. Kutoot does not guarantee rewards, earnings, or fixed returns under such programs.",
    ],
    bullets: [
      "6.1 Commission and Fees: The Merchant agrees that Kutoot may charge transaction-based commissions, performance-based commissions, promotional or campaign fees, and platform or service fees.",
      "6.2 Kutoot may modify fee structures with reasonable notice and introduce new pricing models or service structures.",
    ],
  },
  {
    heading: "7. Payout and Settlement",
    bullets: [
      "7.1 Settlement Cycle: Payments may be settled on a 15 to 20 days basis, subject to payment gateway timelines, banking systems, compliance verification, and settlement reconciliation.",
      "7.2 Deductions: Kutoot may deduct commissions, refunds and chargebacks, campaign adjustments, applicable taxes, and settlement corrections.",
      "7.3 Hold and Review: Kutoot may withhold payouts and maintain temporary reserves in cases involving fraud suspicion, high dispute ratios, compliance risks, or verification reviews.",
      "7.4 Reconciliation: Merchants must raise settlement discrepancies within 15 days, failing which records may be treated as accepted.",
    ],
  },
  {
    heading: "8. Fraud and Enforcement",
    bullets: [
      "8.1 Fraudulent or abusive activities include but are not limited to fabricated transactions, discount abuse, fake customer activity, data misuse, and manipulation of rankings or rewards.",
      "8.2 Kutoot may suspend accounts, withhold payouts, reverse rewards, restrict campaign participation, and initiate legal proceedings.",
    ],
  },
  {
    heading: "9. Customer Obligations",
    bullets: [
      "The Merchant shall provide fair and non-discriminatory service, honour valid commitments and offers, maintain reasonable service standards, and responsibly address customer concerns.",
    ],
  },
  {
    heading: "10. Data Protection and Confidentiality",
    bullets: [
      "10.1 Both Parties shall comply with applicable laws including the Digital Personal Data Protection Act, 2023.",
      "10.2 The Merchant shall use customer data only for service fulfilment, not misuse or disclose customer data, and maintain confidentiality of customer information.",
      "10.3 Kutoot retains ownership of aggregated data, platform analytics, operational insights, and scoring methodologies.",
    ],
  },
  {
    heading: "11. Taxation",
    bullets: [
      "11.1 The Merchant shall remain solely responsible for GST compliance, tax filings, invoicing obligations, and statutory compliance.",
      "11.2 Kutoot may deduct applicable taxes and comply with TDS/TCS obligations where applicable.",
    ],
  },
  {
    heading: "12. Suspension and Termination",
    paragraphs: [
      "Kutoot may suspend or terminate merchant access immediately in cases involving fraud, for policy violations or compliance concerns, or for inaccurate KYC or business information.",
    ],
    bullets: [
      "Consequences may include account deactivation.",
      "Consequences may include withholding of payouts.",
      "Consequences may include removal from campaigns or rankings.",
      "Consequences may include reward reversals.",
    ],
  },
  {
    heading: "13. Limitation of Liability",
    bullets: [
      "To the maximum extent permitted under applicable law, Kutoot shall not be liable for indirect or consequential damages, loss of profits or business, merchant-related disputes, campaign performance issues, or third-party service failures.",
    ],
  },
  {
    heading: "14. Indemnity",
    bullets: [
      "The Merchant shall indemnify and hold harmless Kutoot against claims arising from Merchant operations, legal violations, customer disputes, fraud, or misuse of the Platform.",
    ],
  },
  {
    heading: "15. Intellectual Property",
    bullets: [
      "All rights related to the Platform, systems, branding, analytics, rankings, dashboards, and associated technology remain the exclusive property of Kutoot.",
    ],
  },
  {
    heading: "16. Force Majeure",
    bullets: [
      "Neither Party shall be liable for delays or failures caused by events beyond reasonable control, including natural disasters, banking disruptions, internet failures, cyber incidents, government actions, and technical outages.",
    ],
  },
  {
    heading: "17. Dispute Resolution",
    paragraphs: [
      "Governing Law: India. Jurisdiction: Bengaluru courts.",
      "17.1 This Agreement shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.",
      "17.2 Subject to arbitration below, the courts located in Bengaluru, Karnataka, India, shall have exclusive jurisdiction over any disputes arising out of or in connection with this Agreement.",
      "17.3 In the event of any dispute, controversy, or claim arising out of or relating to this Agreement, including breach, termination, or validity, the Parties shall first attempt to resolve the dispute through good faith negotiations within 30 days from notice by either Party.",
      "17.4 If the dispute cannot be resolved through amicable negotiations within the above period, the dispute shall be referred to and finally resolved by arbitration in accordance with the Arbitration and Conciliation Act, 1996, as amended from time to time.",
      "17.5 Nothing in this clause shall prevent either Party from seeking interim or injunctive relief from a competent court in Bengaluru, Karnataka, if necessary to protect its rights pending arbitration.",
    ],
    bullets: [
      "The arbitration shall be conducted by a sole arbitrator mutually appointed by both Parties.",
      "If the Parties fail to agree on the appointment of an arbitrator within 15 days, the arbitrator shall be appointed in accordance with the Arbitration and Conciliation Act, 1996.",
      "The seat and venue of arbitration shall be Bengaluru, Karnataka, India.",
      "The language of arbitration shall be English.",
      "The decision of the arbitrator shall be final and binding upon the Parties.",
    ],
  },
  {
    heading: "18. Amendments",
    paragraphs: [
      "Kutoot may update or revise this Agreement from time to time. Continued use of the Platform constitutes acceptance of the revised Agreement.",
    ],
    bullets: [
      "18.1 Right to Amend: Kutoot reserves the right, at its sole discretion, to modify, update, or revise this Agreement from time to time to reflect changes in legal requirements, business practices, services offered, or platform policies.",
      "18.2 Notification of Changes: Any amendments may be communicated through platform notifications, email communication, or publication on the Kutoot platform or website.",
      "18.3 Acceptance of Amendments: Continued use of the Kutoot platform, services, or related features after the effective date of amendments constitutes acceptance of the revised Agreement.",
      "18.4 Right to Discontinue Use: If the Merchant/User does not agree with any modification, the Merchant/User may discontinue use of the platform and terminate the relationship in accordance with termination provisions.",
      "18.5 Superseding Effect: Any amended version of this Agreement shall supersede all previous versions, unless explicitly stated otherwise.",
    ],
  },
  {
    heading: "19. Entire Agreement",
    paragraphs: [
      "This Agreement constitutes the complete understanding between the Parties regarding the use of Kutoot Business.",
    ],
  },
  {
    heading: "20. Acceptance",
    paragraphs: [
      "By clicking \"I Agree\", registering, onboarding, or using Kutoot Business, the Merchant confirms acceptance of this Agreement.",
    ],
  },
];

export default function MerchantTermsPage() {
  return (
    <LegalDocumentPage
      title="Kutoot Business Merchant Terms and Conditions"
      subtitle="Kutoot Innovations Private Limited, Delta Arcade, 22nd Cross, 18th Main, Sector 3, HSR Layout, Bengaluru - 560102."
      sections={sections}
    />
  );
}
