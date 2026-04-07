/**
 * Constants: Centralized UI Strings
 *
 * All user-facing text in the application. Change here → reflected everywhere.
 * Organized by page/feature area. Keys are UPPER_SNAKE_CASE for clarity.
 */

// ── Common / Shared ───────────────────────────────────────────────────

export const COMMON = {
  APP_NAME: "Kutoot",
  TAGLINE: "Branch Performance Terminal",
  POWERED_BY: "Powered by Kutoot",
  VERSION: "v1.0.0",
  INDEX_NAME: "Kutoot Branch Index (KBI)",
  INDEX_SHORT: "KBI",

  // Roles
  ROLE_ADMIN: "Admin",
  ROLE_HO: "Head Office",
  ROLE_BRANCH: "Branch",

  // Entity labels
  ENTITY_BRANCH: "Branch",
  ENTITY_BRANCHES: "Branches",
  ENTITY_HO: "Head Office",
  ENTITY_HO_SHORT: "HO",

  // Score labels
  SCORE: "Score",
  RANK: "Rank",
  PAYOUT: "Reward",
  COMPOSITE_SCORE: "Composite Score",

  // Actions
  SAVE: "Save Changes",
  CANCEL: "Cancel",
  CLOSE: "Close",
  EDIT: "Edit",
  DELETE: "Delete",
  SEARCH: "Search",
  FILTER: "Filter",
  APPLY: "Apply",
  RESET: "Reset",
  SUBMIT: "Submit",
  LOADING: "Loading…",

  // Time
  ALL_PERIODS: "All Periods",
  LATEST_PERIOD: "Latest Period",
  SELECT_DATE_RANGE: "Select date range",
  ALL_SECTORS: "All Sectors",
  ALL_TIERS: "All Tiers",
  ALL_STATES: "All States",

  // Status
  ACTIVE: "Active",
  DORMANT: "Dormant",
  SUSPENDED: "Suspended",
  UNDER_REVIEW: "Under Review",

  // Payout status
  PAID: "Paid",
  NON_MONETARY: "Non-monetary",
  NONE: "None",

  // Tier / Level labels (gamified)
  LEVEL_5: "Legend",
  LEVEL_4: "Elite",
  LEVEL_3: "Pro",
  LEVEL_2: "Rising",
  LEVEL_1: "Rookie",
  LEVEL_5_SHORT: "Lv.5",
  LEVEL_4_SHORT: "Lv.4",
  LEVEL_3_SHORT: "Lv.3",
  LEVEL_2_SHORT: "Lv.2",
  LEVEL_1_SHORT: "Lv.1",

  // Market indicator
  BULL: "Bull",
  BEAR: "Bear",
  SIDEWAYS: "Sideways",
  MARKET_BULL_DESC: "Scores trending upward across the platform",
  MARKET_BEAR_DESC: "Scores trending downward across the platform",
  MARKET_SIDEWAYS_DESC: "Scores are stable with minimal movement",
} as const;

// ── Login Page ────────────────────────────────────────────────────────

export const LOGIN = {
  TITLE: "Branch Performance Terminal",
  EMAIL_LABEL: "Email",
  EMAIL_PLACEHOLDER: "you@kutoot.com",
  PASSWORD_LABEL: "Password",
  PASSWORD_PLACEHOLDER: "••••••••",
  SIGN_IN: "Sign In",
  QUICK_ACCESS: "Quick Access",
  QUICK_BRANCH: "Branch",
  QUICK_HO: "Head Office",
  QUICK_ADMIN: "Admin",
  ERROR_DEFAULT: "Login failed",
} as const;

// ── Branch Navigation ─────────────────────────────────────────────────

export const BRANCH_NAV = {
  MY_SHOP: "My Branch",
  RANKINGS: "Rankings",
  MY_PERFORMANCE: "My Performance",
  REWARDS: "Rewards",
} as const;

// ── HO Navigation ─────────────────────────────────────────────────────

export const HO_NAV = {
  PORTFOLIO: "Portfolio",
  RANKINGS: "Rankings",
  ANALYTICS: "Analytics",
  REWARDS: "Payouts",
} as const;

// ── Admin Navigation ──────────────────────────────────────────────────

