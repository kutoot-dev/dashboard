import type { LegalSection } from "@/components/legal/legal-document-page";

/**
 * Merchant Incentive Agreement — consent required when modifying Growth Boost
 * (voluntary commission increase) in the merchant dashboard.
 */
export const merchantIncentiveAgreementSections: LegalSection[] = [
  {
    heading: "Merchant Incentive Agreement",
    paragraphs: [
      'This Merchant Incentive Agreement ("Agreement") governs your participation in Kutoot Business performance and Growth Boost programs, including voluntary commission adjustments made through the merchant dashboard.',
      "By scrolling through and accepting this Agreement, you confirm that you have read, understood, and agree to the terms below before applying any Growth Boost or commission change.",
    ],
  },
  {
    heading: "1. Growth Boost program",
    paragraphs: [
      "Growth Boost allows eligible merchants to voluntarily set a commission rate above their category minimum in exchange for a potential improvement in platform performance score.",
      "Score impact depends on Kutoot's live scoring model, category weights, market conditions, and other merchants' performance. Kutoot does not guarantee any specific ranking, visibility, transaction volume, or revenue outcome.",
    ],
    bullets: [
      "Commission changes apply to future qualifying transactions after the change is saved",
      "You may increase or decrease your commission within the limits shown in the dashboard",
      "Category minimums may change with reasonable notice",
    ],
  },
  {
    heading: "2. Voluntary participation",
    paragraphs: [
      "Participation in Growth Boost is voluntary. You are not required to raise your commission to use Kutoot Business.",
      "Each time you apply a new commission rate through Growth Boost, you must review and accept this Agreement in full before the change takes effect.",
    ],
  },
  {
    heading: "3. Fees, incentives, and settlements",
    paragraphs: ["You acknowledge that:"],
    bullets: [
      "Higher commission rates increase the platform fee deducted from eligible transactions",
      "Applicable GST or other taxes on platform fees may apply as required by law",
      "Incentive pools, rewards, or revenue-sharing programs—if offered—are discretionary and may be modified or discontinued by Kutoot",
      "Settlement timelines remain subject to payment gateway, banking, reconciliation, and compliance processes",
    ],
  },
  {
    heading: "4. No guaranteed returns",
    paragraphs: [
      "Kutoot does not promise fixed earnings, minimum payouts, permanent score improvements, or sustained leaderboard positions under Growth Boost or related incentive programs.",
      "Past performance of other merchants is not indicative of your future results.",
    ],
  },
  {
    heading: "5. Merchant responsibilities",
    paragraphs: ["You remain solely responsible for:"],
    bullets: [
      "Accuracy of pricing, discounts, and offers displayed to customers",
      "Fulfillment of goods and services sold through your store",
      "Compliance with applicable tax, licensing, and consumer protection laws",
      "Monitoring the commercial impact of commission changes on your business",
    ],
  },
  {
    heading: "6. Acceptance & records",
    paragraphs: [
      "Your acceptance is recorded with document version, timestamp, device metadata, and scroll attestation where required.",
      "Kutoot may retain acceptance records for audit, dispute resolution, and regulatory compliance.",
      "If this Agreement is updated, you must review and accept the latest version before applying subsequent Growth Boost changes.",
    ],
  },
  {
    heading: "7. Governing terms",
    paragraphs: [
      "This Agreement supplements the Kutoot Business Terms & Conditions and Merchant Service Agreement. If there is a conflict, the master Terms & Conditions prevail except where this Agreement specifically governs Growth Boost commission changes.",
      "Continued use of Growth Boost after notice of updated terms constitutes acceptance of the revised Agreement when you complete the in-dashboard consent flow.",
    ],
  },
];
