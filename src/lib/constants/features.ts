/**
 * Merchant panel feature flags (keep aligned with kutoot config/kutoot.php).
 */
export const MERCHANT_DEALS_ENABLED = false;
export const DISCOUNT_HEALTH_ENABLED = true;

/** Matches kutoot `ScoringComponents::discountHealthConfigurable()`. */
export const DISCOUNT_HEALTH_CONFIGURABLE =
  DISCOUNT_HEALTH_ENABLED && MERCHANT_DEALS_ENABLED;
