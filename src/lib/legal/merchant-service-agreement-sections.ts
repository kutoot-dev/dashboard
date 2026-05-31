import type { LegalSection } from "@/components/legal/legal-document-page";

/**
 * Merchant Service Agreement — commercial, commission, and settlement terms
 * referenced during onboarding consent.
 */
export const merchantServiceAgreementSections: LegalSection[] = [
  {
    heading: "Merchant Service Agreement",
    paragraphs: [
      'This Merchant Service Agreement ("Agreement") governs your use of Kutoot Business platform services, including payment facilitation, commissions, settlements, and related merchant operations.',
      "By accepting this agreement during onboarding, you confirm that you have read, understood, and agree to be bound by these commercial terms in addition to the Kutoot Business Terms & Conditions.",
    ],
  },
  {
    heading: "1. Commission & platform fees",
    paragraphs: ["You agree that Kutoot may charge:"],
    bullets: [
      "Transaction-based commissions at the rate you select during onboarding (subject to your business category minimum)",
      "Performance-based or promotional fees where applicable",
      "Applicable taxes on platform fees as required by law",
    ],
    trailingParagraphs: [
      "The minimum commission percentage for your business category is enforced at onboarding and may be updated by Kutoot with reasonable notice for future transactions.",
      "You may voluntarily select a higher commission rate to improve your platform performance score where that program is available.",
    ],
  },
  {
    heading: "2. Fee changes",
    paragraphs: [
      "Kutoot may modify fee structures, introduce new pricing models, or adjust category minimums with reasonable notice through the merchant dashboard, email, or in-app notification.",
      "Continued use of the platform after such notice constitutes acceptance of the updated commercial terms unless you terminate your merchant account as provided in the master Terms & Conditions.",
    ],
  },
  {
    heading: "3. Payout & settlement",
    subsections: [
      {
        title: "3.1 Settlement cycle",
        paragraphs: [
          "Merchant settlements may be processed on a periodic basis (typically 15–20 days), subject to payment gateway timelines, banking systems, compliance verification, and reconciliation.",
        ],
      },
      {
        title: "3.2 Deductions",
        paragraphs: ["Kutoot may deduct from settlements:"],
        bullets: [
          "Agreed commissions and applicable GST on platform fees",
          "Customer refunds and chargebacks",
          "Campaign or promotional adjustments",
          "Settlement corrections",
        ],
      },
      {
        title: "3.3 Holds",
        paragraphs: [
          "Kutoot may withhold or delay payouts in cases involving fraud suspicion, high dispute ratios, compliance reviews, or verification requirements.",
        ],
      },
    ],
  },
  {
    heading: "4. Performance programs",
    paragraphs: [
      "Kutoot may operate performance-based reward, incentive, or revenue-sharing programs for eligible merchants. Participation, eligibility, and payout structures are determined by Kutoot and may change from time to time.",
      "Kutoot does not guarantee rewards, earnings, rankings, or fixed returns under such programs.",
    ],
  },
  {
    heading: "5. Merchant responsibilities",
    paragraphs: ["You remain solely responsible for:"],
    bullets: [
      "Accuracy of pricing, discounts, and offers displayed to customers",
      "Fulfillment of goods and services sold through your store",
      "Customer support, refunds, and dispute resolution at your outlet",
      "Compliance with applicable tax and licensing laws",
    ],
  },
];
