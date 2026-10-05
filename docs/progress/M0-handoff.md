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

## Not started

M0.3 (demo cards) through M0.9 (test kit) — see the plan file for the full breakdown, the font/demo-data/M0.9 decisions already made with the user, and the verification table. M0.8 (deploy) stays deferred per the original scope.

Nothing under `packages/db/migrations/` exists yet — no migration has been generated or run.

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

M0.3 — Live demo on three real products: a one-off capture script (`pnpm demo:capture`, already scaffolded) stores precomputed comparison JSON in `apps/web/content/demo/`; render it with real result-card components in the `demo-m0-3` slot. No affiliate links in the demo. Per the user's standing instruction, do not start this until told to.
