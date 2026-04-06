/**
 * Constants: Scoring parameter definitions
 *
 * These mirror the scoring_parameters DB table seed data.
 * Used for both display labels and initial mock data seeding.
 * All labels are written in simple merchant-friendly language.
 */

export const SCORING_PARAMETER_DEFINITIONS: Record<string, { description: string; defaultValue: number; merchantHint: string }> = {
  weight_trading_performance: { description: "How much your daily sales matter in your overall score", defaultValue: 0.35, merchantHint: "Sell more items each day to improve this" },
  weight_margin_efficiency: { description: "How well you manage your profit margins", defaultValue: 0.20, merchantHint: "Maintain healthy margins without overpricing" },
  weight_location_opportunity: { description: "Bonus for serving underserved areas — smaller towns get higher boost", defaultValue: 0.20, merchantHint: "Merchants in Tier 3/4 cities get a natural advantage" },
  weight_transaction_quality: { description: "How consistent and genuine your transactions are", defaultValue: 0.10, merchantHint: "Avoid round-number-only billing and keep refunds low" },
  weight_momentum: { description: "Whether your performance is trending upward week over week", defaultValue: 0.10, merchantHint: "Grow steadily — even small weekly improvements count" },
  weight_ecosystem: { description: "Bonus for referring other merchants and helping the community", defaultValue: 0.05, merchantHint: "Refer new merchants to Kutoot to earn extra points" },
  momentum_ema_alpha: { description: "Speed at which recent performance weighs more than past", defaultValue: 0.3, merchantHint: "Recent weeks matter more — keep improving" },
  ecosystem_credit_halflife_days: { description: "How long referral bonus lasts (in days)", defaultValue: 30, merchantHint: "Referral credit fades over 30 days — keep referring" },
  ecosystem_cap_percentage: { description: "Maximum score boost from referrals", defaultValue: 0.05, merchantHint: "Referrals can add up to 5% extra to your score" },
  fatigue_threshold_consecutive_periods: { description: "Weeks a top performer stays in top 10 before dampener kicks in", defaultValue: 3, merchantHint: "After 3 weeks in Top 10, score growth slows to give others a chance" },
  fatigue_dampener_max: { description: "Maximum score reduction for long-time top performers", defaultValue: 0.15, merchantHint: "Top stays accessible to new rising merchants" },
  fraud_velocity_multiplier_threshold: { description: "Unusual spike in transactions that triggers a review", defaultValue: 2.0, merchantHint: "Sudden 2x jump in daily sales triggers an automatic check" },
  fraud_reversal_rate_threshold: { description: "Too many cancelled/reversed transactions triggers a flag", defaultValue: 0.15, merchantHint: "Keep refunds below 15% of total sales" },
  fraud_round_number_concentration_threshold: { description: "Too many ₹100, ₹500 type transactions triggers a flag", defaultValue: 0.6, merchantHint: "Bill exact amounts — avoid rounding every bill" },
  location_multiplier_floor: { description: "Score multiplier for metro city merchants", defaultValue: 1.0, merchantHint: "Metro merchants get 1x location score" },
  location_multiplier_ceiling: { description: "Score multiplier for rural/small town merchants", defaultValue: 3.0, merchantHint: "Small town merchants can get up to 3x location advantage" },
  minimum_cohort_size: { description: "Minimum merchants in your category needed for fair comparison", defaultValue: 10, merchantHint: "You're compared against similar shops in your area" },
  bayesian_prior_weight_initial: { description: "New merchant score protection (higher = more protection)", defaultValue: 0.8, merchantHint: "New merchants start with a safety net that slowly reduces" },
  bayesian_prior_weight_decay_per_week: { description: "How fast new merchant protection reduces each week", defaultValue: 0.1, merchantHint: "After 8 weeks, your score is fully based on your own performance" },
  payout_curve_alpha: { description: "How steeply rewards favor top performers", defaultValue: 1.8, merchantHint: "Higher rank = much bigger share of the reward pool" },
  payout_minimum_threshold_inr: { description: "Minimum reward amount in ₹ (below this = non-cash reward)", defaultValue: 50, merchantHint: "Earn above ₹50 to receive cash reward" },
};

/**
 * Sub-score display names — simple Hindi/English labels
 * that any Indian merchant (kirana, pharmacy, restaurant etc.) can understand
 */
export const SUB_SCORE_LABELS: Record<string, string> = {
  trading_performance: "Shop Activity",
  margin_efficiency: "Profit Health",
  location_opportunity: "Area Advantage",
  transaction_quality: "Billing Quality",
  momentum: "Growth Trend",
  ecosystem_contribution: "Community Bonus",
};

/** Sub-score short descriptions for info tooltips */
export const SUB_SCORE_DESCRIPTIONS: Record<string, string> = {
  trading_performance: "Based on how many sales you make each day. More transactions = higher score.",
  margin_efficiency: "Measures if your pricing is healthy. Fair margins without overcharging.",
  location_opportunity: "Bonus score for merchants in smaller towns and underserved areas.",
  transaction_quality: "Checks if your bills are genuine — consistent amounts, low refunds.",
  momentum: "Are you improving week over week? Even small gains count.",
  ecosystem_contribution: "Extra points for referring other merchants to Kutoot.",
};

/** Sub-score weights for computing the composite score */
export const SUB_SCORE_WEIGHTS: Record<string, number> = {
  trading_performance: 0.35,
  margin_efficiency: 0.20,
  location_opportunity: 0.20,
  transaction_quality: 0.10,
  momentum: 0.10,
  ecosystem_contribution: 0.05,
};

/** Merchant-friendly improvement tips keyed by sub-score */
export const IMPROVEMENT_TIPS: Record<string, string[]> = {
  trading_performance: [
    "Try to complete at least 10 transactions every day",
    "Keep your shop open during peak hours (10AM–1PM, 5PM–8PM)",
    "Offer combo deals to increase number of bills per customer",
  ],
  margin_efficiency: [
    "Review your pricing to ensure healthy profit margins",
    "Avoid heavy discounting — steady margins score better",
    "Compare your margins with similar shops in the leaderboard",
  ],
  location_opportunity: [
    "This score depends on your area — smaller towns get a natural boost",
    "If you serve rural customers, make sure all transactions are on-platform",
    "Your location multiplier is fixed based on your city tier",
  ],
  transaction_quality: [
    "Bill exact amounts instead of rounding to ₹100, ₹500",
    "Keep refunds and reversals below 15% of your total sales",
    "Maintain consistent daily transaction patterns",
  ],
  momentum: [
    "Try to improve your score even by 1-2 points each week",
    "Consistent small improvements beat one-time spikes",
    "Don't let sales drop suddenly — smooth growth is rewarded",
  ],
  ecosystem_contribution: [
    "Refer other merchants in your area to join Kutoot",
    "Each successful referral adds bonus points for 30 days",
    "Maximum 5% of your score can come from referrals",
  ],
};
