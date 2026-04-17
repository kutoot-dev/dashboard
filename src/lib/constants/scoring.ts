/**
 * V2 Exchange Economy — Sub-Score Labels, Descriptions, and Default Weights
 *
 * These map to the backend ExchangeScoreService 8-component formula.
 * Weights are defaults and may be overridden via DB scoring_parameters.
 */

export const SUB_SCORE_LABELS: Record<string, string> = {
  gmv_score:                 "Sales Volume (GMV)",
  commission_score:          "Commission",
  platform_capture_score:    "Platform Capture",
  user_growth_score:         "New Customer Growth",
  repeat_rate_score:         "Customer Loyalty",
  discount_aggression_score: "Discount Health",
  referral_score:            "Merchant Referrals",
  fairness_score:            "Customer Fairness",
};

export const SUB_SCORE_DESCRIPTIONS: Record<string, string> = {
  gmv_score:
    "How much total sales you generated compared to other branches. Higher GMV relative to your peers earns a better score.",
  commission_score:
    "Commission earned modelled on an S-curve — rewards consistent, growing performers without punishing smaller branches.",
  platform_capture_score:
    "How much net revenue the platform earns per rupee of your sales. Reflects the quality of your transactions.",
  user_growth_score:
    "How many new customers transacted at your branch this period. First-time buyers earn an extra bonus.",
  repeat_rate_score:
    "The fraction of your customers who came back and bought again. Strong loyalty means a higher score.",
  discount_aggression_score:
    "Rewards sustainable discounting. Deep discounts reduce this score; high-conversion flash deals add a bonus.",
  referral_score:
    "Credit for bringing other merchants onto the platform. Referral credit decays gradually over time.",
  fairness_score:
    "Penalises customer concentration — if most of your GMV comes from one person, this score drops. Broad reach is rewarded.",
};

/** Default weights (fraction of composite). Must sum to 1.0. */
export const SUB_SCORE_WEIGHTS: Record<string, number> = {
  gmv_score:                 0.15,
  commission_score:          0.20,
  platform_capture_score:    0.15,
  user_growth_score:         0.15,
  repeat_rate_score:         0.15,
  discount_aggression_score: 0.10,
  referral_score:            0.10,
  fairness_score:            0.10,
};

/** Display order for parameter meters */
export const SUB_SCORE_ORDER: string[] = [
  "gmv_score",
  "commission_score",
  "platform_capture_score",
  "user_growth_score",
  "repeat_rate_score",
  "discount_aggression_score",
  "referral_score",
  "fairness_score",
];