export const ADMIN_NAV_LABELS = {
  OVERVIEW: "Overview",
  PARAMETERS: "Parameters",
  FRAUD_QUEUE: "Fraud Queue",
  FORCE_MAJEURE: "Force Majeure",
  COHORT_HEALTH: "Cohort Health",
  PAYOUT_SIM: "Payout Sim",
  OVERRIDES: "Overrides",
} as const;

// ── Branch Dashboard ──────────────────────────────────────────────────

export const BRANCH_DASHBOARD = {
  TITLE: "My Branch",
  SUBTITLE: "Your complete performance overview",
  KBI_TITLE: "Kutoot Branch Index (KBI)",
  YOUR_INDEX: "Your Index",
  YOUR_SCORE: "Your Score",
  YOUR_RANK: "Your Rank",
  REWARD_POOL: "Reward Pool",
  YOUR_MONEY_TODAY: "Your Money Today",
  CLOSING_IN: "Closing in",

  // Sub-scores
  SHOP_ACTIVITY: "Shop Activity",
  PROFIT_HEALTH: "Profit Health",
  AREA_ADVANTAGE: "Area Advantage",
  BILLING_QUALITY: "Billing Quality",
  GROWTH_TREND: "Growth Trend",
  COMMUNITY_BONUS: "Community Bonus",

  // Chart
  CHART_CANDLE: "Candle",
  CHART_LINE: "Line",
  CHART_AREA: "Area",
  CHART_BASELINE: "Baseline",
  CHART_4W: "4W",
  CHART_8W: "8W",
  CHART_12W: "12W",
  CHART_ALL: "All",

  // Tips
  TOP_TIPS: "Top Tips to Improve",
  ACHIEVEMENTS: "Achievements",
} as const;

// ── HO Dashboard / Portfolio ──────────────────────────────────────────

export const HO_DASHBOARD = {
  TITLE: "Portfolio",
  SUBTITLE: "Aggregated performance across all your branches",
  PORTFOLIO_VALUE: "Portfolio Value",
  TOTAL_BRANCHES: "Total Branches",
  AVG_SCORE: "Avg Branch Score",
  TOP_PERFORMER: "Top Performer",
  NEEDS_ATTENTION: "Needs Attention",
  HOLDINGS: "Holdings",
  HOLDINGS_SUBTITLE: "Each branch shown as a market position",
  BRANCH_DETAIL: "Branch Detail",
  BEST_PERFORMERS: "Best Performers",
  WORST_PERFORMERS: "Worst Performers",
  TOTAL_PAYOUT: "Total Payout",
  MARKET_CAP: "Market Cap",
  SELECT_BRANCH: "Select a branch to view details",
  NO_BRANCHES: "No branches found",
} as const;

// ── Leaderboard ───────────────────────────────────────────────────────

export const LEADERBOARD = {
  TITLE: "Rankings",
  SUBTITLE_BRANCH: "See how your branch compares with others",
  SUBTITLE_HO: "Compare all branches across the platform",

  COL_RANK: "#",
  COL_BRANCH: "Branch",
  COL_CATEGORY: "Category",
  COL_CITY: "City",
  COL_SCORE: "Score",
  COL_CHANGE: "Change",
  COL_REWARD: "Reward",
  COL_TREND: "Trend",
  COL_MARKET_CAP: "Market Cap",

  YOU_BADGE: "You",
  EMPTY: "No branches found",
  TOGGLE_SCORE: "Score",
  TOGGLE_MARKET_CAP: "Market Cap",
} as const;

// ── Analysis ──────────────────────────────────────────────────────────

export const ANALYSIS = {
  TITLE: "My Performance",
  SUBTITLE: "Understand your score in detail",
  TAB_HISTORY: "My Score History",
  TAB_BREAKDOWN: "Score Breakdown",
  TAB_COMPARE: "Compare With Others",
  SCORE_TREND: "Score Trend",
  BASELINE: "Sector Avg",

  COL_PERIOD: "Period",
  COL_OPEN: "Open",
  COL_HIGH: "High",
  COL_LOW: "Low",
  COL_CLOSE: "Close",
  COL_CHANGE: "Change",
} as const;

// ── Payouts ───────────────────────────────────────────────────────────

