# Kutoot Merchant Gamification Platform — Design Guide

## Overview

The Kutoot platform gamifies merchant branch performance using an **exchange-economy scoring model** with real-time TradingView-style visualisation. Branches accumulate a **Composite Index Score (CIS)** that fluctuates like a stock ticker, producing OHLC candlestick data, leaderboard ranks, and daily reward payouts.

This document covers the full redesign: glassmorphism UI, tab navigation, simulation engine, Discover / Academy features, and the seeded test environment.

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js 16)              │
│  Glassmorphism + Tab Nav + TradingView + Recharts    │
│  ┌─────────┬──────────┬─────────┬─────────────────┐  │
│  │ Branch  │ Rankings │ Deals   │ Discover/Academy│  │
│  │Dashboard│ Page     │ Txn     │ Social/Learning │  │
│  └─────────┴──────────┴─────────┴─────────────────┘  │
│           Cookie Auth → Sanctum                       │
└───────────────────────┬──────────────────────────────┘
                        │ REST API
┌───────────────────────▼──────────────────────────────┐
│                  Backend (Laravel 12)                 │
│  Filament v5 Admin ● Sanctum Auth ● Spatie Perms     │
│  ┌──────────┬──────────┬──────────┬───────────────┐  │
│  │ Scoring  │ Discover │ Academy  │ Simulation    │  │
│  │ Engine   │ Posts    │ Lessons  │ Command       │  │
│  └──────────┴──────────┴──────────┴───────────────┘  │
│           MySQL ● Redis ● Laravel Reverb (WS)        │
└──────────────────────────────────────────────────────┘
```

### Repository Layout

| Repo | Path | Stack |
|------|------|-------|
| Backend | `kutoot/` | Laravel 12, Filament v5, Sanctum, Spatie Perms |
| Frontend | `dashboard/` | Next.js 16.2, React 19, TailwindCSS 4 |

---

## Scoring System — v2 Exchange Economy

### 8 Sub-Scores

| # | Sub-Score | Weight | What It Measures |
|---|-----------|--------|------------------|
| 1 | GMV Index | 15% | Gross merchandise value throughput |
| 2 | Commission Index | 20% | Actual commission earned vs potential |
| 3 | Platform Capture | 15% | % of transactions captured digitally |
| 4 | User Growth | 15% | New unique customer acquisition |
| 5 | Repeat Rate | 15% | Returning customer ratio |
| 6 | Discount Aggression | 10% | Volume-weighted avg discount % |
| 7 | Referral Score | 10% | Referred merchants / customers |
| 8 | Fairness Index | 10% | Consistency and non-gaming penalty |

### Composite Index Score (CIS)

$$
CIS = \sum_{i=1}^{8} w_i \cdot S_i
$$

Where $w_i$ is the sub-score weight and $S_i$ is the normalised sub-score (0–100).

### OHLC Data

Every **ScoreTick** captures Open, High, Low, Close values for a configurable interval (default 1 minute), enabling TradingView candlestick chart visualisation.

### 29 Tunable Parameters

All weights, decay rates, thresholds, and fairness coefficients are stored in the `scoring_parameters` table and can be edited via the Filament admin panel.

---

## Test Data

### Seed Accounts

Run `php artisan db:seed --class=TestDataSeeder` (or `migrate:fresh --seed`).

| Type | Name | Email | Password |
|------|------|-------|----------|
| Admin | Test Admin | admin@test.com | Test@1234 |
| HO | Haldiram's | haldirams@test.com | Test@1234 |
| HO | Chai Point | chaipoint@test.com | Test@1234 |
| HO | Saravana Bhavan | saravanabhavan@test.com | Test@1234 |
| Branch | Haldiram's Chandni Chowk | chandnichowk@haldirams.test | Test@1234 |
| Branch | Haldiram's Connaught Place | connaughtplace@haldirams.test | Test@1234 |
| Branch | Haldiram's Nagpur Main | nagpurmain@haldirams.test | Test@1234 |
| Branch | Haldiram's Lajpat Nagar | lajpatnagar@haldirams.test | Test@1234 |
| Branch | Chai Point Koramangala | koramangala@chaipoint.test | Test@1234 |
| Branch | Chai Point Indiranagar | indiranagar@chaipoint.test | Test@1234 |
| Branch | Chai Point Cyber Hub | cyberhub@chaipoint.test | Test@1234 |
| Branch | Chai Point HSR Layout | hsrlayout@chaipoint.test | Test@1234 |
| Branch | Saravana Bhavan T Nagar | tnagar@saravanabhavan.test | Test@1234 |
| Branch | Saravana Bhavan Janpath | janpath@saravanabhavan.test | Test@1234 |
| Branch | Saravana Bhavan HITEC City | hiteccity@saravanabhavan.test | Test@1234 |
| Branch | Saravana Bhavan Andheri | andheri@saravanabhavan.test | Test@1234 |

### Seeded Content

- **15 Discover Posts** — platform tips, scoring guides, feature announcements
- **10 Academy Lessons** — covering scoring, OHLC, discounts, commission, ranking, payouts, loyalty, fairness

### Simulation Command

```bash
# Run once — generates random transactions for all 12 branches
php artisan simulate:trading

