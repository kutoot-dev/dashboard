/**
 * V2 Exchange Economy — Sub-Score Labels, Descriptions, and Default Weights
 *
 * These map to the backend ExchangeScoreService 8-component formula.
 * Weights are defaults and may be overridden via DB scoring_parameters.
 */

export const SUB_SCORE_LABELS: Record<string, string> = {
  // Legacy aliases still used by a few pages
  trading_performance:        "Trading Performance",
  margin_efficiency:          "Margin Efficiency",
  location_opportunity:       "Location Opportunity",
  transaction_quality:        "Transaction Quality",
  momentum:                   "Momentum",
  ecosystem_contribution:     "Ecosystem Contribution",

  // v2 exchange model keys
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
  // Legacy aliases
  trading_performance:
    "Measures your transaction activity and consistency over time.",
  margin_efficiency:
    "Tracks how efficiently your branch converts sales into healthy margins.",
  location_opportunity:
    "Adjusts expectations based on your local market potential.",
  transaction_quality:
    "Rewards clean transaction patterns and reliable billing behavior.",
  momentum:
    "Captures recent trend direction and acceleration of performance.",
  ecosystem_contribution:
    "Credits value your branch contributes to the wider merchant ecosystem.",

  // v2 exchange model keys
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

export const IMPROVEMENT_TIPS: Record<string, string[]> = {
  trading_performance: [
    "Increase repeat footfall with daily time-slot offers.",
    "Keep top SKUs in stock during peak evening hours.",
    "Run short campaigns around high-conversion weekdays.",
  ],
  margin_efficiency: [
    "Bundle fast-moving low-margin items with premium add-ons.",
    "Reduce discount depth on items with high natural demand.",
    "Review supplier cost leakage every week.",
  ],
  location_opportunity: [
    "Target nearby offices and residential clusters separately.",
    "Use locality-specific promotions to improve conversion.",
    "Align campaign timing with neighborhood demand peaks.",
  ],
  transaction_quality: [
    "Encourage complete billing for every order.",
    "Minimize voided transactions and duplicate entries.",
    "Train staff to close payments in one clean flow.",
  ],
  momentum: [
    "Sustain last week winners for at least 2 cycles.",
    "Avoid abrupt pricing changes that disrupt conversion.",
    "Use compact 3-day pushes instead of one-day spikes.",
  ],
  ecosystem_contribution: [
    "Participate in platform-wide thematic campaigns.",
    "Refer relevant merchants in your area.",
    "Keep active customer communication channels.",
  ],

  gmv_score: [
    "Focus on peak-hour order throughput.",
    "Promote higher-value combos to lift ticket size.",
    "Repeat your top converting offers weekly.",
  ],
  commission_score: [
    "Protect net margin on high-demand items.",
    "Shift discount budget from low-ROI campaigns.",
    "Prioritize profitable customer segments.",
  ],
  platform_capture_score: [
    "Increase share of platform-origin transactions.",
    "Improve offer relevance instead of blanket discounts.",
    "Reduce off-platform leakage from repeat buyers.",
  ],
  user_growth_score: [
    "Run first-order incentives for nearby audiences.",
    "Partner with local events for new customer reach.",
    "Retarget non-converted visitors quickly.",
  ],
  repeat_rate_score: [
    "Launch 2nd and 3rd order nudges.",
    "Reward loyal customers with lightweight perks.",
    "Follow up with inactive customers within 7 days.",
  ],
  discount_aggression_score: [
    "Keep discounts in healthy benchmark ranges.",
    "Use short flash windows over all-day deep cuts.",
    "Monitor conversion lift vs margin loss daily.",
  ],
  referral_score: [
    "Invite quality merchants from your area.",
    "Share referral campaigns during local networking windows.",
    "Track referred merchant activation quality.",
  ],
  fairness_score: [
    "Reduce dependence on a few high-spend customers.",
    "Diversify customer mix with broad-reach promotions.",
    "Encourage mid-frequency buyers to return.",
  ],
};

export const SCORING_PARAMETER_DEFINITIONS: Record<string, { defaultValue: number; description: string }> = {
  gmv_weight: { defaultValue: 0.15, description: "Weight for GMV sub-score." },
  commission_weight: { defaultValue: 0.20, description: "Weight for commission sub-score." },
  platform_capture_weight: { defaultValue: 0.15, description: "Weight for platform capture sub-score." },
  user_growth_weight: { defaultValue: 0.15, description: "Weight for user growth sub-score." },
  repeat_rate_weight: { defaultValue: 0.15, description: "Weight for repeat-rate sub-score." },
  discount_aggression_weight: { defaultValue: 0.10, description: "Weight for discount-aggression sub-score." },
  referral_weight: { defaultValue: 0.10, description: "Weight for referral sub-score." },
  fairness_weight: { defaultValue: 0.10, description: "Weight for fairness sub-score." },
  fatigue_top_n_threshold: { defaultValue: 10, description: "Top-N rank threshold for fatigue dampener." },
  fatigue_min_consecutive_periods: { defaultValue: 3, description: "Minimum consecutive periods before fatigue applies." },
  fatigue_default_dampener: { defaultValue: 0.85, description: "Default dampener multiplier when fatigue triggers." },
  min_transactions_threshold: { defaultValue: 5, description: "Minimum transactions to be considered for full scoring." },
  percentile_floor: { defaultValue: 5, description: "Lower percentile clamp for robust scaling." },
  percentile_ceiling: { defaultValue: 95, description: "Upper percentile clamp for robust scaling." },
};
