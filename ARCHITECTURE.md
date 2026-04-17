# Kutoot Dashboard Repository Architecture

## 1. Purpose and Scope

This repository is a Next.js 16 dashboard frontend for the Kutoot platform. It is not a monolithic full-stack app with its own database engine implemented inside the Next.js codebase. Instead, it is primarily a role-based frontend plus a thin Backend-for-Frontend proxy layer.

The repository has four major responsibilities:

1. Render the dashboard UI for branch and head office roles.
2. Manage browser-side state, caching, navigation, theming, and onboarding workflow.
3. Expose same-origin `/api/*` route handlers that proxy requests to a separate backend.
4. Document the backend contract through TypeScript types, constants, comments, and audit notes.

Important framing:

- The UI naming uses both `branch` and `merchant` terms. In current code, `branch` is the canonical auth/domain term, but route groups and some services still use `merchant` naming.
- The repo includes rich mock data and audit documentation, but the active runtime path uses proxy calls to a backend, not local mock collections.
- Most dashboard screens are client components. The App Router is used mainly for routing, layouts, middleware, loading boundaries, and route handlers.

## 2. Executive Mental Model

At runtime, the app works like this:

```mermaid
flowchart LR
    A[Browser] --> B[Next.js App Router]
    B --> C[Root Layout]
    C --> D[Providers]
    D --> D1[ThemeProvider]
    D --> D2[QueryProvider]
    D --> D3[AuthProvider]
    D3 --> E[Role Based Pages]
    E --> F[React Query Hooks]
    F --> G[Service Layer]
    G --> H[Axios Client]
    H --> I[/api/* Next Route Handlers]
    I --> J[Proxy Helper]
    J --> K[External Kutoot Backend]
```

Authentication and authorization work through cookies:

- `kutoot_token`: backend bearer token, stored as `httpOnly`, used by server-side route handlers.
- `kutoot_auth`: serialized user object, also `httpOnly`, read by middleware for route gating.

The dashboard pages do not call the backend directly by default. They call the browser-facing Axios client, which defaults to `NEXT_PUBLIC_API_BASE_URL=/api`, then hit the Next route handlers, which forward the request to the backend configured through `KUTOOT_BACKEND_URL`.

## 3. Top-Level Repository Layout

### Root files

| Path | Role |
| --- | --- |
| `package.json` | Runtime dependencies and scripts (`dev`, `build`, `start`, `lint`) |
| `next.config.ts` | Next.js config, currently minimal |
| `tsconfig.json` | TypeScript strict config and `@/*` path alias |
| `eslint.config.mjs` | ESLint 9 + Next core web vitals + TypeScript rules |
| `postcss.config.mjs` | Tailwind v4 PostCSS integration |
| `README.md` | Still the default create-next-app README, not project-specific |
| `SYSTEM_AUDIT.md` | Detailed scoring/business-system audit; complements this architecture doc |
| `AGENTS.md` | Repo-specific instruction note that this is Next 16 with breaking differences |
| `CLAUDE.md` | Delegates to `AGENTS.md` |

### Main source tree

| Path | Role |
| --- | --- |
| `src/app` | App Router layouts, pages, route groups, route handlers |
| `src/components` | Reusable UI, layout shell, branding, charts, onboarding pieces, providers |
| `src/lib/api` | Browser API client, server proxy helpers, service modules |
| `src/lib/constants` | Navigation, scoring metadata, onboarding text/validation, strings, chart theme |
| `src/lib/hooks` | React Query hooks and live-data hooks |
| `src/lib/mock` | Mock datasets and seeded reference data; not used by active runtime |
| `src/lib/stores` | Zustand stores for UI state, onboarding state, preferences |
| `src/lib/types` | Domain contracts, API envelopes, and backend schema comments |
| `src/lib/utils` | Formatting, class merge, colors, effects, sound helpers |
| `public` | Logos, starter SVG assets, and MP3 sound files |

## 4. Framework and Build Architecture

### Core stack

- Next.js `16.2.2`
- React `19.2.4`
- TypeScript `5`
- Tailwind CSS `4`
- React Query `5`
- Zustand `5`
- Axios `1.x`
- next-themes
- lightweight-charts
- Recharts
- Framer Motion

### Build/runtime characteristics

- The project uses the App Router, not the Pages Router.
- The root layout is a server component by default.
- Most screens under `src/app` are marked with `"use client"` because they depend on hooks, charts, or browser state.
- Route handlers under `src/app/api` are server-side code that act as proxy endpoints.
- Middleware enforces role access for a subset of routes before page rendering.

### TypeScript configuration (`tsconfig.json`)

The TypeScript config is conservative and production-oriented:

- `strict: true`
- `moduleResolution: bundler`
- `jsx: react-jsx`
- `noEmit: true`
- `incremental: true`
- `allowJs: true`
- path alias: `@/* -> ./src/*`

This means the repo treats TypeScript as the authoritative contract layer, but it still tolerates JavaScript files if needed.

### ESLint configuration (`eslint.config.mjs`)

The lint setup uses:

- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Ignored paths are mostly standard build outputs.

### Tailwind and global CSS

Tailwind v4 is configured through:

- `@import "tailwindcss";` in `src/app/globals.css`
- `@tailwindcss/postcss` in `postcss.config.mjs`

The CSS architecture uses custom CSS variables for theme tokens and then maps them into Tailwind theme values with `@theme inline`.

## 5. Theming, Visual System, and Design Language

The visual system is defined primarily in `src/app/globals.css` and `src/lib/constants/theme.ts`.

### Global theme tokens

`globals.css` defines two major token sets:

- Light mode variables under `:root`
- Dark mode variables under `.dark`

These include:

- background and foreground colors
- card, border, muted, and accent colors
- semantic statuses (`success`, `error`, `warning`, `info`)
- legacy aliases (`gain`, `loss`)
- tier colors for gamified ranking display
- chart-specific colors

### Theme provider behavior

`src/components/providers/theme-provider.tsx` configures `next-themes` as follows:

- `attribute="class"`
- `defaultTheme="dark"`
- `enableSystem={false}`

So the repo defaults to dark mode and does not follow the OS theme unless you change this provider.

### Chart theming

`src/lib/constants/theme.ts` contains `CHART_THEME_DARK` and `CHART_THEME_LIGHT` used by the lightweight-charts wrappers.

### Branding assets

Branding uses public image files:

- `/full-logo.png` for the full Kutoot logo
- `/k-logo.png` for the icon mark

These are wrapped by `KutootLogo` and `KutootIcon` in `src/components/branding/kutoot-logo.tsx`.

### Architectural note

The repo still contains starter assets like `/next.svg`, `/vercel.svg`, `/globe.svg`, etc. The root metadata icon also still points at `/vercel.svg`, which is a scaffold leftover rather than a Kutoot-branded favicon.

## 6. Routing Architecture

### App Router philosophy in this repo

This repo uses App Router route groups heavily:

- `(merchant)`
- `(ho)`

These folders do not appear in the final URL. They only group layouts and pages.

### Root-level routes

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `src/app/page.tsx` | Immediate redirect to `/dashboard` |
| `/login` | `src/app/login/page.tsx` | Public login screen with quick-access buttons |
| `/onboard` | `src/app/onboard/page.tsx` | Main onboarding wizard container |
| `/onboard/start` | `src/app/onboard/start/page.tsx` | Start or resume onboarding |
| `/onboard/resume` | `src/app/onboard/resume/page.tsx` | Resume draft application via OTP or employee code |

### Root layout

`src/app/layout.tsx` is the top-level HTML shell. It does the following:

- loads Geist and Geist Mono via `next/font/google`
- sets metadata title/description/icon
- applies font CSS variables to the `<html>` element
- uses `suppressHydrationWarning` to avoid theme hydration noise
- wraps the entire app in `Providers`

### Merchant route group `(merchant)`

Actual URLs under this group do not include `/merchant`; they are plain app URLs.

`src/app/(merchant)/layout.tsx` wraps all merchant pages in the shared `AppShell`.

Implemented routes:

| URL | Purpose |
| --- | --- |
| `/dashboard` | Branch performance terminal / home dashboard |
| `/analysis` | Branch score trend, breakdown, and peer comparison |
| `/leaderboard` | Platform rankings table with filters |
| `/payouts` | Branch reward history and payout trend |
| `/deals` | Branch deal/coupon management |
| `/store` | Branch store profile read/edit page |
| `/transactions` | Branch transaction table |
| `/visitors` | Branch visitor/customer table |

Reserved but currently empty:

| Path | State |
| --- | --- |
| `src/app/(merchant)/applications/` | Empty folder, no page implemented |

Merchant loading boundaries exist for:

- `/dashboard`
- `/analysis`
- `/leaderboard`
- `/payouts`

### HO route group `(ho)`

`src/app/(ho)/layout.tsx` also wraps content with the same `AppShell`.

The actual URL prefix is `/ho` because the route files sit under `src/app/(ho)/ho`.

Implemented routes:

| URL | Purpose |
| --- | --- |
| `/ho` | Head-office portfolio dashboard |
| `/ho/leaderboard` | Platform leaderboard with owned branches highlighted |
| `/ho/analysis` | Cross-branch analysis and sub-score comparison |
| `/ho/payouts` | Aggregate branch payout summary |
| `/ho/applications` | Applications linked to the head office |
| `/ho/deals` | All deals across HO-linked branches |
| `/ho/transactions` | Transactions across HO-linked branches |
| `/ho/visitors` | Visitors across HO-linked branches |

HO loading boundaries exist for:

- `/ho`
- `/ho/analysis`
- `/ho/leaderboard`
- `/ho/payouts`

## 7. Page Responsibilities by Role

### Login (`/login`)

The login page is a client component that:

- calls `useAuth().login(email, password)`
- shows manual email/password inputs
- includes quick-access buttons for branch and HO credentials
- relies on the auth provider to redirect after successful login

### Branch dashboard (`/dashboard`)

This page is the most complete example of the UI architecture. It combines:

- auth context (`branch_id`)
- React Query hooks for score, candlesticks, volume, periods, leaderboard
- simulated live score updates through `useLiveScore`
- shared UI primitives like cards, badges, info tooltips, score widgets
- shared chart wrappers
- global date range from `useUIStore`

It is effectively the template for how this repo composes data, charts, and dashboard cards.

### Branch analysis (`/analysis`)

This page focuses on three modes:

- score trend
- score breakdown across sub-scores
- peer comparison against sector average

It uses:

- `useBranchCandlesticks`
- `useBranchScore`
- `useBranchScoreHistory`
- `useScoresByDateRange`

Important nuance: `useScoresByDateRange` is called, but the current page primarily uses branch history and candlestick data rather than the returned period score list.

### Branch leaderboard (`/leaderboard`)

This is a filterable ranking table with:

- city-tier filter
- state filter
- date range filter
- client-side pagination controls
- highlighted current branch row
- live jittered data through `useLiveLeaderboard`

### Branch payouts (`/payouts`)

This page shows:

- total earned
- periods rewarded
- current rank/score snapshot
- payout trend chart
- payout history table

### Branch deals (`/deals`)

This page does not use a dedicated custom hook. It uses `useQuery` and `useMutation` directly against `merchant.service.ts` to:

- list deals
- create deals
- toggle active state
- delete deals

