# Kutoot Platform — Complete System Audit

**Date:** April 6, 2026
**Purpose:** Full technical breakdown of all existing platform logic before introducing the "Store Value (₹1 base growing model)" feature.
**Scope:** Every scoring formula, ranking algorithm, fraud rule, data model, API route, and edge-case handler currently implemented.

---

## Table of Contents

1. [Performance Parameters Currently Used](#1-performance-parameters-currently-used)
2. [Weightage System](#2-weightage-system)
3. [Reward / Winner Logic](#3-reward--winner-logic)
4. [Anti-Cheat / Fraud Prevention](#4-anti-cheat--fraud-prevention)
5. [User Segmentation Logic](#5-user-segmentation-logic)
6. [Merchant Ranking Logic](#6-merchant-ranking-logic)
7. [Data Update Frequency](#7-data-update-frequency)
8. [Existing Gamification Logic](#8-existing-gamification-logic)
9. [Database / API Structure](#9-database--api-structure)
10. [Edge Cases & Safeguards](#10-edge-cases--safeguards)

---

## 1. Performance Parameters Currently Used

The platform tracks **6 core sub-score parameters** that feed into a single `composite_index_score` (0–100 scale). Each parameter is independently scored 0–100, then weighted and summed.

### 1.1 Trading Performance (Shop Activity)

| Field | Detail |
|---|---|
| **What it measures** | Daily transaction count + revenue volume |
| **Raw inputs** | `raw_transaction_volume` (integer count), `raw_revenue` (₹ sum of `amount_net` from transactions table) |
| **Normalization** | Log-normalized: `log_normalized_volume = log(raw_transaction_volume + 1)`, `log_normalized_revenue = log(raw_revenue + 1)` |
| **Why log** | Prevents large merchants from dominating — a kirana with 300 txns/day and an electronics store with 10 txns/day are compared fairly |
| **Intermediate fields** | `percentile_scale_score` (percentile rank across all merchants for the period) |
| **Data source** | `transactions` table — every transaction with `is_flagged = false` for the merchant in the scoring period |
| **DB columns used** | `transactions.amount_net`, `transactions.transaction_timestamp`, `transactions.merchant_id` |
| **Merchant hint** | "Sell more items each day to improve this" |

### 1.2 Margin Efficiency (Profit Health)

| Field | Detail |
|---|---|
| **What it measures** | Whether the merchant maintains healthy profit margins without overpricing |
| **Raw inputs** | `margin_efficiency_ratio` — computed as `(amount_gross - amount_net) / amount_gross` aggregated across period transactions |
| **Scoring logic** | Compared against sector-specific margin bands: `sectors.typical_margin_floor` and `sectors.typical_margin_ceiling`. Merchants within band score highest; below floor = underpricing, above ceiling = overpricing |
| **Intermediate fields** | `margin_neutralized_score = composite * (0.8 + margin_efficiency_ratio * 0.4)` |
| **Sector normalization** | `sector_zscore = (composite - 50) / 15` — Z-score relative to sector mean. `sector_percentile_rank` derived from Z-score |
| **Data source** | `transactions.amount_gross`, `transactions.amount_net` aggregated per period |
| **Special handling** | Merchants with `is_regulated_margin = true` (pharmacies, dairy) use relaxed margin evaluation since margins are government-controlled |

### 1.3 Location Opportunity (Area Advantage)

| Field | Detail |
|---|---|
| **What it measures** | Bonus for merchants in underserved areas — smaller towns get higher multiplier |
| **Raw inputs** | `locations.location_opportunity_index` (0–1), `locations.average_daily_footfall_multiplier`, `locations.purchasing_power_index` |
| **Scoring formula** | `location_opportunity_multiplier` ranges from `location_multiplier_floor` (1.0 for metro) to `location_multiplier_ceiling` (3.0 for rural) |
| **City tier mapping** | Metro: 1.0x, Tier1: 1.12–1.25x, Tier2: 1.40–1.60x, Tier3: 1.80–2.20x, Rural: 2.40–2.60x |
| **Intermediate fields** | `location_adjusted_score = composite * location_opportunity_multiplier`, `opportunity_normalized_score = clamp(location_adjusted_score / 2.5, 0, 100)` |
| **Data source** | `locations` table — static data updated periodically |
| **Merchant hint** | "Merchants in Tier 3/4 cities get a natural advantage" |

### 1.4 Transaction Quality (Billing Quality)

| Field | Detail |
|---|---|
| **What it measures** | Genuine, consistent billing patterns — flags round-number-only billing and high refund rates |
| **Raw inputs** | Transaction amount distribution analysis, refund/reversal rates, transaction timing patterns |
| **Key thresholds** | Round number concentration: if >60% of transactions are round numbers (₹100, ₹500), flag triggers. Reversal rate: if >15% of transactions are refunds/reversals, flag triggers |
| **Intermediate fields** | `transaction_pattern_quality_score` (0–100) |
| **Data source** | `transactions.amount_gross`, `transactions.transaction_type` (standard/refund/reversal), `transactions.is_flagged` |
| **Merchant hint** | "Bill exact amounts instead of rounding to ₹100, ₹500" |

### 1.5 Momentum (Growth Trend)

| Field | Detail |
|---|---|
| **What it measures** | Whether performance is trending upward day over day |
| **Raw inputs** | Score trajectory across consecutive periods |
| **Algorithm** | Exponential Moving Average (EMA) with `momentum_ema_alpha = 0.3` — recent weeks weigh more than past |
| **Formula** | `EMA_t = α × Score_t + (1 - α) × EMA_{t-1}` where `α = 0.3` |
| **Intermediate fields** | `momentum_score` (0–100) |
| **Data source** | `merchant_scores` table — historical composite scores across periods |
| **Merchant hint** | "Grow steadily — even small daily improvements count" |

### 1.6 Ecosystem Contribution (Community Bonus)

| Field | Detail |
|---|---|
| **What it measures** | Referral activity — referring other merchants or users to the platform |
| **Raw inputs** | `referral_events` table — `credit_value_initial`, `credit_value_current`, `decay_factor_applied` |
| **Decay model** | Exponential decay with `ecosystem_credit_halflife_days = 30`. Formula: `credit_value_current = credit_value_initial × decay_factor_applied`. Decay factor decreases over time |
| **Cap** | `ecosystem_cap_percentage = 0.05` — maximum 5% boost to composite score from referrals |
| **Flagged networks** | Referrals in `is_in_flagged_network = true` receive `credit_value_current = 0.0` and `decay_factor_applied = 0.0` (zeroed out) |
| **Credit values** | Merchant-to-merchant referral: initial credit = 2.5. Merchant-to-user referral: initial credit = 1.5 |
| **Intermediate fields** | `ecosystem_contribution_score` (0–100) |
| **Data source** | `referral_events` table |

---

## 2. Weightage System

### 2.1 Composite Score Formula

The `composite_index_score` is a weighted sum of 6 sub-scores:

```
composite_index_score = (
    0.35 × trading_performance      +    // Shop Activity
    0.20 × margin_efficiency         +    // Profit Health
    0.20 × location_opportunity      +    // Area Advantage
    0.10 × transaction_quality       +    // Billing Quality
    0.10 × momentum                  +    // Growth Trend
    0.05 × ecosystem_contribution         // Community Bonus
)
```

**Range:** 0–100 (clamped)

### 2.2 Weight Distribution Table

| Parameter | Weight | % Contribution | Configurable Key |
|---|---|---|---|
| Trading Performance | 0.35 | 35% | `weight_trading_performance` |
| Margin Efficiency | 0.20 | 20% | `weight_margin_efficiency` |
| Location Opportunity | 0.20 | 20% | `weight_location_opportunity` |
| Transaction Quality | 0.10 | 10% | `weight_transaction_quality` |
| Momentum | 0.10 | 10% | `weight_momentum` |
| Ecosystem Contribution | 0.05 | 5% | `weight_ecosystem` |
| **Total** | **1.00** | **100%** | |

### 2.3 Dynamic Weight Adjustments

Currently, **no dynamic weight adjustments** are implemented. All weights are stored as static parameters in the `scoring_parameters` table and can only be changed by an admin via the `PUT /api/admin/parameters` endpoint.

The system is **designed for** dynamic adjustments (the `effective_from` timestamp on each parameter supports scheduled changes) but the actual recalculation logic does not currently detect or apply weight schedule changes.

### 2.4 Scoring Parameter Configuration (All 21 Parameters)

```
weight_trading_performance        = 0.35    // Main weight
weight_margin_efficiency          = 0.20    // Main weight
weight_location_opportunity       = 0.20    // Main weight
weight_transaction_quality        = 0.10    // Main weight
weight_momentum                   = 0.10    // Main weight
weight_ecosystem                  = 0.05    // Main weight

momentum_ema_alpha                = 0.30    // EMA smoothing factor
ecosystem_credit_halflife_days    = 30      // Referral credit decay period
ecosystem_cap_percentage          = 0.05    // Max 5% boost from referrals

fatigue_threshold_consecutive_periods = 3   // Weeks before dampener kicks in
fatigue_dampener_max              = 0.15    // Max 15% score reduction

fraud_velocity_multiplier_threshold   = 2.0 // 2× daily average triggers alert
fraud_reversal_rate_threshold         = 0.15 // 15% refund rate triggers flag
fraud_round_number_concentration_threshold = 0.60 // 60% round numbers triggers alert

location_multiplier_floor         = 1.0     // Metro cities
location_multiplier_ceiling       = 3.0     // Rural areas

minimum_cohort_size               = 10      // Min merchants for fair comparison
bayesian_prior_weight_initial     = 0.8     // New merchant score protection
bayesian_prior_weight_decay_per_week = 0.1  // Protection reduces 10%/week
                                            // (fully own-performance after 8 weeks)

payout_curve_alpha                = 1.8     // Steepness of reward distribution
payout_minimum_threshold_inr      = 50      // Below ₹50 = non-cash reward
```

---

## 3. Reward / Winner Logic

### 3.1 Scoring Period System

| Field | Current Configuration |
|---|---|
| Period type | **Daily** (`period_type = "daily"`) |
| Period duration | 24 hours (midnight to midnight UTC) |
| States | `open` → `calculating` → `closed` |
| Pool amounts | Days 1–10: ₹50,000; Days 11–20: ₹55,000; Days 21–30: ₹60,000 |
| Current mock | 30 daily periods from 2026-03-08 to 2026-04-06 |

### 3.2 Winner Selection — **Deterministic** (Not Random)

Winners are selected **purely by rank** based on `composite_index_score`. There is **no randomness, lottery, or probability** in the current system.

**Ranking algorithm:**
```pseudo
FOR each period:
    1. Collect all merchant_scores WHERE period_id = current_period
    2. SORT by composite_index_score DESC
    3. ASSIGN final_rank = position (1-indexed)
    4. CALCULATE rank_movement = previous_period_rank - current_rank
       (positive = moved up)
```

### 3.3 Payout Distribution Formula

**Simple proportional distribution** used in the API simulation endpoint:

```pseudo
payout_i = pool_amount × (score_i / sum_of_all_scores)
```

Where `score_i` = `composite_index_score` for merchant `i` among the top `N` merchants.

**Currently implemented in mock data (scores.ts):**
```pseudo
IF composite_index_score > 55:
    payout = 100 + (composite_index_score - 55) × 50
ELSE:
    payout = 0
```

**Payout simulation endpoint** (`POST /api/admin/payouts/simulate`) uses:
```pseudo
FOR top_n merchants sorted by rank:
    payout = pool_amount × (merchant_score / total_score_sum)
```

Optional parameters:
- `pool_override` — test with different pool size
- `top_n` — limit payout recipients (default: 50)

### 3.4 Payout Tiers

| Status | Condition | Reward Type |
|---|---|---|
| `paid` | `payout_amount >= ₹50` | Cash reward |
| `non_monetary` | `payout_amount > 0 AND < ₹50` | Non-cash reward (badges, features) |
| `none` | `payout_amount = 0` | No reward |

The `payout_minimum_threshold_inr = 50` parameter controls the cash/non-cash boundary.

### 3.5 Preventing Repeated Winners — Fatigue Dampener System

The system actively prevents the same merchants from winning repeatedly:

**Fatigue dampener logic:**
```pseudo
IF merchant has been in Top 10 for >= fatigue_threshold_consecutive_periods (3 weeks):
    fatigue_dampener_applied = true
    fatigue_dampener_value = random(0.03, 0.13)  // 3–13% reduction
    // Max possible reduction: fatigue_dampener_max = 15%
    
    adjusted_score = composite_score × (1 - fatigue_dampener_value)
```

**Currently in mock data:**
```typescript
const isFatigued = merchantIndex < 5 && p > 20;
// Top 5 merchants AND period index > 20 (i.e., after 20+ consecutive periods)
const fatigueValue = isFatigued ? round2(0.03 + rng() * 0.10) : 0;
```

**Merchant-facing message:** "After 3 weeks in Top 10, score growth slows to give others a chance"

### 3.6 Payout Curve

The `payout_curve_alpha = 1.8` parameter is defined but **not yet applied** in the current payout simulation. It is intended to create a power-law distribution where top ranks get disproportionately more:

```pseudo
// Intended formula (not yet implemented):
weight_i = (1 / rank_i) ^ alpha
payout_i = pool × (weight_i / sum(all_weights))
```

---

## 4. Anti-Cheat / Fraud Prevention

### 4.1 Fraud Flag Types (7 Categories)

| Flag Type | Detection Signal | Threshold/Logic |
|---|---|---|
| `fake_transaction` | Transaction velocity above sector mean; identical amounts from few device fingerprints; burst transactions from same IP | Velocity >2× sector mean in time window; sequential IDs with identical amounts |
| `referral_loop` | Circular referral chains detected via graph analysis | A→B→C→A within 48 hours; network analysis showing mutual referrals within same week |
| `artificial_spike` | Revenue/volume spike without corresponding footfall increase | >420% week-over-week revenue spike; >2.8× above 4-week rolling average; spikes concentrated in final 2 days of period |
| `discount_manipulation` | Extreme discount patterns; discount code usage far above sector average | 99% discount on high-value items; discount codes on 78% of transactions vs 12% sector avg |
| `price_inflation` | Sudden average ticket size jump without justification | Ticket size jump from ₹12,000 to ₹48,000; consistent surcharges on all transactions |
| `category_abuse` | Merchant categorized in wrong sector to exploit easier competition | 92% of SKUs match different sector profile; transaction patterns inconsistent with declared category |
| `dormancy_gaming` | Go dormant then burst activity to exploit new-merchant bonuses | Dormant for 6+ periods then sudden burst matching top-performer pattern; new merchant with suspiciously perfect distribution |

### 4.2 Severity Levels and Actions

| Severity | Action Taken | Effect |
|---|---|---|
| `low` | `monitor` | Watchlist only — no score impact |
| `medium` | `monitor` or `score_hold` | Score frozen at previous period value, or watchlist |
| `high` | `score_hold` or `score_reduction` | Score frozen or actively reduced |
| `critical` | `exclusion` | Merchant excluded from leaderboard and payouts entirely |

### 4.3 Investigation Workflow

```
open → under_review → resolved_genuine OR resolved_fraudulent
```

| Status | Meaning |
|---|---|
| `open` | Flag raised, not yet reviewed |
| `under_review` | Admin investigating |
| `resolved_genuine` | False positive — activity was legitimate |
| `resolved_fraudulent` | Confirmed fraud — action enforced |

### 4.4 Fraud Detection Thresholds (from scoring_parameters)

```
fraud_velocity_multiplier_threshold         = 2.0
    → Sudden 2× jump in daily sales triggers automatic review

fraud_reversal_rate_threshold               = 0.15
    → Keep refunds below 15% of total sales

fraud_round_number_concentration_threshold  = 0.60
    → If 60%+ of transactions are round numbers (₹100, ₹500, etc.), flag raised
```

### 4.5 Referral Fraud Handling

- Circular referral chains (A→B→C→A) are detected via network graph analysis
- Flagged networks have all credits zeroed: `credit_value_current = 0.0`, `decay_factor_applied = 0.0`
- Referral events carry `is_in_flagged_network` boolean
- Example: Merchants `m-042 → m-044 → m-043 → m-042` formed a circular referral loop within 48 hours — all flagged as `referral_loop`, severity `high`, action `score_reduction`

### 4.6 Bot Traffic / Duplicate Handling

| Signal | Detection |
|---|---|
| Same IP subnet | "Burst of 45 transactions in 12 minutes; all from same IP subnet" |
| Device fingerprints | "Sequential transaction IDs with identical amounts from 3 unique device fingerprints" |
| IP geolocation mismatch | "Remote location merchant showing metro-level transaction density; IP geolocation mismatch" |
| Customer hash analysis | `transactions.customer_identifier_hash` — hashed customer ID to detect repeat fake customers |

### 4.7 Transaction-Level Flags

Each transaction carries:
- `is_flagged: boolean` — whether this specific transaction is flagged
- `flag_reason: string | null` — reason for flagging
- `is_platform_originated: boolean` — whether the transaction came through the Kutoot platform

Flagged transactions are excluded from scoring calculations.

### 4.8 Current Fraud Data (18 flags across system)

| Type | Count | Critical | High | Medium | Low |
|---|---|---|---|---|---|
| fake_transaction | 3 | 1 | 1 | 1 | 0 |
| referral_loop | 3 | 1 | 1 | 1 | 0 |
| artificial_spike | 4 | 0 | 2 | 1 | 1 |
| discount_manipulation | 2 | 0 | 0 | 1 | 1 |
| price_inflation | 2 | 0 | 1 | 1 | 0 |
| category_abuse | 2 | 0 | 0 | 1 | 1 |
| dormancy_gaming | 2 | 0 | 0 | 1 | 1 |

---

## 5. User Segmentation Logic

### 5.1 New vs Returning Merchants — Bayesian Prior Protection

New merchants receive a **Bayesian prior protection** that prevents their scores from being unfairly volatile during the early weeks:

```pseudo
effective_score = (bayesian_prior_weight × platform_average) + ((1 - bayesian_prior_weight) × raw_score)

bayesian_prior_weight = max(0, initial_weight - (weeks_active × decay_per_week))
```

**Parameters:**
```
bayesian_prior_weight_initial         = 0.8   // 80% protection initially
bayesian_prior_weight_decay_per_week  = 0.1   // Reduces by 10% per week
// Fully own-performance after: 0.8 / 0.1 = 8 weeks
```

**Timeline:**
| Week | Prior Weight | Own Performance Weight |
|---|---|---|
| 1 | 0.80 | 0.20 |
| 2 | 0.70 | 0.30 |
| 3 | 0.60 | 0.40 |
| 4 | 0.50 | 0.50 |
| 5 | 0.40 | 0.60 |
| 6 | 0.30 | 0.70 |
| 7 | 0.20 | 0.80 |
| 8 | 0.10 | 0.90 |
| 9+ | 0.00 | 1.00 |

### 5.2 Merchant Status Segmentation

| Status | Meaning | Count in System |
|---|---|---|
| `active` | Currently operating, scores calculated | 48 |
| `dormant` | No recent activity | 0 (tracked) |
| `suspended` | Excluded from scoring due to fraud | 1 (m-050) |
| `under_review` | Flagged, pending investigation | 1 (m-012) |

### 5.3 Business Type Segmentation

Merchants are categorized by business type, affecting scoring norms:

| Type | Description | Examples |
|---|---|---|
| `goods` | Physical product sellers | Kirana, pharmacy, electronics, jewellery |
| `services` | Service providers | Restaurants, food services |
| `hybrid` | Both goods and services | Mobile/telecom shops, general merchandise |
| `b2b` | Business-to-business | (Defined, not currently used) |
| `subscription` | Recurring revenue | (Defined, not currently used) |
| `seasonal` | Seasonal business patterns | (Defined, not currently used) |

### 5.4 Transaction Pattern Segmentation

| Pattern | Description | Typical Sectors |
|---|---|---|
| `high_frequency_low_value` | Many small transactions | Kirana, dairy, bakery, restaurant |
| `low_frequency_high_value` | Few large transactions | Electronics, jewellery, fashion, hardware |
| `subscription` | Recurring transactions | (Defined, not currently used) |
| `bundled` | Bundle/package transactions | (Defined, not currently used) |

### 5.5 City Tier Segmentation

| Tier | Cities (Count) | Opportunity Index Range | Footfall Multiplier | Location Score Multiplier |
|---|---|---|---|---|
| `metro` | Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad (6) | 0.88–0.95 | 1.0x | ~1.0x |
| `tier1` | Pune, Ahmedabad, Jaipur, Lucknow, Chandigarh, Indore, Kochi, Surat (8) | 0.75–0.83 | 1.12–1.25x | ~1.2x |
| `tier2` | Bhopal, Ranchi, Guwahati, Varanasi, Coimbatore, Vizag, Patna, Dehradun (8) | 0.50–0.68 | 1.40–1.60x | ~1.5x |
| `tier3` | Shimla, Imphal, Gangtok, Port Blair (4) | 0.28–0.40 | 1.80–2.20x | ~2.0x |
| `rural` | Daman, Silvassa, Aizawl, Agartala (4) | 0.20–0.25 | 2.40–2.60x | ~2.5x |

### 5.6 Sector-Based Cohort Health (Admin Feature)

Admin dashboard provides per-sector aggregate metrics:
```
For each sector:
  - merchant_count
  - avg_score (mean composite_index_score)
  - median_score
  - top_quartile_avg (top 25% average)
  - bottom_quartile_avg (bottom 25% average)
  - dormant_count
```

---

## 6. Merchant Ranking Logic

### 6.1 Primary Ranking — Composite Score Descending

```sql
RANK() OVER (ORDER BY composite_index_score DESC)
```

All 50 merchants are ranked each period. Rank 1 = highest score. Tied scores get sequential ranks (no gap handling in current implementation).

### 6.2 Rank Movement Computation

```pseudo
rank_movement = previous_period_rank - current_period_rank
// positive = moved up, negative = moved down
```

### 6.3 Rank Tier Classification (Gamification Badges)

```typescript
type RankTier = "platinum" | "gold" | "silver" | "bronze" | "none";
```

Tiers are computed in UI based on rank percentile among total merchants (50):
- **Platinum:** Top ~5% (Rank 1–2)
- **Gold:** Top ~15% (Rank 3–7)
- **Silver:** Top ~30% (Rank 8–15)
- **Bronze:** Top ~50% (Rank 16–25)
- **None:** Below 50% (Rank 26+)

### 6.4 Trending / Featured Logic — Ticker Tape

The **Ticker** system shows the "biggest movers" — merchants with the largest absolute score change between periods:

```pseudo
FOR each merchant:
    score_change = current_period_score - previous_period_score
    change_percent = (change / previous_score) × 100
    rank_change = previous_rank - current_rank

SORT by |score_change| DESC
```

Ticker refreshes every 30 seconds in the UI (`refetchInterval: 30_000`).

Suspended merchants (`status = "suspended"`) are excluded from the ticker.

### 6.5 Leaderboard Filtering

The leaderboard API supports filtering by:
- `period_id` — specific scoring period (defaults to latest closed)
- `city_tier` — metro, tier1, tier2, tier3, rural
- `state` — Indian state name
- Pagination: `page` + `limit` (max 100 per page)

### 6.6 Sector-Relative Ranking

Each merchant also has a **sector percentile rank** (`sector_percentile_rank`):
```pseudo
sector_zscore = (composite - 50) / 15
sector_percentile_rank = clamp(50 + sector_zscore × 20, 1, 99)
```

This shows where the merchant stands relative to their business category (e.g., "Top 15% of all Kiranas").

---

## 7. Data Update Frequency

### 7.1 Scoring Period Cadence

| Setting | Current Value |
|---|---|
| Period type | `daily` |
| Period duration | 24 hours |
| Period lifecycle | `open` → `calculating` → `closed` |
| Pool escalation | ₹50K (week 1) → ₹55K (week 2-3) → ₹60K (week 3-4) |

### 7.2 Real-Time Updates (Client-Side Simulation)

| Feature | Update Interval | Implementation |
|---|---|---|
| Live Score (useLiveScore) | Every **2 seconds** | Client-side random jitter ±0.5 around base score |
| Live Leaderboard (useLiveLeaderboard) | Every **3 seconds** | Re-jitters all leaderboard scores by ±0.2 |
| KMI (Kutoot Merchant Index) | Every **2 seconds** | Client-side EMA with slight upward bias `(random - 0.48) × 2.0` |
| Ticker Tape | Every **30 seconds** | Refetches from API via React Query |
| Countdown Timer | Every **1 second** | Countdown to 11:00 PM IST (target scoring hour) |

**Important: All "live" updates are currently client-side simulations.** The server returns static period-based scores; the UI adds jitter for the trading-terminal feel.

### 7.3 Server-Side Data (API Refresh)

| Endpoint | Caching Strategy |
|---|---|
| `/api/leaderboard` | Per-period (scores are immutable once closed) |
| `/api/merchants/[id]/score` | Defaults to latest closed period if no period_id |
| `/api/ticker` | Should be cached per period |
| `/api/scores/periods` | Rarely changes |
| `/api/admin/*` | No caching (admin operations) |

### 7.4 Batch Processing Model

There are **no cron jobs or streaming pipelines** currently implemented. The system operates on a **batch-per-period** model:

```
1. Period opens (status = "open")
2. Transactions accumulate during the period
3. Period transitions to "calculating"
4. Score computation runs (currently mocked, would be a batch job)
5. Period transitions to "closed"
6. Scores become immutable and queryable
```

The `scoring_periods` table tracks this lifecycle. In the current implementation, all 30 periods are pre-generated with mock data.

---

## 8. Existing Gamification Logic

### 8.1 TradingView-Style Chart Terminal

The entire dashboard is themed as a **financial trading terminal** (like Zerodha/Groww):

| Feature | Implementation |
|---|---|
| **Candlestick Charts** | OHLC data from score history. Open = previous close, Close = current score, High/Low = max/min with random variance |
| **Volume Histogram** | Transaction count per period. Green bar = score went up, Red bar = score went down |
| **Area Charts** | Score trend as filled area chart |
| **Baseline Charts** | Score vs sector average (dashed line) |
| **Chart Type Switcher** | candle / line / area / baseline |
| **Time Range Selector** | 4W / 8W / 12W / All |

### 8.2 Kutoot Merchant Index (KMI)

A **platform-wide index** (like Sensex/Nifty) that shows aggregate merchant health:

```pseudo
KMI base = 1000 + average_composite_offset (~247)
KMI_current = 1247 (base)

Update every 2 seconds:
    delta = (random() - 0.48) × 2.0    // slight upward bias
    KMI_new = KMI_old + delta
    
Personal Index = 1000 + (merchant_score × 2.47)
```

### 8.3 Rank Badge System

| Badge | Criteria | Visual |
|---|---|---|
| Platinum | Top ~5% | Platinum-colored badge |
| Gold | Top ~15% | Gold-colored badge |
| Silver | Top ~30% | Silver-colored badge |
| Bronze | Top ~50% | Bronze-colored badge |
| None | Bottom 50% | No badge |

### 8.4 Leaderboard with Live Scoring

- Full leaderboard table with rank, name, sector, city, score, change, reward, sparkline
- Current merchant highlighted with accent color and "You" badge
- Live score jitter simulates real-time competition feel
- Sparkline chart shows score trajectory for each merchant

### 8.5 Improvement Suggestions

The system identifies the **3 weakest sub-scores** and provides actionable tips:

```pseudo
weakest = sort(sub_scores, ascending).slice(0, 3)

improvement_tips = {
  trading_performance: [
    "Try to complete at least 10 transactions every day",
    "Keep your shop open during peak hours (10AM–1PM, 5PM–8PM)",
    "Offer combo deals to increase number of bills per customer"
  ],
  margin_efficiency: [
    "Review your pricing to ensure healthy profit margins",
    "Avoid heavy discounting — steady margins score better",
    "Compare your margins with similar shops in the leaderboard"
  ],
  // ... (all 6 sub-scores have 3 tips each)
}
```

### 8.6 Parameter Meters

Visual progress bars for each sub-score showing:
- Parameter name (merchant-friendly label)
- Score value (0–100)
- Weight percentage
- Description tooltip

### 8.7 Reward Pool Visualization

- Daily pool amount displayed (₹50K–₹60K)
- Estimated merchant share calculated as: `pool × (1 / rank) × 0.3`
- Countdown timer to next payout (11:00 PM IST)

### 8.8 Score History Table

Period-by-period OHLC table showing:
- Period date
- Open / High / Low / Close scores
- Change from previous period

### 8.9 Merchant Archetypes (For Varied Chart Patterns)

Each merchant is assigned a "personality" for realistic chart diversity:

| Archetype | Base Score | Drift/Period | Volatility | Chart Pattern |
|---|---|---|---|---|
| `bull` | 55–75 | +2.0 | 4.0 | Steady uptrend |
| `bear` | 30–50 | -1.8 | 3.5 | Steady downtrend |
| `volatile` | 40–65 | 0.0 | 8.0 | Wild swings |
| `steady` | 50–65 | +0.3 | 2.0 | Flat with small gains |
| `comeback` | 25–40 | +3.0 | 5.0 | Strong recovery |
| `fader` | 65–80 | -2.5 | 4.0 | Former top performer declining |

Archetypes cycle across merchants: `[bull, steady, volatile, bear, bull, comeback, steady, fader, volatile, bull, steady, bear]`

---

## 9. Database / API Structure

### 9.1 Database Tables (Planned Schema)

#### `merchants` (Primary entity)
```
merchant_id              UUID PK
business_name            VARCHAR
owner_name               VARCHAR
phone                    VARCHAR
email                    VARCHAR
gst_number               VARCHAR NULLABLE
registration_date        TIMESTAMP
sector_id                FK → sectors
location_id              FK → locations
business_type            ENUM(goods, services, hybrid, b2b, subscription, seasonal)
transaction_pattern      ENUM(high_frequency_low_value, low_frequency_high_value, subscription, bundled)
operating_hours_per_week INT
is_franchise             BOOLEAN
is_regulated_margin      BOOLEAN
declared_capacity        INT NULLABLE
platform_capture_percentage DECIMAL
status                   ENUM(active, dormant, suspended, under_review)
created_at               TIMESTAMP
updated_at               TIMESTAMP

INDEXES: merchant_id, sector_id, location_id, status
```

#### `sectors`
```
sector_id                        VARCHAR PK
sector_name                      VARCHAR
sector_category                  ENUM(goods, services, hybrid)
typical_margin_floor             DECIMAL
typical_margin_ceiling           DECIMAL
typical_ticket_floor             DECIMAL
typical_ticket_ceiling           DECIMAL
typical_daily_transaction_floor  INT
typical_daily_transaction_ceiling INT
is_regulated_margin              BOOLEAN
seasonal_pattern                 JSON NULLABLE (12-element monthly multiplier array)

INDEXES: sector_id, sector_name
```

#### `locations`
```
location_id                         VARCHAR PK
pin_code                            VARCHAR
city_name                           VARCHAR
district                            VARCHAR
state                               VARCHAR
city_tier                           ENUM(metro, tier1, tier2, tier3, rural)
location_opportunity_index          DECIMAL(0-1)
average_daily_footfall_multiplier   DECIMAL
purchasing_power_index              DECIMAL
updated_at                          TIMESTAMP

INDEXES: location_id, pin_code, city_tier, state
```

#### `transactions`
```
transaction_id              UUID PK
merchant_id                 FK → merchants
transaction_timestamp       TIMESTAMP
amount_gross                DECIMAL
amount_net                  DECIMAL
customer_identifier_hash    VARCHAR (hashed)
transaction_type            ENUM(standard, subscription, bundle, refund, reversal)
bundle_unit_count           INT NULLABLE
is_platform_originated      BOOLEAN
is_flagged                  BOOLEAN
flag_reason                 VARCHAR NULLABLE
created_at                  TIMESTAMP

INDEXES: transaction_id, merchant_id, transaction_timestamp
```

#### `scoring_periods`
```
period_id       VARCHAR PK
period_start    TIMESTAMP
period_end      TIMESTAMP
period_type     ENUM(daily, weekly, biweekly)
pool_amount     DECIMAL
status          ENUM(open, calculating, closed)
created_at      TIMESTAMP

INDEXES: period_id
```

#### `merchant_scores` (Core scoring table)
```
score_id                           VARCHAR PK
merchant_id                        FK → merchants
period_id                          FK → scoring_periods
raw_transaction_volume             INT
raw_revenue                        DECIMAL
log_normalized_volume              DECIMAL
log_normalized_revenue             DECIMAL
percentile_scale_score             DECIMAL
sector_zscore                      DECIMAL
sector_percentile_rank             DECIMAL
margin_efficiency_ratio            DECIMAL
margin_neutralized_score           DECIMAL
location_opportunity_multiplier    DECIMAL
location_adjusted_score            DECIMAL
opportunity_normalized_score       DECIMAL
transaction_pattern_quality_score  DECIMAL
momentum_score                     DECIMAL
ecosystem_contribution_score       DECIMAL
composite_index_score              DECIMAL(0-100)
final_rank                         INT
rank_movement                      INT
fatigue_dampener_applied           BOOLEAN
fatigue_dampener_value             DECIMAL
payout_amount                      DECIMAL
score_breakdown_json               JSON
created_at                         TIMESTAMP

INDEXES: score_id, merchant_id, period_id, final_rank, composite_index_score
```

#### `fraud_flags`
```
flag_id                VARCHAR PK
merchant_id            FK → merchants
period_id              FK → scoring_periods
flag_type              ENUM(fake_transaction, referral_loop, artificial_spike,
                            discount_manipulation, price_inflation, category_abuse,
                            dormancy_gaming)
detection_signal       TEXT
severity               ENUM(low, medium, high, critical)
action_taken           ENUM(monitor, score_hold, score_reduction, exclusion)
investigation_status   ENUM(open, under_review, resolved_genuine, resolved_fraudulent)
created_at             TIMESTAMP

INDEXES: flag_id, merchant_id, period_id, severity
```

#### `referral_events`
```
referral_id              VARCHAR PK
referring_merchant_id    FK → merchants
referred_entity_type     ENUM(user, merchant)
referred_entity_id       VARCHAR
referral_timestamp       TIMESTAMP
credit_value_initial     DECIMAL
credit_value_current     DECIMAL
decay_factor_applied     DECIMAL
is_in_flagged_network    BOOLEAN
created_at               TIMESTAMP

INDEXES: referral_id, referring_merchant_id
```

#### `force_majeure_events`
```
event_id                  VARCHAR PK
event_name                VARCHAR
event_type                ENUM(natural_disaster, civil_disruption, platform_outage, macro_economic)
affected_location_ids     JSON ARRAY
start_timestamp           TIMESTAMP
end_timestamp             TIMESTAMP
scoring_adjustment_type   ENUM(pause, baseline_correction, tolerance_widening)
created_at                TIMESTAMP

INDEXES: event_id, event_type
```

#### `scoring_parameters`
```
parameter_key          VARCHAR PK (unique)
parameter_value        DECIMAL or JSON
parameter_description  TEXT
last_updated_by        VARCHAR
last_updated_at        TIMESTAMP
effective_from         TIMESTAMP

INDEXES: parameter_key
```

### 9.2 API Routes (Complete List)

#### Authentication
| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Login with email/password, set auth cookie |
| GET | `/api/auth/me` | Get current authenticated user from cookie |
| POST | `/api/auth/logout` | Clear auth cookie |

#### Merchant Data
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/merchants/[id]` | Get single merchant profile |
| GET | `/api/merchants/[id]/score` | Get merchant's score (optional `?period_id=`) |
| GET | `/api/merchants/[id]/candlesticks` | Get OHLC chart data for merchant |
| GET | `/api/merchants/[id]/volume` | Get transaction volume histogram data |

#### Scoring
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/scores/periods` | List all scoring periods |
| GET | `/api/scores/[periodId]` | Get all merchant scores for a period |

#### Leaderboard & Ticker
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/leaderboard` | Paginated leaderboard with filters (`city_tier`, `state`, `period_id`) |
| GET | `/api/ticker` | Top movers by absolute score change |

#### Admin Endpoints
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/admin/parameters` | List all scoring parameters |
| PUT | `/api/admin/parameters` | Update a parameter value |
| GET | `/api/admin/fraud` | List fraud flags (optional `?status=` filter) |
| PATCH | `/api/admin/fraud` | Update fraud flag action/status |
| GET | `/api/admin/force-majeure` | List force majeure events |
| POST | `/api/admin/force-majeure` | Create new force majeure event |
| GET | `/api/admin/cohorts` | Sector cohort health metrics |
| POST | `/api/admin/payouts/simulate` | Simulate payout distribution |

### 9.3 API Response Envelope

All endpoints return a consistent envelope:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-04-06T...",
    "period_id": "sp-028" | null,
    "request_id": "uuid"
  },
  "error": null | { "code": "...", "message": "..." }
}
```

### 9.4 Authentication System

| Component | Implementation |
|---|---|
| Auth method | Cookie-based (`kutoot_auth` HttpOnly cookie) |
| Cookie content | JSON-serialized `AuthUser` object |
| Session duration | 7 days (`maxAge: 604800`) |
| Roles | `merchant`, `admin` |
| Route protection | Next.js middleware checks cookie on protected routes |
| Admin protection | `/admin/*` routes require `role === "admin"` |
| Mock credentials | `merchant@kutoot.com / password`, `admin@kutoot.com / password` |

### 9.5 Middleware Route Protection

```
Protected routes (require any auth):
  /dashboard, /leaderboard, /analysis, /payouts

Admin routes (require admin role):
  /admin/*

Login page:
  Redirects to /dashboard if already authenticated
```

---

## 10. Edge Cases & Safeguards

### 10.1 Handling Zero Activity

| Scenario | Current Handling |
|---|---|
| Merchant with no transactions in a period | Score drops toward 0 due to low `raw_transaction_volume` and `raw_revenue`. Log normalization `log(0 + 1) = 0` means floor score |
| New merchant with no history | Bayesian prior protection: 80% of score comes from platform average for first 8 weeks |
| Merchant goes dormant | Status transitions to `dormant`. Dormant merchants are counted in cohort health but their scores naturally decline |
| Zero total scores in payout calculation | API checks: `if (totalScore > 0)` before dividing — prevents division by zero |

### 10.2 Handling Spikes

| Scenario | Current Handling |
|---|---|
| Sudden 2× transaction spike | `fraud_velocity_multiplier_threshold = 2.0` triggers automatic fraud flag |
| Revenue spike 420%+ WoW | Flagged as `artificial_spike` with severity `high` |
| Score concentrated in final period days | Flagged as `artificial_spike` — "concentrated in final 2 days of period" |
| Festival-driven spike (legitimate) | Force majeure `tolerance_widening` can be applied by admin for known events (e.g., Holi, Diwali). Example: "Holi Festival Regulatory Restriction" event with `tolerance_widening` |
| Natural disaster spike/drop | Force majeure `pause` freezes scoring for affected locations |

### 10.3 Handling System Abuse

| Scenario | Current Handling |
|---|---|
| Repeated top-10 winners | Fatigue dampener: after 3 consecutive periods in top 10, score reduced by 3–15% |
| Referral gaming (circular loops) | Network graph analysis detects A→B→C→A patterns; credits zeroed; flagged as `referral_loop` |
| Category misclassification for easier competition | Flagged as `category_abuse` — "92% of SKUs match different sector profile" |
| Dormancy gaming (go quiet then burst) | Flagged as `dormancy_gaming` — "dormant for 6 periods then sudden activity burst" |
| Suspended merchants in leaderboard | `status = "suspended"` excluded from ticker. Payout blocked. |
| Bot traffic from same IP | Transaction-level `is_flagged` + IP subnet analysis |
| Round-number billing fraud | `fraud_round_number_concentration_threshold = 0.60` — if 60%+ bills are ₹100/₹500/₹1000 |
| Discount manipulation | Flagged when discount usage 78%+ vs 12% sector average |

### 10.4 Force Majeure System (External Event Handling)

When external events (natural disasters, outages, regulatory changes) affect merchant performance unfairly:

| Adjustment Type | Effect |
|---|---|
| `pause` | Scoring completely frozen for affected locations. The merchant's score remains at last pre-event value. |
| `baseline_correction` | Scores recalculated against a corrected baseline that accounts for the disruption |
| `tolerance_widening` | Fraud thresholds and scoring expectations relaxed for affected merchants |

**Active events in system:**
1. Cyclone Mandous II — TN & AP coastal (pause, Feb 10–28)
2. North-East Telecom Outage — NE states (baseline_correction, Mar 15–Apr 12)
3. Holi Festival Restriction — Jewellery sector (tolerance_widening, Mar 10–22)
4. Bihar Flood Relief — Patna (pause, Mar 25–Apr 12)

### 10.5 Score Clamping

All scores are hard-clamped between boundaries:
```
composite_index_score: clamp(value, 5, 98)
sub_scores: clamp(value, 0, 100)
location_multiplier: clamp(value, 1.0, 3.0)
sector_percentile_rank: clamp(value, 1, 99)
```

No merchant can score exactly 0 or 100 — the floor is 5 and ceiling is 98.

### 10.6 Minimum Cohort Size

```
minimum_cohort_size = 10
```

If a sector/location combination has fewer than 10 merchants, the comparison cohort is widened to ensure statistical validity. This prevents a merchant in a tiny cohort from gaming the ranking.

### 10.7 Platform Capture Percentage

Each merchant has a `platform_capture_percentage` (0.28–0.75) indicating what fraction of their total business flows through Kutoot. This is tracked but **not yet used** as a scoring factor — it's reserved for future fairness adjustments.

### 10.8 Seasonal Patterns

Each sector has a `seasonal_pattern` — a 12-element array of monthly multipliers:
```json
// Kirana: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2, 1.3, 1.1]
// Electronics: [0.8, 0.8, 0.9, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2, 1.4, 1.5, 1.2]
// Fashion: [0.7, 0.7, 0.8, 1.0, 1.0, 0.9, 0.8, 1.0, 1.3, 1.5, 1.4, 1.0]
```

These are **defined but not yet applied** to scoring. They are intended for seasonal baseline adjustments so merchants aren't penalized during naturally slow months.

### 10.9 Regulated Margin Handling

Sectors with `is_regulated_margin = true` (Pharmacy & Wellness, Dairy & Milk Products):
- Margin expectations are adjusted since merchants can't control pricing
- Merchants with `is_regulated_margin = true` get relaxed margin efficiency evaluation
- Currently 7 merchant's in regulated-margin sectors

---

## Summary of What's Built vs What's Defined-But-Not-Active

### Active (Currently Used in Scoring/Display)

- 6 sub-score parameters with fixed weights summing to 1.0
- Composite index score (0–100) computation
- Rank assignment by composite score descending
- Rank movement tracking
- Fatigue dampener for repeated top performers
- Payout distribution (proportional to score)
- 7 fraud flag types with 4 severity levels
- Referral credit system with exponential decay
- Referral loop detection and credit zeroing
- Force majeure event system (pause/baseline/tolerance)
- Bayesian prior protection for new merchants
- Location-based multiplier (1x–3x by city tier)
- Log normalization of transaction volume and revenue
- Merchant status lifecycle (active/dormant/suspended/under_review)
- Cookie-based auth with role-based route protection
- Complete TradingView-style chart system (candle/line/area/baseline)
- Live score simulation (client-side jitter)
- KMI (Kutoot Merchant Index)
- Ticker tape with biggest movers
- 12 sector definitions with margin/ticket/volume norms
- 30 location definitions across 5 city tiers
- 50 merchant profiles across all sectors

### Defined But Not Yet Active

- `payout_curve_alpha = 1.8` (power-law payout curve — not applied)
- `seasonal_pattern` arrays (12-month seasonal multipliers — not applied to scoring)
- `platform_capture_percentage` on merchants (tracked, not scored)
- `effective_from` on scoring parameters (schedule-based parameter changes — not implemented)
- `declared_capacity` on merchants (restaurant seating etc. — not scored)
- `b2b`, `subscription`, `seasonal` business types (defined, no merchants using them)
- `subscription`, `bundled` transaction patterns (defined, no merchants using them)
- `bundle_unit_count` on transactions (defined, not used in scoring)
- Weekly and biweekly period types (defined in enum, only daily periods generated)
- Dynamic weight adjustment logic (parameter system supports it, no automation)

---

*End of System Audit*
