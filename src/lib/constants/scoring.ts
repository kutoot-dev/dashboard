/**
 * Constants: Scoring parameter definitions
 *
 * These mirror the scoring_parameters DB table seed data.
 * Used for both display labels and initial mock data seeding.
 * All labels are written in simple branch-friendly language.
 */

export const SCORING_PARAMETER_DEFINITIONS: Record<string, { description: string; defaultValue: number; branchHint: string }> = {
  weight_trading_performance: { description: "How much your daily sales matter in your overall score", defaultValue: 0.35, branchHint: "Sell more items each day to improve this" },
  weight_margin_efficiency: { description: "How well you manage your profit margins", defaultValue: 0.20, branchHint: "Maintain healthy margins without overpricing" },
  weight_location_opportunity: { description: "Bonus for serving underserved areas â€” smaller towns get higher boost", defaultValue: 0.20, branchHint: "Branches in Tier 3/4 cities get a natural advantage" },
  weight_transaction_quality: { description: "How consistent and genuine your transactions are", defaultValue: 0.10, branchHint: "Avoid round-number-only billing and keep refunds low" },
  weight_momentum: { description: "Whether your performance is trending upward day over day", defaultValue: 0.10, branchHint: "Grow steadily â€” even small daily improvements count" },
  weight_ecosystem: { description: "Bonus for referring other branches and helping the community", defaultValue: 0.05, branchHint: "Refer new branches to Kutoot to earn extra points" },
  momentum_ema_alpha: { description: "Speed at which recent performance weighs more than past", defaultValue: 0.3, branchHint: "Recent weeks matter more â€” keep improving" },
  ecosystem_credit_halflife_days: { description: "How long referral bonus lasts (in days)", defaultValue: 30, branchHint: "Referral credit fades over 30 days â€” keep referring" },
  ecosystem_cap_percentage: { description: "Maximum score boost from referrals", defaultValue: 0.05, branchHint: "Referrals can add up to 5% extra to your score" },
  fatigue_threshold_consecutive_periods: { description: "Weeks a top performer stays in top 10 before dampener kicks in", defaultValue: 3, branchHint: "After 3 weeks in Top 10, score growth slows to give others a chance" },
  fatigue_dampener_max: { description: "Maximum score reduction for long-time top performers", defaultValue: 0.15, branchHint: "Top stays accessible to new rising branches" },
  fraud_velocity_multiplier_threshold: { description: "Unusual spike in transactions that triggers a review", defaultValue: 2.0, branchHint: "Sudden 2x jump in daily sales triggers an automatic check" },
  fraud_reversal_rate_threshold: { description: "Too many cancelled/reversed transactions triggers a flag", defaultValue: 0.15, branchHint: "Keep refunds below 15% of total sales" },
  fraud_round_number_concentration_threshold: { description: "Too many â‚¹100, â‚¹500 type transactions triggers a flag", defaultValue: 0.6, branchHint: "Bill exact amounts â€” avoid rounding every bill" },
  location_multiplier_floor: { description: "Score multiplier for metro city branches", defaultValue: 1.0, branchHint: "Metro branches get 1x location score" },
  location_multiplier_ceiling: { description: "Score multiplier for rural/Small town branches", defaultValue: 3.0, branchHint: "Small town branches can get up to 3x location advantage" },
  minimum_cohort_size: { description: "Minimum branches in your category needed for fair comparison", defaultValue: 10, branchHint: "You're compared against similar shops in your area" },
  bayesian_prior_weight_initial: { description: "New branch score protection (higher = more protection)", defaultValue: 0.8, branchHint: "New branches start with a safety net that slowly reduces" },
  bayesian_prior_weight_decay_per_week: { description: "How fast new branch protection reduces each week", defaultValue: 0.1, branchHint: "After 8 weeks, your score is fully based on your own performance" },
  payout_curve_alpha: { description: "How steeply rewards favor top performers", defaultValue: 1.8, branchHint: "Higher rank = much bigger share of the reward pool" },
  payout_minimum_threshold_inr: { description: "Minimum reward amount in â‚¹ (below this = non-cash reward)", defaultValue: 50, branchHint: "Earn above â‚¹50 to receive cash reward" },
};