# Continuous loop — generates every 60 seconds
php artisan simulate:trading --loop

# Custom transaction range per branch
php artisan simulate:trading --txn-min=5 --txn-max=20
```

---

## UI Design — Glassmorphism

### Design Tokens (CSS Custom Properties)

```css
/* Light mode */
--glass-bg: rgba(255, 255, 255, 0.65);
--glass-border: rgba(255, 255, 255, 0.25);
--glass-blur: 16px;
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);

/* Dark mode */
--glass-bg: rgba(16, 18, 27, 0.75);
--glass-border: rgba(255, 255, 255, 0.06);
--glass-blur: 20px;
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
```

### Utility Classes

| Class | Purpose |
|-------|---------|
| `glass` | Base glassmorphism effect |
| `glass-card` | Card with glass background, border, shadow, rounded-xl |
| `glass-card-sm` | Smaller glass card (rounded-lg) |
| `glass-topbar` | Top navigation bar glass effect |
| `glass-tab-bar` | Horizontal tab bar glass effect |
| `glass-bottom-nav` | Mobile bottom navigation glass effect |
| `glass-glow-accent` | Accent colour glow |
| `glass-glow-gain` | Green/gain glow |
| `glass-glow-loss` | Red/loss glow |

### Layout Structure

```
┌──────────────────────────────────────────┐
│              glass-topbar                │  ← Fixed top
├──────────────────────────────────────────┤
│              glass-tab-bar               │  ← Desktop only, horizontal tabs
├──────────────────────────────────────────┤
│                                          │
│              Main Content                │  ← Scrollable, glass-card cards
│              (pages)                     │
│                                          │
├──────────────────────────────────────────┤
│          glass-bottom-nav                │  ← Mobile only, fixed bottom
└──────────────────────────────────────────┘
```

No sidebar. Fully responsive. Mobile-first with bottom navigation bar on small screens and horizontal tab bar on desktop.

---

## Navigation

### Branch User Tabs

| Tab | Route | Description |
|-----|-------|-------------|
| Dashboard | `/dashboard` | Score ticker, TradingView chart, sub-score meters |
| Rankings | `/leaderboard` | Platform-wide leaderboard with live jitter |
| Deals | `/deals` | Self-service discount and deal creation |
| Transactions | `/transactions` | Transaction history and analytics |
| Discover | `/discover` | Social feed — posts, likes, comments |
| Academy | `/academy` | Learning lessons with category/difficulty filters |
| Rewards | `/rewards` | Payout history and reward pool status |

### HO User Tabs

| Tab | Route | Description |
|-----|-------|-------------|
| Portfolio | `/ho` | Aggregate KBI chart, branch overview, avg score |
| Branches | `/ho/branches` | All branch cards with scores, ranks, commission |
| Rankings | `/ho/leaderboard` | Leaderboard filtered for own branches |
| Deals | `/ho/deals` | Cross-branch deal overview |
| Discover | `/discover` | Social feed (shared with branches) |
| Academy | `/academy` | Learning lessons (shared with branches) |
| Payouts | `/ho/payouts` | Payout history across all branches |

---

## API Endpoints

### Authentication

```
POST   /api/dashboard/auth/login    → { email, password }
POST   /api/dashboard/auth/logout
GET    /api/dashboard/auth/me
```

Login attempts auth against User → Merchant → MerchantLocation models in order. Returns:
```json
{
  "success": true,
  "data": {
    "role": "branch",       // or "ho" or "admin"
    "branch_id": "uuid",
    "ho_id": "uuid",
    "token": "1|abc..."
  }
}
```

### Branch Scoring

```
GET    /api/dashboard/scores/current                → Current branch score + sub-scores
GET    /api/dashboard/scores/ohlc?interval=1m       → OHLC candlestick data
GET    /api/dashboard/scores/history?days=30         → Daily score history
GET    /api/dashboard/scores/parameters              → Active scoring parameter values
```

### Leaderboard

```
GET    /api/dashboard/leaderboard?page=1&limit=20   → Paginated rankings
GET    /api/dashboard/leaderboard/branch/{id}        → Specific branch rank
```

### Discover (Social Feed)

```
GET    /api/dashboard/discover?page=1               → Paginated posts
GET    /api/dashboard/discover/{id}                  → Single post + comments
POST   /api/dashboard/discover/{id}/like             → Toggle like
POST   /api/dashboard/discover/{id}/comments         → Add comment
```

### Academy (Learning)

```
GET    /api/dashboard/academy?category=scoring&difficulty=beginner  → Lessons list
GET    /api/dashboard/academy/{slug}                                → Single lesson
```

### HO-Specific

```
GET    /api/dashboard/ho/{id}/branches               → All branches for this HO
GET    /api/dashboard/ho/{id}/scores                  → Branch score comparison
GET    /api/dashboard/ho/{id}/portfolio               → Aggregate portfolio metrics
```

---

## Filament Admin Panel

Access at `/admin` with admin@test.com / Test@1234.

### Resources

| Resource | Namespace | Description |
|----------|-----------|-------------|
| PostResource | Content | CRUD for Discover posts (rich editor, pinning) |
| AcademyLessonResource | Content | CRUD for Academy lessons (difficulty, category) |
| ScoringParameterResource | Scoring | Edit the 29 scoring parameters |
| MerchantResource | Merchants | Manage HO accounts |
| MerchantLocationResource | Branches | Manage branch accounts |

---

## Running Locally

### Backend

```bash
cd kutoot