export const PAYOUTS = {
  TITLE_BRANCH: "Rewards",
  SUBTITLE_BRANCH: "Your reward history and daily pool",
  TITLE_HO: "Payouts",
  SUBTITLE_HO: "Aggregated payout summary across branches",

  TOTAL_EARNED: "Total Earned",
  PERIODS_REWARDED: "Periods rewarded",
  CURRENT_RANK: "Current rank",
  CURRENT_SCORE: "Current score",

  REWARD_HISTORY: "Reward History",
  COL_PERIOD: "Period",
  COL_SCORE: "Score",
  COL_RANK: "Rank",
  COL_REWARD: "Reward",
  COL_STATUS: "Status",
} as const;

// ── Admin Overview ────────────────────────────────────────────────────

export const ADMIN_OVERVIEW = {
  TITLE: "Admin Overview",
  SUBTITLE: "Platform health & management",

  ACTIVE_BRANCHES: "Active Branches",
  ACTIVE_BRANCHES_TIP: "Total branches actively transacting on the platform in the current scoring period. Excludes suspended and dormant branches.",
  FRAUD_FLAGS_OPEN: "Fraud Flags Open",
  FRAUD_FLAGS_OPEN_TIP: "Number of unresolved fraud flags needing investigation. Flags are auto-generated when transaction patterns exceed velocity, reversal, or round-number thresholds.",
  FORCE_MAJEURE_ACTIVE: "Force Majeure Active",
  FORCE_MAJEURE_ACTIVE_TIP: "Currently active exceptional events (natural disasters, outages, economic disruptions) that are affecting branch scoring. Affected branches receive scoring adjustments during these events.",
  POOL_THIS_PERIOD: "Pool This Period",
  POOL_THIS_PERIOD_TIP: "Total reward money allocated for distribution in the current scoring period. Distributed among qualified branches based on rank and score using a power-law curve.",
  AVG_COMPOSITE_SCORE: "Avg Composite Score",
  AVG_COMPOSITE_SCORE_TIP: "Mean composite score across all active branches for this period. Healthy range is 45–65. Significant deviation indicates systemic scoring shifts.",
  SCORE_STD_DEVIATION: "Score Std Deviation",
  SCORE_STD_DEVIATION_TIP: "Standard deviation of composite scores. Low σ (~5–10) means branches are closely bunched. High σ (>20) means wide performance gaps across branches.",
  FLAGGED_RATE: "Flagged Rate",
  FLAGGED_RATE_TIP: "Percentage of active branches with at least one open fraud flag. Below 5% is healthy. Above 10% may indicate systemic issues with fraud detection sensitivity.",

  ACTIVITY_TITLE: "Activity & Quick Actions",
  FRAUD_FLAGS_NEED_REVIEW: "fraud flags need review",
  FORCE_MAJEURE_EVENTS_ACTIVE: "force majeure events active",
  RUN_PAYOUT_SIM: "Run payout simulation",
} as const;

// ── Admin Parameters ──────────────────────────────────────────────────

export const ADMIN_PARAMETERS = {
  TITLE: "Scoring Parameters",
  SUBTITLE: "Manage 21 scoring configuration values",
  EDIT_TITLE: "Edit Parameter",
  PARAMETER_TIP: "These parameters control how branch scores are calculated. Each value affects different aspects of the composite score formula.",
  COL_PARAMETER: "Parameter",
  COL_VALUE: "Value",
  COL_DESCRIPTION: "Description",
  EXAMPLE_PREFIX: "Example",
} as const;

// ── Admin Fraud Queue ─────────────────────────────────────────────────