/**
 * Sub-score display names â€” simple Hindi/English labels
 * that any Indian branch (kirana, pharmacy, restaurant etc.) can understand
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
  location_opportunity: "Bonus score for branches in smaller towns and underserved areas.",
  transaction_quality: "Checks if your bills are genuine â€” consistent amounts, low refunds.",
  momentum: "Are you improving day over day? Even small gains count.",
  ecosystem_contribution: "Extra points for referring other branches to Kutoot.",
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

/** branch-friendly improvement tips keyed by sub-score */
export const IMPROVEMENT_TIPS: Record<string, string[]> = {
  trading_performance: [
    "Try to complete at least 10 transactions every day",
    "Keep your shop open during peak hours (10AMâ€“1PM, 5PMâ€“8PM)",
    "Offer combo deals to increase number of bills per customer",
  ],
  margin_efficiency: [
    "Review your pricing to ensure healthy profit margins",
    "Avoid heavy discounting â€” steady margins score better",
    "Compare your margins with similar shops in the leaderboard",
  ],
  location_opportunity: [
    "This score depends on your area â€” smaller towns get a natural boost",
    "If you serve rural customers, make sure all transactions are on-platform",
    "Your location multiplier is fixed based on your city tier",
  ],
  transaction_quality: [
    "Bill exact amounts instead of rounding to â‚¹100, â‚¹500",
    "Keep refunds and reversals below 15% of your total sales",
    "Maintain consistent daily transaction patterns",
  ],
  momentum: [
    "Try to improve your score even by 1-2 points each day",
    "Consistent small improvements beat one-time spikes",
    "Don't let sales drop suddenly â€” smooth growth is rewarded",
  ],
  ecosystem_contribution: [
    "Refer other branches in your area to join Kutoot",
    "Each successful referral adds bonus points for 30 days",
    "Maximum 5% of your score can come from referrals",
  ],
};

/**
 * Detailed parameter examples for admin info tooltips.
 * Each key maps to a concrete example showing how the parameter affects scoring.
 */
export const PARAMETER_EXAMPLES: Record<string, string> = {
  weight_trading_performance:
    "Example: If a kirana store makes 50 transactions/day (score 80) and weight is 0.35, this contributes 80 Ã— 0.35 = 28 points to the composite score.",
  weight_margin_efficiency:
    "Example: A pharmacy with 22% margin (score 70) and weight 0.20 contributes 70 Ã— 0.20 = 14 points. Overpricing or heavy discounts reduce this.",
  weight_location_opportunity:
    "Example: A Tier 3 branch in Shimla gets 3Ã— location multiplier. With score 60 and weight 0.20, that's 60 Ã— 0.20 = 12 points â€” plus the multiplier boosts the raw sub-score itself.",
  weight_transaction_quality:
    "Example: A branch with 5% refund rate and varied bill amounts scores 85. At weight 0.10, contributes 85 Ã— 0.10 = 8.5 points.",
  weight_momentum:
    "Example: If a branch's 7-day EMA score rose from 55 to 62 (growth), momentum score = 75. At weight 0.10, contributes 7.5 points.",
  weight_ecosystem:
    "Example: A branch that referred 3 active branches gets ecosystem score 60. At weight 0.05, contributes 60 Ã— 0.05 = 3 bonus points.",
  momentum_ema_alpha:
    "Example: With alpha = 0.3, today's score counts 30% and the smoothed historical average counts 70%. A sudden spike from 50 to 80 would show EMA moving to ~59 (not jumping straight to 80).",
  ecosystem_credit_halflife_days:
    "Example: A referral made on March 1 gives full 100% credit. After 30 days (half-life), it drops to 50%. After 60 days, 25%. After 90 days, ~12%.",
  ecosystem_cap_percentage:
    "Example: Even if a branch refers 50 branches, the maximum ecosystem bonus is capped at 5% of composite score â€” so max ~5 extra points on a 100-point scale.",
  fatigue_threshold_consecutive_periods:
    "Example: If threshold = 3 and a branch stays in Top 10 for 3 consecutive weeks, a dampener starts applying from week 4 onwards. Leaving Top 10 for any period resets the counter.",
  fatigue_dampener_max:
    "Example: If max = 0.15 (15%), a branch that's been #1 for 8 straight weeks might see a 12% score reduction. The dampener scales from 3% (week 4) to max 15% (week 8+).",
  fraud_velocity_multiplier_threshold:
    "Example: If threshold = 2.0 and a branch's sector average is 25 transactions/day, any branch hitting 50+ transactions in a day gets auto-flagged for review.",
  fraud_reversal_rate_threshold:
    "Example: If threshold = 0.15 (15%) and a branch has 100 transactions with 18 reversals (18%), they get a fraud flag for abnormal refund patterns.",
  fraud_round_number_concentration_threshold:
    "Example: If threshold = 0.60 and 65% of a branch's bills are exactly â‚¹100, â‚¹200, â‚¹500 etc., they get flagged. Real transactions typically have varied amounts.",
  location_multiplier_floor:
    "Example: A Mumbai (metro) branch gets 1.0Ã— multiplier â€” no extra boost. Their high footfall and market access is already reflected in their raw scores.",
  location_multiplier_ceiling:
    "Example: A Port Blair (Tier 3) branch gets up to 3.0Ã— location score boost, compensating for lower footfall and fewer customers in remote areas.",
  minimum_cohort_size:
    "Example: If minimum = 10 and only 7 electronics shops exist in Jaipur, the system widens the cohort to include neighboring cities until 10+ branches are grouped for fair comparison.",
  bayesian_prior_weight_initial:
    "Example: A brand-new branch (week 1) with prior = 0.8 gets 80% platform-average score + 20% own performance. This prevents unfairly low scores from limited data.",
  bayesian_prior_weight_decay_per_week:
    "Example: With decay = 0.1 per week, a new branch's protection goes: Week 1 = 80%, Week 2 = 70%, Week 3 = 60% ... Week 8 = 0% (fully own performance).",
  payout_curve_alpha:
    "Example: With alpha = 1.8, Rank #1 gets ~3.2Ã— more than Rank #10, and ~8Ã— more than Rank #25. Higher alpha = steeper reward concentration toward top ranks.",
  payout_minimum_threshold_inr:
    "Example: If threshold = â‚¹50, a branch whose calculated payout is â‚¹35 receives a non-monetary reward (badge/recognition) instead of cash. â‚¹50+ gets direct bank transfer.",
};