# Install dependencies
composer install

# Configure environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate:fresh --seed

# Start services (using Laravel Herd or manual)
php artisan serve
php artisan reverb:start          # WebSocket server
php artisan simulate:trading --loop   # Continuous simulation
```

### Frontend

```bash
cd dashboard

# Install dependencies
npm install

# Configure API URL in .env.local
# NEXT_PUBLIC_API_URL=http://kutoot.test/api/dashboard

# Development
npm run dev

# Production build
npm run build && npm start
```

### Login Flow

1. Visit `http://localhost:3000/login`
2. Click any demo account button (3 branches + 3 HOs shown on login page)
3. Branch users see: Dashboard → Rankings → Deals → Transactions → Discover → Academy → Rewards
4. HO users see: Portfolio → Branches → Rankings → Deals → Discover → Academy → Payouts

---

## New Files Created

### Backend

| File | Purpose |
|------|---------|
| `app/Models/Post.php` | Polymorphic author, HasMedia, threaded comments |
| `app/Models/PostComment.php` | Threaded comments with parent_id |
| `app/Models/PostLike.php` | Unique polymorphic likes |
| `app/Models/AcademyLesson.php` | Lessons with difficulty/category enums |
| `database/migrations/2025_04_17_000001_create_discover_academy_tables.php` | 4 new tables |
| `app/Filament/Resources/PostResource.php` | Filament CRUD for posts |
| `app/Filament/Resources/AcademyLessonResource.php` | Filament CRUD for lessons |
| `app/Http/Controllers/Api/Dashboard/DiscoverController.php` | Discover API (posts, likes, comments) |
| `app/Http/Controllers/Api/Dashboard/AcademyController.php` | Academy API (lessons list/detail) |
| `app/Console/Commands/SimulateTrading.php` | Transaction simulation with --loop |

### Frontend

| File | Purpose |
|------|---------|
| `src/app/globals.css` | Complete rewrite — glassmorphism tokens & utilities |
| `src/components/layout/tab-bar.tsx` | Desktop horizontal tab navigation |
| `src/components/layout/app-shell.tsx` | Rewritten — no sidebar, tab + bottom nav |
| `src/app/login/page.tsx` | Redesigned with glass cards, gradient blobs, 6 demo accounts |
| `src/lib/types/discover.ts` | DiscoverPost, PostComment types |
| `src/lib/types/academy.ts` | AcademyLesson, LessonCategory, LessonDifficulty types |
| `src/lib/api/services/discover.service.ts` | API client for Discover endpoints |
| `src/lib/api/services/academy.service.ts` | API client for Academy endpoints |
| `src/app/(merchant)/discover/page.tsx` | Social feed with paginated posts, likes |
| `src/app/(merchant)/academy/page.tsx` | Lesson grid with filters, detail view |
| `src/app/(ho)/ho/branches/page.tsx` | HO branch overview cards with scores |

### Modified Frontend Files

| File | Change |
|------|--------|
| `src/lib/constants/navigation.ts` | Added Deals, Transactions, Discover, Academy tabs |
| `src/components/layout/topbar.tsx` | `glass-topbar` class |
| `src/components/layout/bottom-nav.tsx` | `glass-bottom-nav` class |
| `src/components/ui/card.tsx` | Glass-card default, `solid` prop for override |
| `src/middleware.ts` | Added /discover and /academy protected routes |

### Modified Backend Files

| File | Change |
|------|--------|
| `database/seeders/TestDataSeeder.php` | 3 HOs × 4 branches, Discover posts, Academy lessons |
| `routes/api_dashboard.php` | Discover and Academy route groups |

---

## Key Design Decisions

1. **No sidebar** — Tab bar on desktop, bottom nav on mobile. Cleaner, app-like experience.
2. **Glassmorphism everywhere** — Card component defaults to `glass-card`, so all existing pages get the treatment without per-page changes.
3. **3 HOs × 4 branches = 12 total** — Clean seeding with real Indian brand names (Haldiram's, Chai Point, Saravana Bhavan).
4. **Client-side score jitter** — `useLiveScore` and `useLiveLeaderboard` hooks add ±0.5 score fluctuation every 2-3s for live feel.
5. **Server-side simulation** — `simulate:trading` command generates realistic transactions that flow through the full scoring pipeline.
6. **Polymorphic Discover** — Posts can be authored by Admin, Merchant, or MerchantLocation, enabling cross-role social interaction.
7. **DangerouslySetInnerHTML for lesson bodies** — Academy lessons use rich HTML content from the Filament editor. Content is admin-curated, so XSS risk is mitigated.
