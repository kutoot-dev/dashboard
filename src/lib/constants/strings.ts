/**
 * Constants: Centralized UI Strings
 *
 * All user-facing text in the application. Change here → reflected everywhere.
 * Organized by page/feature area. Keys are UPPER_SNAKE_CASE for clarity.
 */

// ── Common / Shared ───────────────────────────────────────────────────

export const COMMON = {
  APP_NAME: "Kutoot Business",
  TAGLINE: "Branch Performance Terminal",
  POWERED_BY: "Powered by Kutoot Business",
  VERSION: "v1.0.0",
  INDEX_NAME: "Kutoot Business Branch Index (KBI)",
  INDEX_SHORT: "KBI",

  // Roles
  ROLE_BRANCH: "Branch",

  // Entity labels
  ENTITY_BRANCH: "Branch",
  ENTITY_BRANCHES: "Branches",

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
  ERROR_DEFAULT: "Login failed",
} as const;

// ── Branch Navigation ─────────────────────────────────────────────────

export const BRANCH_NAV = {
  MY_SHOP: "My Branch",
  RANKINGS: "Rankings",
  MY_PERFORMANCE: "My Performance",
  REWARDS: "Rewards",
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