export const ADMIN_FRAUD = {
  TITLE: "Fraud Queue",
  SUBTITLE: "Review and manage fraud flags",
  DETAIL_TITLE: "Fraud Flag Details",

  TAB_ALL: "All",
  TAB_OPEN: "Open",
  TAB_INVESTIGATING: "Investigating",
  TAB_RESOLVED: "Resolved",
  TAB_ESCALATED: "Escalated",

  COL_ID: "ID",
  COL_BRANCH: "Branch",
  COL_TYPE: "Type",
  COL_SEVERITY: "Severity",
  COL_STATUS: "Status",
  COL_CREATED: "Created",

  FLAG_TYPE_LABEL: "Flag Type",
  FLAG_TYPE_TIP: "Reclassify the fraud type if the initial auto-detection was incorrect.",
  SEVERITY_LABEL: "Severity",
  SEVERITY_TIP: "Adjust severity based on investigation findings. Critical = immediate action, Low = monitoring only.",
  STATUS_LABEL: "Investigation Status",
  STATUS_TIP: "Update the investigation status. 'Resolved — Genuine' clears the flag; 'Resolved — Fraudulent' triggers penalty actions.",
  ACTION_LABEL: "Action",
  ACTION_TIP: "Monitor = no score impact. Score Hold = freeze score. Score Reduction = penalize. Exclusion = remove from rewards.",
  DETECTION_SIGNAL_LABEL: "Detection Signal",
  DETECTION_SIGNAL_TIP: "Edit the detection signal description to add investigation notes or correct auto-generated text.",

  BTN_SAVE: "Save Changes",
  BTN_CLEAR_GENUINE: "Clear — Genuine",
  BTN_ESCALATE: "Escalate",
  BTN_SUSPEND: "Suspend Branch",

  SEVERITY_LOW: "Low",
  SEVERITY_MEDIUM: "Medium",
  SEVERITY_HIGH: "High",
  SEVERITY_CRITICAL: "Critical",

  FLAG_TYPE_FAKE: "Fake Transaction",
  FLAG_TYPE_REFERRAL: "Referral Loop",
  FLAG_TYPE_SPIKE: "Artificial Spike",
  FLAG_TYPE_DISCOUNT: "Discount Manipulation",
  FLAG_TYPE_INFLATION: "Price Inflation",
  FLAG_TYPE_CATEGORY: "Category Abuse",
  FLAG_TYPE_DORMANCY: "Dormancy Gaming",

  STATUS_OPEN: "Open",
  STATUS_REVIEW: "Under Review",
  STATUS_GENUINE: "Resolved — Genuine",
  STATUS_FRAUDULENT: "Resolved — Fraudulent",

  ACTION_MONITOR: "Monitor",
  ACTION_HOLD: "Score Hold",
  ACTION_REDUCTION: "Score Reduction",
  ACTION_EXCLUSION: "Exclusion",

  EMPTY: "No fraud flags found",
} as const;

// ── Admin Force Majeure ───────────────────────────────────────────────

export const ADMIN_FORCE_MAJEURE = {
  TITLE: "Force Majeure",
  SUBTITLE: "Manage exceptional events affecting scoring",
  NEW_EVENT: "New Event",
  CREATE_TITLE: "Create Force Majeure Event",

  ACTIVE_EVENTS: "Active Events",
  PAST_EVENTS: "Past Events",
  NO_ACTIVE: "No active events",
  NO_ACTIVE_DESC: "No force majeure events currently in effect.",
  NO_PAST: "No past events",
  NO_PAST_DESC: "Historical force majeure events will appear here.",

  EVENT_NAME: "Event Name",
  EVENT_TYPE: "Event Type",
  AFFECTED_LOCATIONS: "Affected Location IDs",
  AFFECTED_LOCATIONS_HINT: "Comma-separated (e.g. loc-001, loc-002)",
  START_DATE: "Start Date",
  END_DATE: "End Date",
  ADJUSTMENT_TYPE: "Adjustment Type",
  CREATE_BTN: "Create Event",

  AFFECTED: "Affected",
  ALL_LOCATIONS: "All locations",
  PERIOD: "Period",
  ADJUSTMENT: "Adjustment",

  TYPE_NATURAL: "Natural Disaster",
  TYPE_CIVIL: "Civil Disruption",
  TYPE_OUTAGE: "Platform Outage",
  TYPE_MACRO: "Macro Economic",

  ADJ_PAUSE: "Pause Scoring",
  ADJ_BASELINE: "Baseline Correction",
  ADJ_TOLERANCE: "Tolerance Widening",
} as const;

// ── Admin Cohort Health ───────────────────────────────────────────────

export const ADMIN_COHORTS = {
  TITLE: "Cohort Health",
  SUBTITLE: "Sector-level performance monitoring",

  AVG_SCORE: "Avg Score",
  BRANCHES: "Branches",
  MEDIAN: "Median",
  DORMANT: "Dormant",
  TOP_Q_AVG: "Top Q Avg",
  BOTTOM_Q_AVG: "Bottom Q Avg",
  SPREAD: "Spread",

  NO_DATA: "No cohort data",
  NO_DATA_DESC: "Sector cohort health data will appear once scoring periods are calculated.",
} as const;