/**
 * Force Majeure explanations and examples for admin info tooltips.
 */
export const FORCE_MAJEURE_INFO = {
  concept:
    "Force Majeure events are exceptional external circumstances beyond branches' control that unfairly affect their scoring. When an admin declares a Force Majeure event, affected branches receive scoring adjustments so they are not penalized for situations outside their control.",
  event_types: {
    natural_disaster:
      "Natural disasters like floods, cyclones, earthquakes that physically prevent branches from operating. Example: Cyclone Mandous II floods coastal Tamil Nadu â€” 200+ branches can't open shops for 2 weeks. Their scores are protected during this period.",
    civil_disruption:
      "Civil unrest, protests, curfews, bandhs that restrict business operations. Example: A state-wide bandh in Kerala shuts down markets for 3 days â€” branches in affected districts get scoring tolerance.",
    platform_outage:
      "Technical failures in Kutoot's platform, payment gateways, or telecom infrastructure. Example: A telecom outage in North-East India blocks digital payments for a week â€” branches can't record transactions, so baseline correction is applied.",
    macro_economic:
      "Government regulations, tax changes, festive restrictions affecting specific sectors. Example: Gold purchase restrictions during Holi affect jewellery branches â€” their expected revenue dip is accounted for in scoring.",
  },
  adjustment_types: {
    pause:
      "Scoring is completely frozen for affected branches. No score changes (up or down) during the event period. Example: During Bihar floods, merchants in Patna district have scores paused â€” their last pre-flood score is maintained until the event ends.",
    baseline_correction:
      "Merchants' baseline scores are recalculated excluding the affected period. Example: After a 2-week telecom outage, the system recalculates baselines using pre-outage + post-recovery data only, ignoring the disrupted period.",
    tolerance_widening:
      "Score drop thresholds are relaxed â€” branches aren't penalized for expected dips. Example: During Holi gold restrictions, jewellery branches can drop up to 30% in revenue without triggering a negative momentum signal (normal threshold is 10%).",
  },
} as const;

/**
 * Cohort Health explanations for admin info tooltips.
 */
export const COHORT_HEALTH_INFO = {
  concept:
    "Cohort Health monitors scoring fairness at the sector level. Each sector (e.g., Grocery, Electronics, Pharmacy) forms a cohort of similar branches. The health metrics reveal whether scoring is fair across the cohort or if there are systematic biases favoring certain branches.",
  spread:
    "The spread (Î”) measures the gap between top-quartile average and bottom-quartile average scores. A healthy cohort has low spread (â‰¤10 = green), meaning top and bottom branches are relatively close. High spread (>25 = red) suggests scoring may be unfair â€” perhaps location advantage or transaction patterns are creating systemic bias.",
  metrics: {
    avg_score: "The mean composite score across all branches in this sector. A healthy sector typically averages 45â€“65. Very high (>75) or very low (<30) sector averages warrant investigation.",
    branch_count: "Total active branches in this sector. Sectors with fewer than 10 branches may have unreliable statistics due to small sample size.",
    median_score: "The middle score when all branches are sorted. If median is much lower than average, a few top performers are skewing the average up.",
    dormant_count: "Branches with zero or near-zero transaction activity in recent periods. High dormancy may indicate platform engagement issues in this sector.",
    top_quartile_avg: "Average score of branches in the top 25% of this sector. Represents what strong performance looks like in this business category.",
    bottom_quartile_avg: "Average score of branches in the bottom 25%. If this is very low, bottom performers may need targeted support or the scoring formula may disadvantage certain business models.",
  },
} as const;
