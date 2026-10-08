# M0 handoff

Plan file: `C:\Users\ARAF\.claude\plans\vast-floating-lollipop.md` (full task breakdown, decisions, verification table).

## Done

**M0.1 — Scaffold.** Committed as `34f5245 chore(repo): scaffold monorepo and local services (M0.1)`, pushed to `origin/main`.

- pnpm workspaces + Turborepo; `apps/web` (Next.js 16.3.8, React 19.2, Tailwind v4, placeholder home page); `packages/{schemas,config,db,email,ui}`; `tooling/tsconfig/*`.
- `infra/docker-compose.yml` — `pgvector/pgvector:pg18` (5432), `redis:7` (6379), Mailpit (1025/8025).
- `eslint.config.mjs` — ARCH §6.1 import boundaries (web ↛ db/providers/ai, with the DEC-031 override for `apps/web/app/api/**` and `apps/web/app/admin/**`), SEC-50 `react/no-danger`, UI §9.2 forbidden-words lint.
- `packages/db/src/schema.ts` — exactly the two Gate 0 tables (SCHEMA §12): `waitlist_signups`, `preorders`. No migrations generated yet.
- `packages/email` — `sendEmail()` picks SMTP (Mailpit) or Resend by `EMAIL_TRANSPORT`; Resend transport written, unselected.
- `packages/ui` — UI §5.1 token set in `tokens.css`; `formatLandedPrice()` names the uncertain component on an incomplete total (CW-3 / rule 4), tested.
- `.env.example` — every TRD §28 variable plus the five M0 additions (`EMAIL_TRANSPORT`, `SMTP_HOST`, `SMTP_PORT`, `PAYMENTS_PROVIDER`, `ANALYTICS_TRANSPORT`, `APP_DOMAIN`); `pnpm env:local` generates `.env.local` with fresh secrets.
- `pnpm lint && pnpm typecheck && pnpm test` all pass (22 tests, 6 packages).

### Version pins that diverged from the docs, and why

- **TypeScript 5.9.3**, not the 7.0.2 currently tagged `latest` on npm — `typescript-eslint@8.71.0` caps its peer range at `<6.1.0`. TRD §2 only requires "5.9+", so this satisfies the floor.
- **Drizzle ORM/Kit 0.45.3**, not the 1.0 line — 1.0 is still in `rc`/`beta` tags on npm. TRD §2 says "latest stable (1.0 line)"; revisit once 1.0 actually ships stable.
- **ESLint 9.39.5**, not 10.x — `eslint-config-next@16.3.8`'s own rule engine throws (`scopeManager.addGlobals is not a function`) under ESLint 10; its sub-plugins (`eslint-plugin-import`/`jsx-a11y`/`react`) also peer-cap at ESLint 9. Revisit when Next ships ESLint 10 support.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 4320` (3 days, SEC-81). Two packages were initially pinned to versions younger than that (`lucide-react@1.52.0`→`1.50.0`, `turbo@2.11.7`→`2.11.6`) and failed install until repinned. If a future `pnpm install` fails the same way, repin to the newest version older than 3 days — don't lower `minimumReleaseAge`.
- `@react-email/components` is deprecated upstream ("no longer supported") — not used. The waitlist-confirm template is plain JSX rendered through `@react-email/render` directly.
- `@base-ui-components/react` was renamed upstream to `@base-ui/react` — `packages/ui` depends on the new name (`1.8.0`).

**M0.2 — Gate 0 landing page.** Committed as `68b92c7 feat(web): landing page (M0.2)`, pushed to `origin/main`.