This is one of several screens that bypass the custom hook layer and call services directly.

### Branch store (`/store`)

This page:

- fetches store profile
- shows read-only branch financial details
- allows editing owner/contact/operating-hours fields
- persists updates through direct service mutations

### Branch transactions and visitors

These pages use direct `useQuery` calls and the generic `DataTable` component for paginated tabular data.

### Onboarding (`/onboard*`)

This is a standalone public workflow, not rendered inside the dashboard shell.

The onboarding architecture includes:

- `OnboardLayout`: minimal public header/footer shell
- `OnboardStartPage`: phone pre-check and branching into new/resume flow
- `ResumePage`: merchant OTP resume or field-executive resume by employee code
- `OnboardPage`: orchestrates the wizard itself

Dynamic onboarding flow is one of the most important concepts in this repo:

- Merchant self-onboarding skips visit outcome and QR activation.
- Field executive flow changes based on `visit_outcome`.
- Drafts are auto-saved through `createApplication` / `updateApplication` mutations when moving between steps.

### HO pages

The HO pages aggregate branch-level data into a portfolio-style experience.

- `/ho`: summary cards, holdings list, selected-branch detail
- `/ho/analysis`: branch comparison and average sub-score views
- `/ho/leaderboard`: global leaderboard with HO-owned branches marked
- `/ho/payouts`: payout rollup by branch
- `/ho/applications`: application listing with stats and CSV export
- `/ho/deals`, `/ho/transactions`, `/ho/visitors`: aggregated operational views across linked branches

## 8. Shell Architecture

### `AppShell`

`src/components/layout/app-shell.tsx` is the shared protected-shell wrapper. It renders:

- `Sidebar`
- `Topbar`
- main content area

This shell is used by merchant and HO route groups.

### `Sidebar`

The sidebar:

- reads the logged-in user role from `useAuth()`
  - chooses navigation from `BRANCH_NAV` or `HO_NAV`
- reads collapse state from `useUIStore`
- computes active-route styling from `usePathname`

### `Topbar`

The topbar combines several concepts:

- theme toggle via `next-themes`
- auth logout button
- live ticker tape (`useTicker`)
- KBI/KMI display using `useKMI`
- sound preference toggle via `usePreferencesStore`

Architectural nuance:

- The UI label says `KBI` in some places, while the hook/component naming still uses `KMI`. The concept is the same platform-wide index, but naming is mixed.
- Sound preference state is wired, but the actual `playSound()` helper is not used anywhere in the current repo.

### `BottomNav`

`src/components/layout/bottom-nav.tsx` exists as a mobile navigation component, but it is not currently mounted by `AppShell`.

## 9. Authentication and Authorization Architecture

### Cookies

The repo uses two auth cookies:

| Cookie | Purpose |
| --- | --- |
| `kutoot_token` | Backend bearer token for server-side proxy calls |
| `kutoot_auth` | Serialized auth user object with role and IDs |

Both are set as:

- `httpOnly`
- `sameSite: "lax"`
- `path: "/"`
- `secure` only in production
- `maxAge: 7 days` on login

### Login flow

1. Login page calls `AuthProvider.login()`.
2. `AuthProvider.login()` calls `loginService()`.
3. `loginService()` posts to `/api/auth/login`.
4. `src/app/api/auth/login/route.ts` proxies to backend `/auth/login`.
5. On success, the route handler stores both cookies.
6. The auth provider clears query cache, stores `user`, and pushes the user to:
   - `/ho` for HO
   - `/dashboard` for branch

### Logout flow

1. Topbar calls `logout()` from auth context.
2. Auth provider calls `/api/auth/logout`.
3. Route handler attempts backend logout, then clears both cookies locally.
4. Query cache is cleared.
5. Router pushes user to `/login`.

### Session hydration flow

On app mount, `AuthProvider` calls `getMe()`.

That fetch goes to `/api/auth/me`, which:

- checks whether `authHeaders()` produced an `Authorization` header from `kutoot_token`
- returns `401` if no auth token exists
- otherwise proxies to backend `/auth/me`

### Middleware authorization flow

`src/middleware.ts` is the first line of route protection. It:

- reads `kutoot_auth`
- parses the JSON user object
- checks `role`
- redirects users based on role/home rules

Protected route families in middleware logic:

- HO-only: `/ho*`
- branch-authenticated: `/dashboard*`, `/leaderboard*`, `/analysis*`, `/payouts*`
- public onboarding: `/onboard*`

### Important architectural gap

The middleware matcher does **not** include these merchant screens:

- `/deals`
- `/store`
- `/transactions`
- `/visitors`

That means these pages are part of the merchant dashboard architecture but are not protected by middleware. They still depend on auth state for meaningful data, but they are not server-redirected to `/login` the way `/dashboard` or `/analysis` are.

### Authority model note

The middleware trusts the contents of `kutoot_auth`, which is a serialized user object cookie. Backend APIs should still enforce real authorization using the bearer token, because the frontend route-gating layer alone is not a sufficient authority boundary.

## 10. Provider Tree and Global Runtime Services

`src/components/providers/index.tsx` composes providers in this exact order:

1. `ThemeProvider`
2. `QueryProvider`
3. `AuthProvider`

### `QueryProvider`

This creates a singleton `QueryClient` with defaults:

- `staleTime: 30_000`
- `retry: 1`
- `refetchOnWindowFocus: false`

It also exposes a custom `useQueryClientInstance()` hook so `AuthProvider` can clear the cache on login/logout.

### `AuthProvider`

This is a React context, not a Zustand store. It owns:

- `user`
- `isAuthenticated`
- `isLoading`
- `login(email, password)`
- `logout()`