// ── Admin Payout Sim ──────────────────────────────────────────────────

export const ADMIN_PAYOUTS = {
  TITLE: "Payout Simulation",
  SUBTITLE: "Model payout distributions before committing",
  TITLE_TIP: "Payout simulation models how the reward pool is distributed among branches using a power-law curve. Adjust the pool amount and alpha exponent to see how payouts shift. No changes are committed until you approve.",

  SIMULATION_CONTROLS: "Simulation Controls",
  PERIOD_LABEL: "Period",
  POOL_LABEL: "Pool Amount (₹)",
  ALPHA_LABEL: "Alpha (power-law)",
  MIN_THRESHOLD_LABEL: "Min Threshold (₹)",
  RUN_SIM: "Run Simulation",

  TOTAL_POOL: "Total Pool",
  QUALIFIED_BRANCHES: "Qualified Branches",
  MIN_PAYOUT: "Min Payout",

  DISTRIBUTION: "Payout Distribution",
  COL_RANK: "#",
  COL_BRANCH: "Branch",
  COL_SCORE: "Score",
  COL_PAYOUT: "Payout",

  NO_RESULTS: "No results",
  NO_RESULTS_DESC: "Run a simulation to see payout distribution.",
} as const;

// ── Admin Overrides ───────────────────────────────────────────────────

export const ADMIN_OVERRIDES = {
  TITLE: "Manual Overrides",
  SUBTITLE: "Adjust branch scores for exceptional circumstances",
  TITLE_TIP: "Select one or more branches from the dropdown, choose the scoring period, enter the override score (0–100), and provide a reason. All overrides are logged for audit.",

  NEW_OVERRIDE: "New Override",
  SELECT_BRANCHES: "Select Branches",
  SELECT_BRANCHES_TIP: "Choose one or more branches to apply the same override score. Use search to filter the list.",
  SCORING_PERIOD: "Scoring Period",
  SCORING_PERIOD_TIP: "Select the scoring period to apply the override for.",
  OVERRIDE_SCORE: "Override Score (0–100)",
  REASON: "Reason",
  REASON_PLACEHOLDER: "Explain why this override is necessary…",
  APPLY_BTN: "Apply Override",

  HISTORY_TITLE: "Override History",
  COL_BRANCH: "Branch",
  COL_ORIGINAL: "Original Score",
  COL_OVERRIDE: "Override Score",
  COL_REASON: "Reason",
  COL_APPLIED_BY: "Applied By",
  COL_DATE: "Date",

  EMPTY: "No overrides yet",
  EMPTY_DESC: "Manual score overrides will appear here once applied. This feature is under development.",

  ABOUT_TITLE: "About Manual Overrides",
  ABOUT_DESC: "Manual overrides allow administrators to adjust branch scores for exceptional circumstances not covered by the automated scoring system. Common use cases include data migration issues, system errors affecting transaction records, or verified disputes. All overrides are logged with the administrator's identity, timestamp, and reasoning for audit purposes.",
} as const;

// ── Achievements ──────────────────────────────────────────────────────

export const ACHIEVEMENTS = {
  FIRST_TRADE: "First Trade",
  FIRST_TRADE_DESC: "Complete your first recorded transaction",
  HOT_STREAK: "Hot Streak",
  HOT_STREAK_DESC: "Score increased 5 consecutive periods",
  TOP_TEN: "Top 10",
  TOP_TEN_DESC: "Reached the top 10 in rankings",
  CENTURY_CLUB: "Century Club",
  CENTURY_CLUB_DESC: "Achieved a score above 90",
  REFERRAL_KING: "Referral King",
  REFERRAL_KING_DESC: "Successfully referred 3+ branches",
  COMEBACK_KID: "Comeback Kid",
  COMEBACK_KID_DESC: "Recovered from bottom quartile to top half",
  MARKET_MOVER: "Market Mover",
  MARKET_MOVER_DESC: "Highest transaction volume in your sector",
} as const;
