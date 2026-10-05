# CLAUDE.md — Before You Buy

Read this first in every session. It is the short version; the `docs/` folder is the source of truth.

## What we're building

**Before You Buy** tells a shopper whether a listing can be trusted, not only whether it is cheap. Search a product by name (or paste an Amazon/eBay/Best Buy link) and get the top three options compared on **landed cost** (price + shipping + estimated tax), with **review-authenticity signals**, **90-day price history**, condition/warranty/returns, and **price-drop alerts**. Consumer website first (v4.0), paid tiers and public API next (v4.5).

## Current status

- **Phase:** Pre-build → Gate 0
- **Active milestone:** `M0 — Gate 0 demand test` (see `docs/06-IMPLEMENTATION-PLAN.md`)
- Update these two lines whenever the active milestone changes.

## Documentation map — read the section you need before coding

| Need | Read |
|---|---|
| What and why (requirements `CW-*`, `AR-*`, pricing, gates) | `docs/01-PRD.md` |
| Components, stack, principles, provider policy | `docs/02-ARCHITECTURE.md` |
| Contracts, SSE events, algorithms, budgets, env vars (`TR-*`) | `docs/03-TECHNICAL-REQUIREMENTS.md` |
| Tables, indexes, RLS, Redis keys, queues, retention | `docs/04-BACKEND-SCHEMA.md` |
| Threats, controls (`SEC-*`), PR security checklist | `docs/05-SECURITY.md` |
| Milestones, tasks, acceptance criteria, status board | `docs/06-IMPLEMENTATION-PLAN.md` |
| Screens, flows, tokens, copy rules, accessibility | `docs/07-UI-UX-DESIGN.md` |
| Open legal items, pending decisions + defaults, doc gaps | `docs/08-REVIEW-ITEMS.md` |
| How to change features; feature registry; decision log | `docs/09-CHANGE-MANAGEMENT.md` |

## Stack (floors — pin exact versions in the lockfile)

TypeScript (strict) · pnpm workspaces + Turborepo · Next.js ≥ 16.3.8 / React 19.2 on Vercel · shadcn/ui (Base UI) + Tailwind v4 · Hono on Node LTS (Railway) · BullMQ workers · Zod 4 · PostgreSQL 18 on Neon via Drizzle (pgvector, pg_trgm, `uuidv7()`) · Redis 7 · Better Auth (magic link, passkeys, organizations) · Vercel AI SDK (Gemini first, model from config) · Stripe Billing (v4.5) · Resend + React Email · Turnstile · Sentry, OpenTelemetry, PostHog · Vitest, Playwright, MSW, k6, Lighthouse CI.

## Repo layout

```
apps/      web (Next.js) · api (Hono) · worker (BullMQ) · extension (v5.0, not yet)
packages/  schemas · db · providers · ai · core · auth-policy · email · config · observability · ui
tooling/   shared tsconfig / eslint / prettier      infra/  docker-compose, k6, deploy config
docs/      this documentation set
```

Apps import packages; packages never import apps. `apps/web` must not import `db`, `providers`, `ai` or server secrets. `packages/core` is pure (no I/O; time and config passed in).

## Commands (created in M0/M1 — keep this list accurate)

```bash
pnpm i                                        # install
docker compose -f infra/docker-compose.yml up -d   # Postgres 18 + pgvector, Redis, Mailpit
pnpm dev                                      # web + api + worker
pnpm lint && pnpm typecheck && pnpm test      # run before every commit
pnpm test:integration                         # needs docker services
pnpm test:e2e                                 # Playwright
pnpm db:generate | db:migrate | db:seed       # Drizzle
pnpm evals                                    # matching / trust evaluation suite
pnpm search:debug "<query>"                   # dev: print provider candidates
```

## Non-negotiable rules

1. **Validate at every boundary with strict Zod schemas** from `packages/schemas` — requests, provider responses, LLM output, env vars.
2. **Never fetch a user-supplied URL.** Parse retailer IDs from allowlisted hosts and rebuild the URL server-side.
3. **Money is integer cents; credits are integer millicredits; tax rates are ppm.** No floats in money paths. Round half-up per component.
4. **Landed cost is the compared number.** If shipping or tax is unknown, return a range and name the uncertain component — never a silent partial number.
5. **Retailer terms are code.** Store/display/send-to-LLM retailer data only through the provider policy block (`maxDisplayAgeSec`, `maxRetainSec`, `aiUseAllowed`, `historyAllowed`, attribution). Every stored price has `retain_until`.
6. **Ranking is affiliate-blind.** No commission/affiliate field may be an input to ranking. Reasons are deterministic templates from facts.
7. **Every customer-owned row has `organization_id`;** DB access goes through repositories that require an `OrgScope` (workers use `SystemScope`). RLS is the second wall.
8. **The credit ledger is append-only** with idempotency keys. Corrections are new rows.
9. **No model names in code.** LLM and embedding models come from config via `packages/ai`. Retailer text goes to the LLM as delimited data; the LLM has no tools; output is schema-checked.
10. **Every uncached live search is guarded:** kill switch → rate limit → Turnstile (anonymous) → quota → daily spend cap. Fail closed for anonymous live searches if Redis/Turnstile is down.
11. **Render external text as text.** `dangerouslySetInnerHTML` is banned. Outbound retailer links go only through `/go/{token}`.
12. **Copy rules:** never "fake", "fraud", "scam", "guaranteed", "100%", "lowest price ever", "scraped". Use "checked 3 minutes ago". Affiliate disclosure on every results/product/comparison page and email.
13. **No secrets in the repo, logs or client bundle.** Nothing secret behind `NEXT_PUBLIC_`. Redact emails, IPs, tokens, keys in logs.
14. **Mobile-first and accessible:** test at 375 / 768 / 1024 / 1440 px; 44 px targets; WCAG 2.2 AA; skeletons hold final size.
15. **Docs stay true.** If you change a contract, schema, flow or rule, update the doc in the same PR and add a `DEC-*` entry in `docs/09-CHANGE-MANAGEMENT.md`. Never reuse requirement IDs.

## How to work a task

1. Find the task in `docs/06-IMPLEMENTATION-PLAN.md`; read every doc section it links.
2. Check `docs/08-REVIEW-ITEMS.md` for related items. If an item is open, **use its "default to build with"**, keep it configurable, and say so in the PR.
3. Plan first (files, schemas, tests). Prefer small PRs.
4. Write tests at the layer the TRD names (unit / integration / contract / E2E / eval). Reference requirement IDs in test names or comments.
5. Run lint, typecheck and tests before committing. Commit as `<type>(<scope>): <summary> (M<n>.<k>)` (Conventional Commits).
6. Tick the task, update the status board, and note deviations.

## Ask instead of guessing when

- A change would alter a PRD requirement, pricing, credits or quotas.
- A `LEGAL-*` item affects what you're about to show or store and its default doesn't clearly cover the case.
- You need a new vendor, a new outbound host, or a new category of personal data.
- A migration would rewrite or drop data on a large table.