Using context for auth and Zustand for UI is a deliberate separation of concerns in this repo.

## 11. State Management Architecture

The repo uses three state patterns in parallel:

1. React Query for remote/server state
2. Zustand for shared client state
3. local component state for form inputs and view toggles

### Zustand stores

#### `ui.store.ts`

Global UI state:

- `sidebarCollapsed`
- `toggleSidebar()`
- `dateRange`
- `setDateRange()`

This store is used by the shell and the main branch dashboard.

#### `onboarding.store.ts`

This is the most complex store in the repo. It holds:

- current wizard step
- completed steps
- application ID
- onboarding start time
- full in-memory onboarding form data
- phone-check result
- step navigation methods
- draft-loading and reset methods

Important design choice:

- PII is intentionally kept in memory only.
- No localStorage persistence is used.
- Draft persistence is expected to happen server-side through API PATCH calls.

#### `preferences.store.ts`

Currently only stores:

- `soundEnabled`
- `toggleSound()`

This is only used by `Topbar` today.

### Store export nuance

The `stores` barrel exports only:

- `useUIStore`
- `useOnboardingStore`

It does **not** export `usePreferencesStore`, so components import that file directly.

### Local state patterns

Many pages use local state for:

- filters
- modal visibility
- form buffers
- selected rows/items
- tab selection
- page numbers

This repo avoids over-centralizing view-local state.

### Date range split pattern

There are two parallel date-range patterns in the repo:

- global `useUIStore().dateRange` on the branch dashboard
- local `useDateRange()` on other analytical pages

This is functional, but it means date-range behavior is not globally unified across all screens.

## 12. Data Access Architecture

### Browser API client

`src/lib/api/client.ts` creates the Axios instance.

Defaults:

- `baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"`
- JSON content type
- `timeout = 10000`
- `withCredentials = true`

### Recommended runtime mode

The default and most coherent configuration is:

- `NEXT_PUBLIC_API_BASE_URL=/api`

This keeps the browser talking to the same-origin Next proxy layer.

If you point `NEXT_PUBLIC_API_BASE_URL` to an external backend directly, the browser will bypass the Next route handlers. That changes the security and deployment model because you then need working CORS, cookie policy, and auth handling directly on that external origin.

### Response/error behavior

- Services still return `res.data` explicitly.
- Axios error responses are normalized into `{ code, message, details? }` shape when possible.

### Server proxy helper

`src/lib/api/server/proxy.ts` is the backend integration core.

It provides:

- `backendBaseUrl()`
- `backendUrl(path)`
- `authHeaders()`
- `errorResponse()`
- `proxyResponse()`

### Backend URL normalization

`backendBaseUrl()` accepts:

- `KUTOOT_BACKEND_URL`
- lowercase fallback `kutoot_backend_url`

Behavior:

- trims whitespace
- adds `https://` if the protocol is missing
- ensures `/api/dashboard` path exists if none is configured
- removes trailing slashes
- falls back to `http://kutoot.test/api/dashboard`

This means the backend contract expected by the proxy layer is a backend whose dashboard API root lives under `/api/dashboard`.

## 13. Service-Layer Architecture

Service files are in `src/lib/api/services`.

### Service modules

| File | Responsibility |
| --- | --- |
| `auth.service.ts` | login, logout, current-user fetch |
| `branches.service.ts` | branch details, score, candlesticks, volume, payouts, score history |
| `leaderboard.service.ts` | leaderboard and ticker |
| `scores.service.ts` | periods, per-period scores, ranged scores |
| `onboarding.service.ts` | applications, head offices, phone/OTP/KYC/bank verification |
| `admin.service.ts` | parameters, fraud, force majeure, cohorts, overrides, payouts |
| `merchant.service.ts` | branch portal operations and HO aggregation APIs |
| `merchants.service.ts` | merchant entity metrics by ID |

### Naming nuance: `merchant` vs `merchants`

This repo has two similarly named service files with different meaning:

- `merchant.service.ts`: branch portal operations like deals, store, transactions, visitors, plus HO summary/aggregates
- `merchants.service.ts`: fetch-by-ID merchant entity metrics like score, candlesticks, volume

This is one of the clearest signs of an evolving domain model moving from `merchant` naming toward `branch` naming.

### Barrel export nuance

`src/lib/api/services/index.ts` exports:

- auth
- branches
- leaderboard
- scores
- admin
- onboarding

It does **not** export:

- `merchant.service.ts`
- `merchants.service.ts`

So pages that need branch portal or merchant-entity services import those files directly.

## 14. React Query Hook Architecture

Hooks live in `src/lib/hooks`.

### Wrapped hook domains

| File | Responsibility |
| --- | --- |
| `use-branch-data.ts` | branch detail, score, candlesticks, volume, payouts, score history |
| `use-ho.ts` | HO summary, branches, branch scores, portfolio mapping |
| `use-leaderboard.ts` | leaderboard and ticker |
| `use-scores.ts` | periods, per-period scores, date-range scores |
| `use-admin.ts` | admin queries and mutations |
| `use-onboarding.ts` | onboarding queries and mutations |
| `use-merchant-data.ts` | merchant-entity fetches |
| `use-live-data.ts` | client-side simulated live values |
| `use-kmi.ts` | client-side generated index series |
| `use-date-range.ts` | local date-range helper |

### Query-key strategy

The repo uses straightforward array keys, for example:

- `['branchScore', branchId, periodId]`
- `['leaderboard', filters]`
- `['onboarding', 'application', id]`
- `['fraudFlags', status]`

This is simple and readable, but there is no centralized query-key factory.

### Mutation invalidation strategy

Mutations typically invalidate specific query families after success, for example:

- parameter updates invalidate `['parameters']`
- onboarding application updates invalidate draft and list queries
- deal and store actions manually invalidate per-page query keys

### Hook export nuance

`src/lib/hooks/index.ts` exports many hooks, but not all of them.

Missing from the hook barrel are notable helpers such as:

- `useMerchant*` hooks
- `useBranchPayouts`
- `useBranchScoreHistory`
- `useScoresByDateRange`

This means some screens import the hook file directly instead of relying on the barrel.

## 15. Live Data Simulation Architecture

Not all “live” UI in this repo is backend-driven.

### Real live-ish behavior

- `useTicker()` refetches every 30 seconds.

### Simulated live behavior

- `useLiveScore(baseScore)` jitters a displayed score every 2 seconds.
- `useLiveLeaderboard()` jitters score and change values over the fetched leaderboard data every 3 seconds.
- `useKMI()` generates a synthetic historical series and updates it every 2 seconds.

This means the repo currently mixes:

- real backend data
- periodic polling
- local random animation to create a terminal-like live feel

Architecturally, that is important because the UI can look “live” even when the backend is only polled or not updating at all.

## 16. Component System Architecture

### Layout components (`src/components/layout`)

| File | Role |
| --- | --- |
| `app-shell.tsx` | Shared protected shell |
| `sidebar.tsx` | Role-aware navigation |
| `topbar.tsx` | Theme/auth/ticker/index controls |
| `page-header.tsx` | Standard title/subtitle/action-row wrapper |
| `bottom-nav.tsx` | Unmounted mobile nav component |
| `index.ts` | Barrel export |

### UI primitives (`src/components/ui`)

| File | Role |
| --- | --- |
| `button.tsx` | Button variants and loading state |
| `input.tsx` | Labeled input wrapper |
| `select.tsx` | Select control |
| `multi-select.tsx` | Multi-select control |
| `card.tsx` | Surface container |
| `badge.tsx` | Status/label pill |
| `modal.tsx` | Framer Motion modal wrapper |
| `tabs.tsx` | Tab selector |
| `data-table.tsx` | Generic sortable table |
| `skeleton.tsx` | Loading placeholder |
| `empty-state.tsx` | Zero-state presentation |
| `info-tooltip.tsx` | Inline explanations |
| `date-range-picker.tsx` | Reusable date-range control |
| `chart-type-switcher.tsx` | Chart-mode toggle |
| `score-display.tsx` | Score card display |
| `rank-badge.tsx` | Percentile/tier badge |
| `change-indicator.tsx` | Positive/negative delta marker |
| `reward-pool-card.tsx` | Reward pool summary card |
| `parameter-meter.tsx` | Weighted sub-score meter |
| `improvement-card.tsx` | Improvement suggestion surface |
| `market-indicator.tsx` | Market/trend indicator |
| `achievement-badge.tsx` | Gamified achievement display |
| `index.ts` | Barrel export |

### Chart components (`src/components/charts`)

| File | Role |
| --- | --- |
| `multi-chart.tsx` | Unified lightweight-charts wrapper for candle/line/area/baseline |
| `candlestick-chart.tsx` | Dedicated candlestick wrapper |
| `volume-chart.tsx` | Volume rendering |
| `sparkline-chart.tsx` | Mini trend lines |
| `area-chart.tsx` | Recharts area visualization |
| `baseline-chart.tsx` | Baseline comparison chart |
| `kmi-chart.tsx` | Platform index chart |
| `index.ts` | Barrel export |

Chart architecture uses both:

- `lightweight-charts` for trading-terminal style charts
- Recharts for simpler dashboard visuals

### Onboarding components (`src/components/onboarding`)

| File | Role |
| --- | --- |
| `wizard-shell.tsx` | Stepper/progress shell |
| `step-identity.tsx` | Channel selection + OTP/employee-code verification |
| `step-visit-outcome.tsx` | FE visit disposition |
| `step-basic-details.tsx` | Core merchant/branch form |
| `step-commission.tsx` | Commission model/rate |
| `step-kyc.tsx` | GST/PAN/Aadhaar flows |
| `step-bank.tsx` | Account and IFSC flow |
| `step-qr-activation.tsx` | QR/device activation details |
| `step-review.tsx` | Final review/submit step |
| `otp-input.tsx` | OTP input control |
| `field-with-info.tsx` | Field wrapper with tooltip/help |
| `duplicate-alert.tsx` | Duplicate lead warning UI |
| `photo-capture.tsx` | Capture UX for storefront/QR/KYC imagery |

### Branding components

| File | Role |
| --- | --- |
| `kutoot-logo.tsx` | Full and icon logo wrappers |
| `index.ts` | Branding barrel |

## 17. Onboarding Workflow Architecture

The onboarding system is one of the most domain-rich parts of the repo.

### Supported channels

- `merchant`
- `field_executive`

### Dynamic step activation

The wizard does not always show the same steps.

Rules from `src/app/onboard/page.tsx`:

- Merchant self-onboarding: `identity -> basic_details -> commission -> kyc -> bank -> review`
- Field executive + interested: full path including `visit_outcome` and `qr_activation`
- Field executive + non-interested outcomes: shortened path focused on visit record + minimal details + review

### State and persistence model

- In-memory working state lives in `useOnboardingStore`
- Server-side persistence is performed via `createApplication` and `updateApplication`
- Step completion is tracked separately from current step
- Existing applications can hydrate the local store via `loadFromApplication()`

### Verification subflows

The onboarding feature exposes or consumes these operations:

- head office list
- phone duplicate check
- field executive verification
- OTP send and verify
- GST verify
- PAN verify
- bank verify

### Non-blocking verification design

The service layer intentionally makes GST, PAN, and bank verification non-fatal:

- if the API call fails, the service returns a successful fallback payload
- status becomes a manual-review or pending state instead of throwing

This is an explicit architecture decision that prioritizes onboarding completion over hard-stop verification failures.

### Resume flow

The resume system supports two modes:

- merchant via OTP
- field executive via employee code

It loads the most recent draft application returned by `listApplications()` and rehydrates the onboarding store before returning to `/onboard?mode=resume`.

## 18. Domain Model and Type Architecture

Type definitions are under `src/lib/types` and often include backend table comments, constraints, and schema notes.

### Key type files

| File | Domain |
| --- | --- |
| `api.ts` | `ApiResponse`, errors, pagination, leaderboard contracts |
| `auth.ts` | roles and auth user shape |
| `branch.ts` | branch entity and status model |
| `merchant.ts` | merchant entity model |
| `scoring.ts` | periods, composite score, breakdown model |
| `onboarding.ts` | onboarding applications, step config, verification response types |
| `fraud.ts` | fraud flags and enums |
| `force-majeure.ts` | event types and adjustment types |
| `parameters.ts` | scoring parameter model |
| `ho.ts` | head-office shape |
| `transaction.ts` / `trading.ts` | transaction and chart-support contracts |

### Core concepts represented in types

#### Auth model

- roles: `branch | ho | admin`
- auth user: `id`, `name`, `email`, `role`, `branch_id`, `ho_id`

#### API envelope

Every backend response is expected to follow:

- `success`
- `data`
- `meta.timestamp`
- `meta.period_id`
- `meta.request_id`
- `error`

#### Branch/merchant model

The repo documents a rich business entity shape with:

- sector and location references
- business type
- transaction pattern
- platform capture percentage
- branch status

#### Scoring model

The repo uses a six-part score breakdown:

- trading performance
- margin efficiency
- location opportunity
- transaction quality
- momentum
- ecosystem contribution

Plus many intermediate fields such as:

- sector percentile rank
- z-score
- location multiplier
- payout amount
- fatigue dampener fields

#### Onboarding model

The onboarding model includes:

- multi-step workflow state
- KYC statuses
- visit outcomes
- commission models and tiers
- bank verification fields
- QR activation data
- audit trail entries

### Type-export nuance

`src/lib/types/index.ts` exports many files, but not `merchant.ts`. In practice the repo still exposes a deprecated `Merchant` alias from `branch.ts`, which keeps older imports working but reinforces the branch-vs-merchant naming transition.

## 19. Constants Architecture

Constants do more than store strings. They also act as policy/config metadata for the UI.

### `navigation.ts`

Defines all role-based nav menus and their inline SVG path data.

### `strings.ts`

Centralizes user-facing copy by feature area:

- common labels
- login copy
- dashboard labels
- HO copy
- leaderboard copy
- admin copy

### `scoring.ts`

This file is especially important because it contains:

- scoring parameter definitions
- sub-score labels/descriptions/weights
- improvement tips
- force majeure explanation content
- cohort-health explanation content

In architecture terms, this file acts as a UI-facing knowledge base for the scoring system.

### `onboarding.ts`

Contains:

- field help metadata
- validation rules
- status labels/colors
- onboarding strings and enumerations

### `theme.ts`

Contains:

- chart theme colors
- ranking tier display config
- score ranges
- pagination defaults
- time-range options

### Barrel nuance

`src/lib/constants/index.ts` exports only a subset of constant files. Notably, `strings.ts` and some other files are often imported directly instead of through the barrel.

## 20. Utilities Architecture

### `cn.ts`

Combines `clsx` and `tailwind-merge` to produce the standard `cn()` helper.

### `format.ts`

Provides formatting helpers for:

- INR currency
- decimal INR
- score and percent changes
- safe score formatting with fallback `--`
- compact numeric display
- date and period-range formatting
- rank-tier derivation

This file is especially important because it contains guard logic for numeric formatting, which helps prevent `toFixed()` crashes when backend data is missing.

### `colors.ts` and `effects.ts`

These support semantic styling and effects-layer utilities.

### `sounds.ts`

Defines cached HTML Audio loading and playback helpers for:

- bell
- cha-ching
- level-up
- tick

Public audio files live under `public/sounds`.

Architectural note: the helper exists, but current pages do not call `playSound()` or `preloadSounds()` yet.

## 21. Mock Data Layer

`src/lib/mock` contains reference datasets for:

- branches
- candlesticks
- force majeure
- fraud flags
- head offices
- leaderboard
- locations
- onboarding
- parameters
- referrals
- scores
- scoring periods
- sectors
- ticker

This layer is useful for:

- design-time data modeling
- backend contract examples
- seed/reference documentation

It is **not** used by the active runtime path. A workspace-wide search shows no current imports of `@/lib/mock` from the app or route handlers.

## 22. API Route Architecture

The Next route handlers under `src/app/api` are a BFF/proxy layer.

### Shared behavior

Most route handlers:

- accept the incoming browser request
- keep search params/body intact
- call `backendUrl()` with the matching upstream path
- attach `Authorization` from `kutoot_token` when present
- return proxied JSON back to the browser

There is almost no business logic in these handlers. The backend remains the real source of truth.

### Auth routes

| Method | Route | Upstream | Notes |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | `/auth/login` | Also sets `kutoot_token` and `kutoot_auth` cookies |
| `POST` | `/api/auth/logout` | `/auth/logout` | Also clears cookies locally |
| `GET` | `/api/auth/me` | `/auth/me` | Returns 401 early if no auth header can be built |