- `apps/web/app/page.tsx` composes `app/_components/landing/`: `Hero` (PRD §3 positioning claim, verbatim), `TrustQuestions` (the three questions), `HowItWorks` (3 steps), `PricingPreview` (reads `PLANS` from `@byb/config`, not hard-coded), `Faq` (native `<details>`/`<summary>` — no new Accordion component needed), `LandingFooter` (legal links).
- Marked slots (`data-slot="demo-m0-3"` / `"email-capture-m0-4"` / `"preorder-m0-5"`) hold the M0.3 demo cards, M0.4 email form and M0.5 pre-order card — not built yet, per the task brief.
- Legal placeholder pages added so the footer links resolve: `/privacy` (LEGAL-08), `/terms` (LEGAL-09), `/pre-order-terms` (LEGAL-10), `/affiliate-disclosure` (LEGAL-05) — all share one `LegalPlaceholder` component, content marked "pending legal review"; M0.6 replaces the content.
- No new shadcn components were added to `packages/ui` for this task — the page uses tokens (`bg-card`, `border-border`, `text-muted-foreground`, etc.), `cn`, and `formatCents` only. `packages/ui` still has no `Button`/`Card`/`Accordion`; the first component that needs one (likely `ResultCard` in M0.3 or M8/M11) should add it then.
- `apps/web/app/layout.tsx`: `suppressHydrationWarning` added to `<html>` and `<body>` (browser extensions inject attributes there).
- `e2e/landing.spec.ts` (Playwright + `@axe-core/playwright`): asserts structure (sections/headings, the three trust questions, the three how-it-works steps, slot presence, footer links resolve) and that pricing values match `packages/config` — not exact copy. Axe checked at 375px and 1440px, no serious/critical violations. Root `package.json` gained `@byb/config` and `@byb/ui` as devDependencies so the spec can import `PLANS` and `formatCents` directly.
- Manually checked 768px and 1024px via screenshot (grids collapse from 3 → fits each breakpoint per UI §6); not part of the automated suite since the task only asked for axe at 375/1440.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e` all pass.

**M0.3 — Live demo on three real products.** Local-only; not yet committed as the Gate 0 "live" test (that still needs real retailer data — see below).

- `packages/core` (new package): `landed-cost.ts` (`computeLandedCost`, `roundHalfUp` — TR-LC-01/05/06, reused by M8), `demo-validate.ts` (`findTodoPaths`, `checkLandedCostArithmetic`), `relative-time.ts` (`formatCheckedAgo` — "Checked 3 minutes ago"), `history-label.ts` (`historyLabel` — TR-HIST-03 copy). All pure, all unit-tested (22 tests).
- `packages/schemas/src/demo.ts`: `demoComparisonSchema` now reuses `resultListingSchema`/`reviewAuthenticitySchema`/`priceHistory90dSchema` as-is and adds `capturedBy` plus a per-block `illustrative: boolean` on each listing's `reviewAuthenticity` and on the top-level `history` — replacing the earlier whole-document `_sample` flag with the finer-grained shape the task asked for.
- `scripts/validate-demo.ts` (`pnpm demo:validate`): fails on any leftover `"TODO"` string, any schema error, or a `landedPrice` that doesn't match `listedPrice + shippingCost + estimatedTax`.
- Three templates in `apps/web/content/demo/`: `sony-wh-1000xm5.json`, `robot-vacuum.json`, `ipad-base.json` (includes a 4th "Renewed" listing wired through `ranking.cheaperAlternative`, not through the top-3). All three now hold real hand-captured retailer data and pass `pnpm demo:validate` — see "Real demo data" below.
- `packages/ui`: real components per UI §7.3–7.6 — `ResultCard`, `LandedPrice`, `TrustBadge` (+ signals sheet via a `Sheet` wrapper over Base UI `Dialog`), `HistoryIndicator`, `ReasonList`. No retailer images on the card itself (LEGAL-16); the product image moved to a shared header above the three cards — see "Product images and honest ranking reasons" below. Outbound CTA is automatically the disabled "Links available at launch" button whenever `listing.outboundUrl` is absent (true for every M0.3 demo listing, since `/go/` tokens don't exist until M16) and becomes a real link once `outboundUrl` is set.
- `apps/web/app/_components/landing/demo-picker.tsx`: client-side tab picker; `DemoSlot` (in `slots.tsx`) loads the 3 real JSON files, keeps only the ones that pass `demoComparisonSchema` (so a file still full of TODOs falls back to the old "coming soon" placeholder instead of breaking the build), and renders `DemoPicker` with whatever validates.
- `apps/web/app/dev/demo-preview/` + `apps/web/content/demo/__fixtures__/comparisons.ts`: an unlinked, noindexed dev harness rendering the picker against fully-valid fixture data, since the real content files intentionally don't validate yet. `e2e/demo.spec.ts` runs against this route (3 tabs × 3 cards, condition/landed-price/"Example analysis" visible, disabled CTAs, axe at 375px). **ponytail debt:** no `flags.isOn()` gate (that's M1.3) — delete this route once M11's real results page gives the same proof.
- `pnpm lint && pnpm typecheck && pnpm test` pass (49 unit tests, 22 of them new in `packages/core`); `pnpm --filter @byb/web build && pnpm test:e2e` pass (11 e2e tests) — **but only with `--workers=1`**. Multi-worker Playwright runs in this sandbox intermittently crash the browser mid-suite (`Target page, context or browser has been closed`) on `e2e/landing.spec.ts`, unrelated to this change (confirmed by running that file alone, repeatedly, across worker counts) — likely this Windows sandbox's resource limits, not a real bug. Flag this if CI shows the same flakiness. `playwright.config.ts` now pins `workers: 1` locally (CI keeps its own default) so this doesn't need `--workers=1` passed by hand anymore.

### Real demo data

- `pnpm demo:derive` (new, `packages/core/src/demo-derive.ts` + `scripts/derive-demo.ts`): fills the computed fields — `estimatedTax` (NY ZIP 10001, 8.875% combined rate on price + shipping), `landedPrice`/`landedPriceComplete`/`uncertainComponents` (a 0–1099¢ shipping range when shipping is unknown), `ranking.top` order + deterministic reasons, and `ranking.cheaperAlternative` saving + reason — from the raw facts (title, seller, price, shipping, condition, warranty, returns) already hand-entered in the three JSON files. Run it, then `pnpm demo:validate`.
- All three `apps/web/content/demo/*.json` files now hold real facts captured 2026-10-07 via Claude in Chrome browser automation, ZIP 10001, no sign-in/cart/checkout. Evidence (URL, timestamp, exact price/shipping/warranty/returns text per listing) is in `apps/web/content/demo/captures.md`. Robot vacuum model picked: **Shark AI Ultra AV2501S** (same MPN sold new on all three sites).
- **`ranking.cheaperAlternative` is absent from `ipad-base.json`.** The Amazon Renewed iPad ($409.99) is genuinely more expensive landed ($446.38) than the new one ($434.41) — a real pricing quirk on a model this new, not a capture error. `deriveCheaperAlternative` now returns `null` (and the script deletes the key) whenever the computed saving isn't positive, rather than ever showing a false "cheaper" claim (rule 4). If a real cheaper renewed listing turns up later, re-run `pnpm demo:derive` and the card will reappear.
- Amazon and eBay are price-tied on both the iPad ($399.00) and the Sony headphones ($198.00) — landed costs match exactly, so ranks 1/2 are a genuine tie. (Fixed in the polish pass below: this now reads "Same delivered price as #N", not "$0.00 less/more".)
- eBay listings for all three products show weak/no returns ("Seller does not accept returns", or "buyer pays return shipping") — realistic, not fabricated.
- Verified none of the retailer "was"/"Comp. Value"/list-price strike-through figures seen while capturing (e.g. Best Buy's "Save $50", "Comp. Value: $449.00") made it into the JSON or any rendered component — they only appear in `captures.md` as evidence text.

### Product images and honest ranking reasons (M0.3 polish)

- Each demo product now shows one neutral SVG illustration (new `apps/web/public/demo/{tablet,headphones,robot-vacuum}.svg`, drawn to match the token palette — no retailer photo, LEGAL-16) in a shared header above its three cards, via `next/image` with explicit `width`/`height` (no layout shift). The per-card gray placeholder box is gone. `demoComparisonSchema.product.image` (`src`, `alt`, `source`, `license`) is optional and new (DEC-035) — `source`/`license` exist so a manufacturer press image can replace the illustration later with its provenance on record.
- `packages/core/src/demo-derive.ts`'s `deriveRankingTop` was rewritten (TDD, see `demo-derive.test.ts`) to fix two honesty bugs surfaced by the real captured data:
  - Landed prices within $3 or 2% (whichever is larger) now count as a tie — reason text reads "Same delivered price as #N", never "$0.00 less/more". Ties are broken by returns window, then warranty length, then seller (official retailer first, then name), so the ordering stays fully deterministic.
  - "Best returns" now only goes to a listing whose window is non-zero **and strictly longer** than the #1 pick's. The real data caught a case where this was wrong: the Best Buy iPad listing's 15-day return window exactly matched Amazon's, but the old code still labeled it "Best returns" with the nonsensical reason "15-day returns vs 15-day". It now correctly gets no returns-based label.
  - A 0-day or missing return window reads "No returns" everywhere (ranking reasons and the result card's own returns line) — never "0-day".
- `TrustBadge` and `HistoryIndicator`: the icon+label stay on one line now; "(Example analysis)" sits on its own line underneath instead of wrapping awkwardly at 375px (re-verified via the Playwright axe check).
- `e2e/demo.spec.ts` gained a test asserting each tab shows exactly one alt-texted product image and that neither "$0.00" nor a bare "0-day" appears anywhere on the page. All 12 e2e tests pass (`pnpm --filter @byb/web build && pnpm test:e2e`).
- Docs: UI §7.14 (now v1.1) documents both the image contract and the ranking-reason rules; DEC-035 records the schema addition.

**M0.4 — Waitlist (double opt-in).** Local-only.

- `packages/db/migrations/0000_wooden_leper_queen.sql` — the first migration (both Gate 0 tables, since both were already in `schema.ts` from M0.1; `CREATE EXTENSION IF NOT EXISTS citext` added by hand, drizzle-kit doesn't emit it). Applied to the local Docker Postgres (`pnpm db:migrate`).
- `packages/core/src/confirm-token.ts` (+ tests): signed, expiring (`LINK_SIGNING_SECRET`, 24 h) HMAC-SHA256 token for the confirm link — `id` + `exp`, base64url, pure (time passed in).
- `apps/web/lib/{turnstile,rate-limit,analytics}.ts` (+ tests): SEC-30 server-side Turnstile verification (real HTTP call to Cloudflare, even with the always-pass test keys); SEC-13 in-process fixed-window rate limiter (3/email/15 min, 10/IP/15 min — **ponytail debt:** resets on restart, not shared across instances; M15 replaces every call site with the Redis-backed limiter once this runs on more than one process); a console-only `track()` adapter validated against `analyticsEventSchema`, built ahead of M0.7's PostHog wiring (DEC-036 adds `waitlist_confirmed` to the TR-ANL-02 event set).
- `apps/web/app/api/waitlist/route.tsx` (POST, DEC-031 db-import override) — validates, rate-limits, verifies Turnstile, upserts via the M0.1-scaffolded `waitlistRepo`, sends the confirmation email only when not already confirmed, and always returns the same enumeration-safe response (SEC-13 pattern) regardless of whether the address already existed.
- `apps/web/app/api/waitlist/confirm/route.ts` (GET) — verifies the token, calls `confirmSignup`, redirects to `/confirm?status=ok|expired|invalid`. `apps/web/app/confirm/page.tsx` renders the friendly copy for each status (no db import needed there, so it stays outside the DEC-031 override).
- `apps/web/app/_components/landing/{waitlist-form,turnstile-widget}.tsx`: React Hook Form + the same `waitlistSignupRequestSchema` Zod schema the server uses (via `z.input`/`z.output` since `source` carries a default); reads `?source=`/`?utm_*=`/`document.referrer` once on mount; consent checkbox uses the existing `CONSENT.text`/`CONSENT.version` from `packages/config` (already written in M0.1, never wired up until now); submit is disabled until the Turnstile widget (loaded from Cloudflare's script, no new dependency) produces a token.
- Two latent bugs fixed to unblock this (not M0.4-specific, but both blocked it): `packages/config/src/public.ts` and `server.ts` treated an env var left as `""` (how `.env.example`/`.env.local` represent "unset optional") as a value, not as unset, since Zod's `.optional()` only accepts `undefined` — added an empty-string-to-undefined preprocessor to both, with tests. `infra/docker-compose.yml`'s Postgres volume mounted at `/var/lib/postgresql/data`, which pg18's image no longer supports (docker-library/postgres#1259); the container never actually started before this. Fixed to mount `/var/lib/postgresql` instead; the old empty volume was removed.
- Tests: `confirm-token.test.ts`, `rate-limit.test.ts`, `turnstile.test.ts`, `analytics.test.ts`, `public.test.ts`, `server.test.ts` (unit); `packages/db/src/__tests__/waitlist.integration.test.ts` via the new `pnpm test:integration` (`vitest.integration.config.ts`, needs `pnpm services:up`) — idempotent upsert, confirm-is-a-no-op-on-replay, citext case-insensitivity; `e2e/waitlist.spec.ts` — full browser flow (fill form → real Turnstile widget → submit → poll Mailpit's REST API for the email → follow the link → confirmed page), invalid-token page, unchecked-consent validation, axe at 375px. Manually verified the same flow with curl + Mailpit's API + a direct `psql` check that `confirmed_at` was set.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration` all pass (84 unit tests, 3 integration); `pnpm --filter @byb/web build && pnpm test:e2e` passes (16 e2e tests, all specs).

**M0.5 — Pre-orders (mock + Stripe providers).** Local-only.

- `apps/web/lib/payments/`: `PaymentProvider` interface (`createCheckout`, `parseWebhook`), selected by `PAYMENTS_PROVIDER` via `getPaymentProvider()`. `mock.ts` is the local default: `createCheckout` points at `/checkout/mock?...`; its "Pay" button posts to `/api/payments/mock-pay`, which signs the webhook body server-side (`mock-signature.ts`, HMAC-SHA256 over the raw body, reusing `LINK_SIGNING_SECRET` rather than adding a new secret) and forwards it to `/api/payments/webhook` — the exact route Stripe would call. `stripe.ts` is written and unit-tested (Stripe's `generateTestHeaderString` test helper, no network calls) but unselected: real Checkout Session creation plus `webhooks.constructEvent` signature verification; only `checkout.session.completed` is acted on — TR-BILL-07 puts Stripe refunds in the dashboard, not a webhook, so every other event type is `ignored`.
- `apps/web/app/api/preorder/checkout/route.ts` (POST): validates `preorderCheckoutRequestSchema`, rate-limits and Turnstile-verifies the same way the waitlist route does, then calls `getPaymentProvider().createCheckout()` and returns `{ checkoutUrl, sessionId }`.
- `apps/web/app/api/payments/webhook/route.tsx` (POST): one handler for both providers. `preorderRepo.recordPaidPreorder()`'s `ON CONFLICT DO NOTHING` on `stripe_checkout_session_id` makes a duplicated delivery a no-op — `created` is only `true` the first time, so the receipt email and `preorder_paid` analytics event fire exactly once.
- `apps/web/app/checkout/mock/page.tsx`, `apps/web/app/preorder/{success,cancel}/page.tsx`: the test-checkout page (clearly labeled "Test checkout — no real payment"), and the two outcome pages.
- `apps/web/app/_components/landing/preorder-card.tsx`: the real pre-order card (email + Turnstile, same pattern as `WaitlistForm`), replacing the M0.2 placeholder slot.
- `packages/email/src/templates/{preorder-receipt,preorder-refunded}.tsx`: receipt sent on first paid webhook; refund email sent by the script below.
- `packages/db/src/repositories/preorders.ts` gained `refundPreorderById(id, now)` (updates by the row's own id, not the session id). `scripts/preorder-refund.tsx` (`pnpm preorder:refund <id>`): marks a pre-order refunded and emails the customer — covers the `mock` provider used locally; real Stripe refunds go through the dashboard per TR-BILL-07.
- `apps/web/app/pre-order-terms/page.tsx`: replaced the generic `LegalPlaceholder` with real draft content (still headed "pending legal review," LEGAL-10) — refund terms, the automatic-refund-if-launch-is-delayed clause, and a chargeback note, all from the DECIDE-15/LEGAL-10 defaults.
- Tests: `mock-signature.test.ts`, `mock.test.ts`, `stripe.test.ts` (unit, 10 new); `packages/db/src/__tests__/preorders.integration.test.ts` (idempotency, refund-by-id, counts, 7 tests including 3 pre-existing from the repo's earlier webhook work); `e2e/preorder.spec.ts` — full mock-checkout flow (fill email → mock checkout → Pay → success page → receipt in Mailpit with the correct `$49.00`), cancel path, axe at 375px. `e2e/waitlist.spec.ts`'s two email-field locators were scoped to `[data-slot="email-capture-m0-4"]` since the page now has two "Email" labels.
- Manually verified `pnpm preorder:refund <id>` end to end against a real local row: marks `refunded_at`, sends the refund email (confirmed in Mailpit), and exits cleanly (the script calls `process.exit(0)` after sending — otherwise the open `postgres-js` pool keeps the process alive).
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration` all pass (104 unit tests, 11 integration); `pnpm --filter @byb/web build && pnpm test:e2e` passes (19 e2e tests).
- DEC-037 records the design choices (payments lib location, mock signing secret reuse, Stripe refund scope, refund script keying on row id).

**Guard — mock payments provider is local-only.** Committed as `dcd40a1 fix(config): restrict mock payments provider to APP_ENV=local (M0.5)`, pushed.

- `packages/config/src/server.ts`'s `serverEnvSchema` now fails validation if `PAYMENTS_PROVIDER=mock` and `APP_ENV` isn't `local` — the mock provider and `/checkout/mock` have no real money behind them and must never run outside local dev. `/checkout/mock`'s page and `/api/payments/mock-pay`'s route each add an explicit `isLocal()` 404 check too (defense in depth, independent of config validation).
- Tests: `packages/config/src/__tests__/server.test.ts` — rejects `mock`+non-local, allows `mock`+local, and `isLocal()` itself is true only when `APP_ENV=local`.

**M0.6 — Legal pages.** Committed as `7a56ead feat(web): legal page drafts (M0.6)`, pushed.

- `/privacy`, `/terms`, `/affiliate-disclosure`, `/pre-order-terms` now hold real draft content instead of the generic `LegalPlaceholder`, each behind a shared `LegalDraftBanner` ("Draft — pending legal review").
- `/privacy` lists only what the code demonstrably collects today — read from the actual code paths, not invented: email + consent version + source/UTM/referrer (`waitlist_signups`), pre-order email/amount/offer/status (`preorders`), Turnstile token + IP sent to Cloudflare for verification (not stored; SEC-30), and anonymous analytics events (no email/IP). States plainly that we set no cookies ourselves yet (the ZIP/anon cookies are M1+, not described until they exist) and that applicable privacy law, retention periods, and a complaints process are still pending (LEGAL-08).
- `/terms` covers site use, links to `/pre-order-terms` for pre-order-specific terms, no-guarantee-on-third-party-prices, limitation of liability, and a placeholder governing law (LEGAL-09).
- `/affiliate-disclosure` copies UI §9.3's standard blocks verbatim and states no affiliate links are live yet (LEGAL-05).
- New `LEGAL_ENTITY` placeholder (`packages/config/src/app.ts`): name, address, contact email, governing law — all bracketed placeholders until the entity is incorporated and legal review sets real values.
- `/pre-order-terms` (already real content from M0.5) now reuses the same `LegalDraftBanner` instead of its own inline banner.
- Tests: `e2e/legal.spec.ts` — every draft page shows the banner, privacy/affiliate content assertions, axe at 375px.

**M0.7 — Analytics + Gate 0 dashboard.** Committed as `8b60eff feat(web): analytics + gate 0 dashboard (M0.7)`, pushed.

- `packages/schemas/src/analytics.ts` gained `page_view` (`path`) and `preorder_refunded` (`amountCents`), completing the M0.7 event set alongside the M0.4/M0.5 events already wired (`waitlist_signed_up`, `waitlist_confirmed`, `preorder_started`, `preorder_paid`, `demo_card_opened`).
- New call sites: `PageViewTracker` (client component mounted in `RootLayout`, fires on every path change via `usePathname`); `demo-picker.tsx` fires `demo_card_opened` when a demo result card is clicked; `scripts/preorder-refund.tsx` fires `preorder_refunded` after a successful refund.
- `apps/web/lib/analytics.test.ts`: new test asserts an event payload carrying `email` or `ip` is rejected by the strict schema (SEC-51 / TR-ANL-05) — the console adapter itself is unchanged (still M0.4's `track()`; PostHog transport is still ponytail debt for a later milestone, not built this task since `ANALYTICS_TRANSPORT=console` is all M0 needs).
- `/admin/gate0` (new, local-only — 404 outside `APP_ENV=local`, `export const dynamic = 'force-dynamic'` so live counts and the APP_ENV gate are never baked into a static build): signups (total/confirmed/by source/by day — new `waitlistRepo.signupsByDay()`), pre-orders (paid/refunded via `preorderRepo.countPreorders()`), signup→pre-order conversion, and the hand-logged "when does it ship" replies from `apps/web/content/gate0-manual.json` (new `gate0ManualRepliesSchema` in `packages/schemas`; the file starts empty — no outreach has run yet, M0.9 is what fills it).
- New pure `gate0Status()` helper (`packages/core`): `proceed` / `reconsider` / `not_enough_data` against the PRD §12.1 thresholds (signups 100+/under 30, "when does it ship" 10+/under 3, pre-orders 10+/0), unit-tested.
- Tests: `packages/core/src/__tests__/gate0-status.test.ts`; `packages/schemas/src/__tests__/schemas.test.ts` gained `gate0ManualRepliesSchema` cases; `packages/db/src/__tests__/waitlist.integration.test.ts` gained a `signupsByDay` case; `e2e/gate0-dashboard.spec.ts` — page loads locally and shows all three sections.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration` all pass (107 unit tests, 8 integration); `pnpm --filter @byb/web build && pnpm test:e2e` passes (27 e2e tests).

**Multi-page site structure (DEC-038/039).** Local-only, not yet run as part of an M0.x task — restructures the M0.2–M0.7 single-page landing into separate routes ahead of hosting.

- Global `SiteHeader` (`apps/web/app/_components/site-header.tsx`) and `SiteFooter` (moved from `landing/footer.tsx`) now render in `RootLayout`, on every route. The mobile menu is a native checkbox + `<label>` disclosure styled with `peer-checked:flex` — no client JS, no duplicated nav markup between the mobile/desktop blocks. "Sign in" is a disabled placeholder (`title="Coming soon"`); there's no auth yet to link to.
- `/` (`app/page.tsx`) is now hero + trust questions + the M0.3 demo (unchanged) + two short CTAs to `/pricing` and `/notify`. `HowItWorks` folded into a short inline 3-step line inside `Hero`, which also gained a marked, non-functional `data-slot="search-bar"` placeholder for the future search box (Prompt B). The old `Faq` and `PricingPreview` components are deleted — `Faq`'s content wasn't specific to any one page; a new, shorter credits FAQ lives on `/pricing` instead.
- `/pricing` (new): the four plan cards from `packages/config` in a CSS grid (equal-height via grid stretch, `flex flex-col` + `mt-auto` pins each "Get started" button to the same bottom offset across cards — verified by a new e2e assertion), Starter highlighted, 1/2/4-column responsive, an Enterprise line, the pre-order offer card (reused `PreorderCard`, now labeled "Founding offer"), and a short credits FAQ.
- `/notify` (new): the existing `WaitlistForm`, unchanged API/Turnstile/double-opt-in, with a "what you'll get" list. Reads `?q=` to show "We'll tell you when you can check '{query}'" instead of the generic heading.
- `waitlist_signups` gained a nullable `query` column (migration `0001_wide_winter_soldier.sql`, applied locally); `signupSourceSchema` gained `'search'`. `WaitlistForm`'s existing `readFormDefaults()` (already reading `?source=`/`?utm_*=` from the URL on mount) now also reads `?q=`, and when present sets `source: 'search'` and `query` — a real signup through `/notify?q=sony headphones` lands in Postgres with `source='search', query='sony headphones'` (checked directly via `psql`).
- `e2e/landing.spec.ts` rewritten for the three routes (home/pricing/notify structure, h1s, axe at 375/1440, the pricing-button-offset check); `e2e/waitlist.spec.ts`/`e2e/preorder.spec.ts` point at `/notify`/`/pricing` instead of the old `data-slot` wrappers on `/`, and `waitlist.spec.ts` gained a `?q=` case.
- `pnpm lint && pnpm typecheck && pnpm test && pnpm test:integration` all pass (107 unit, 8 integration); `pnpm --filter @byb/web build && pnpm test:e2e` passes (38 e2e tests, all specs, including both axe breakpoints).
- Docs: UI §3/§7.1/§7.12/§7.14 updated for the new IA (bumped to v1.2); SCHEMA §12 updated for `query` (bumped to v1.1); DEC-038 (the IA split) and DEC-039 (the `query` column + `search` source) recorded.

## Not started

M0.8 (deploy, deferred per the original scope) and M0.9 (run the test — Show HN, r/SideProject, 30 DMs; record results after 2 weeks) — see the plan file for the full breakdown and verification table.

## Commands to pick this back up

```bash
pnpm i
pnpm env:local          # if .env.local doesn't exist yet
pnpm services:up        # Postgres, Redis, Mailpit
pnpm db:generate        # generate the first migration from schema.ts (not yet run)
pnpm db:migrate
pnpm dev
```

Verify the scaffold is still green before continuing:

```bash
pnpm lint && pnpm typecheck && pnpm test
pnpm --filter @byb/web build && pnpm test:e2e   # e2e needs a production build first (playwright.config.ts webServer runs `next start`)
```

## Next step

M0.6 and M0.7 are fully done (see above). Next up is M0.9 (run the test) — M0.8 (deploy) stays deferred per the original scope. Per the user's standing instruction, do not start new M0 tasks until told to.