### Leaderboard and scores

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/leaderboard` | `/leaderboard` |
| `GET` | `/api/ticker` | `/ticker` |
| `GET` | `/api/scores/periods` | `/scores/periods` |
| `GET` | `/api/scores/range` | `/scores/range` |
| `GET` | `/api/scores/[periodId]` | `/scores/:periodId` |

### Branch routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/branches/[id]` | `/branches/:id` |
| `GET` | `/api/branches/[id]/score` | `/branches/:id/score` |
| `GET` | `/api/branches/[id]/candlesticks` | `/branches/:id/candlesticks` |
| `GET` | `/api/branches/[id]/volume` | `/branches/:id/volume` |
| `GET` | `/api/branches/[id]/payouts` | `/branches/:id/payouts` |
| `GET` | `/api/branches/[id]/score-history` | `/branches/:id/score-history` |

### Merchant entity routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/merchants/[id]` | `/merchants/:id` |
| `GET` | `/api/merchants/[id]/score` | `/merchants/:id/score` |
| `GET` | `/api/merchants/[id]/candlesticks` | `/merchants/:id/candlesticks` |
| `GET` | `/api/merchants/[id]/volume` | `/merchants/:id/volume` |

### Branch portal routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/merchant/[id]/deals` | `/merchant/:id/deals` |
| `POST` | `/api/merchant/[id]/deals` | `/merchant/:id/deals` |
| `PATCH` | `/api/merchant/[id]/deals/[dealId]` | `/merchant/:id/deals/:dealId` |
| `DELETE` | `/api/merchant/[id]/deals/[dealId]` | `/merchant/:id/deals/:dealId` |
| `GET` | `/api/merchant/[id]/store` | `/merchant/:id/store` |
| `PATCH` | `/api/merchant/[id]/store` | `/merchant/:id/store` |
| `GET` | `/api/merchant/[id]/transactions` | `/merchant/:id/transactions` |
| `GET` | `/api/merchant/[id]/visitors` | `/merchant/:id/visitors` |

### HO routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/ho/[hoId]/summary` | `/ho/:hoId/summary` |
| `GET` | `/api/ho/[hoId]/branches` | `/ho/:hoId/branches` |
| `GET` | `/api/ho/[hoId]/branch-scores` | `/ho/:hoId/branch-scores` |
| `GET` | `/api/ho/[hoId]/deals` | `/ho/:hoId/deals` |
| `GET` | `/api/ho/[hoId]/transactions` | `/ho/:hoId/transactions` |
| `GET` | `/api/ho/[hoId]/visitors` | `/ho/:hoId/visitors` |

### Admin routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/admin/branches` | `/admin/branches` |
| `GET` | `/api/admin/parameters` | `/admin/parameters` |
| `PUT` | `/api/admin/parameters` | `/admin/parameters` |
| `GET` | `/api/admin/fraud` | `/admin/fraud` |
| `PATCH` | `/api/admin/fraud` | `/admin/fraud` |
| `GET` | `/api/admin/force-majeure` | `/admin/force-majeure` |
| `POST` | `/api/admin/force-majeure` | `/admin/force-majeure` |
| `GET` | `/api/admin/cohorts` | `/admin/cohorts` |
| `GET` | `/api/admin/overrides` | `/admin/overrides` |
| `POST` | `/api/admin/overrides` | `/admin/overrides` |
| `GET` | `/api/admin/payouts` | `/admin/payouts` |
| `POST` | `/api/admin/payouts/mark-paid` | `/admin/payouts/mark-paid` |
| `POST` | `/api/admin/payouts/simulate` | `/admin/payouts/simulate` |

### Onboarding routes

| Method | Route | Upstream |
| --- | --- | --- |
| `GET` | `/api/onboarding` | `/onboarding` |
| `POST` | `/api/onboarding` | `/onboarding` |
| `GET` | `/api/onboarding/[id]` | `/onboarding/:id` |
| `PATCH` | `/api/onboarding/[id]` | `/onboarding/:id` |
| `POST` | `/api/onboarding/check-phone` | `/onboarding/check-phone` |
| `GET` | `/api/onboarding/head-offices` | `/onboarding/head-offices` |
| `POST` | `/api/onboarding/send-otp` | `/onboarding/send-otp` |
| `POST` | `/api/onboarding/verify-otp` | `/onboarding/verify-otp` |
| `POST` | `/api/onboarding/verify-executive` | `/onboarding/verify-executive` |
| `POST` | `/api/onboarding/verify-gst` | `/onboarding/verify-gst` |
| `POST` | `/api/onboarding/verify-pan` | `/onboarding/verify-pan` |
| `POST` | `/api/onboarding/verify-bank` | `/onboarding/verify-bank` |

## 23. How the Repo Is Configured

### Runtime environment variables

The repo currently depends on these environment variables:

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | browser Axios client | Base URL for frontend API calls |
| `KUTOOT_BACKEND_URL` | server proxy helper | Upstream backend root |
| `kutoot_backend_url` | server proxy helper | Lowercase fallback for upstream backend root |
| `NODE_ENV` | auth route handlers | Enables secure cookie flag in production |

### Safe baseline configuration

Recommended local dev baseline:

```env
NEXT_PUBLIC_API_BASE_URL=/api
KUTOOT_BACKEND_URL=http://kutoot.test/api/dashboard
```

### Behavior when backend URL is absent

If no backend env var is present, the proxy helper falls back to `http://kutoot.test/api/dashboard`.

### Configuration points inside code

Besides env vars, the app is configured through code-level constants and providers:

- navigation config: `src/lib/constants/navigation.ts`
- strings/copy: `src/lib/constants/strings.ts`
- scoring explanations and parameter definitions: `src/lib/constants/scoring.ts`
- onboarding validation/help/status labels: `src/lib/constants/onboarding.ts`
- chart theme and rank tier config: `src/lib/constants/theme.ts`
- React Query defaults: `src/components/providers/query-provider.tsx`
- theme behavior: `src/components/providers/theme-provider.tsx`
- default dashboard date range: `src/lib/stores/ui.store.ts`
- default local date range: `src/lib/hooks/use-date-range.ts`

### Admin-configurable runtime behavior

The architecture assumes some backend scoring behavior can be changed through admin UI using `/admin/parameters`. In practice the frontend exposes configuration surfaces for:

- parameter values
- force majeure events
- fraud resolution actions
- score overrides
- payout marking and simulation

## 24. End-to-End Runtime Flows

### Flow A: unauthenticated user hits `/`

1. `src/app/page.tsx` redirects to `/dashboard`.
2. Middleware intercepts `/dashboard`.
3. No valid `kutoot_auth` cookie is found.
4. User is redirected to `/login`.

### Flow B: user logs in

1. Login form calls `useAuth().login()`.
2. Service posts to `/api/auth/login`.
3. Route handler proxies to backend and stores cookies.
4. Auth provider updates local user state.
5. Query cache is cleared.
6. User is redirected to role home page.

### Flow C: branch dashboard loads

1. Root layout mounts providers.
2. Auth provider calls `/api/auth/me` to hydrate user.
3. Dashboard page derives `branchId` from auth context.
4. React Query hooks fetch score, candlesticks, volume, periods, leaderboard.
5. Services call Axios client.
6. Axios client hits `/api/*` routes.
7. Route handlers proxy to backend.
8. UI renders cards/charts/tables with data and local live simulation overlays.

### Flow D: onboarding draft save

1. User advances from one onboarding step to the next.
2. `OnboardPage` marks the step complete.
3. If `applicationId` exists, it PATCHes the draft.
4. Otherwise it creates the application first, stores the returned `application_id`, then advances.
5. The local onboarding store remains the source of truth for in-progress UI state.

### Flow E: admin payout management

1. Admin opens `/admin/payouts`.
2. Page fetches scoring periods and payout records.
3. Admin can select payout rows with `status=allocated`.
4. Mutation posts selected IDs to `/api/admin/payouts/mark-paid`.
5. Query cache invalidates and the table refreshes.

### Flow F: admin payout simulation

1. Admin switches the page to simulation mode.
2. Chooses date range and optional pool override.
3. Page resolves the latest closed period in range.
4. Mutation posts to `/api/admin/payouts/simulate`.
5. Returned entries are shown in a summary, chart, and result table.

## 25. Architectural Gaps, Oddities, and Current State Notes

These are not theoretical observations. They come directly from the current repo state.

### Security and routing

- Merchant routes `/deals`, `/store`, `/transactions`, and `/visitors` are not covered by middleware matcher protection.
- Middleware route gating depends on a serialized user cookie for role checks.

### Naming consistency

- `branch` and `merchant` are both used throughout the repo.
- The route group `(merchant)` actually renders branch-facing pages.
- `KBI` and `KMI` naming is mixed across files.

### Barrel/export consistency

- `services/index.ts` omits merchant-related service files.
- `hooks/index.ts` omits several implemented hooks.
- `stores/index.ts` omits `preferences.store.ts`.
- `constants/index.ts` exports only a subset of constant modules.

### Documentation state

- `README.md` is still the default starter README.
- `SYSTEM_AUDIT.md` contains a much deeper scoring/business logic explanation than the README and should be considered a companion reference.

### Runtime architecture clarity

- The app includes mock datasets, but runtime uses backend proxies instead.
- “Live” visuals are partly backend-polled and partly locally simulated.
- `BottomNav` and sound playback helpers exist, but are not fully wired into the main user flow.

### Product completeness

- `src/app/(merchant)/applications/` exists but is empty.
- There is no visible test suite or automated validation layer in the repo root.
- `next.config.ts` is currently empty, which is fine for now but means image domains, headers, rewrites, and other deploy-specific Next config are not yet formalized.

## 26. How to Run and Extend the Repo

### Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

### Build and start

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

### If you want the frontend to work correctly end-to-end

You need a backend that:

- exposes the upstream endpoints mirrored by `src/app/api`
- returns the expected `ApiResponse<T>` envelope
- supports `/auth/login`, `/auth/me`, `/auth/logout`
- accepts bearer auth used by `kutoot_token`
- enforces authorization server-side by role

### If you want to extend the dashboard safely

Use these extension points:

- add routes under the appropriate App Router group and reuse `AppShell`
- add new service functions in `src/lib/api/services`
- wrap them with React Query hooks in `src/lib/hooks`
- add/adjust shared design primitives under `src/components/ui`
- centralize new copy and explanation text under `src/lib/constants`
- preserve the `ApiResponse<T>` contract in both frontend types and backend responses

## 27. Final Summary

This repository is best understood as a role-based Next.js dashboard plus a thin proxy/BFF layer.

The frontend architecture is organized around:

- App Router layouts and route groups
- a shared authenticated shell
- React Query for server state
- Zustand for targeted client state
- a service layer over Axios
- Next route handlers that proxy into a separate backend
- a strong TypeScript contract layer that documents domain concepts in detail

The most important concepts to remember are:

1. The real business engine is upstream, not inside Next.
2. The dashboard is heavily client-rendered but structurally organized by App Router.
3. Onboarding is the richest local workflow in the repo.
4. Admin screens are operational controls over scoring, fraud, payouts, overrides, and force majeure.
5. Mock data and audit docs are reference layers, not the active runtime source.
6. There are meaningful architecture gaps today, especially around route protection coverage and naming consistency.

For formula-level scoring logic, fraud heuristics, and business-rule depth beyond the UI/BFF architecture, also read `SYSTEM_AUDIT.md`.
