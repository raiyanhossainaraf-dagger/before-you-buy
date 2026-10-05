# Before You Buy

Tells a shopper whether a listing can be trusted, not only whether it is cheap. See [CLAUDE.md](CLAUDE.md) and [docs/](docs/) for the full spec.

**Status:** M0 — Gate 0 demand test, local-only (no hosting, no third-party accounts yet).

## Local setup

```bash
git clone <this repo>
cd before-you-buy
pnpm i
pnpm env:local        # copies .env.example to .env.local with local values + fresh secrets
pnpm services:up      # Postgres 18 + pgvector, Redis, Mailpit via Docker Compose
pnpm db:migrate
pnpm dev
```

| Service | URL |
|---|---|
| Web app | http://localhost:3000 |
| Mailpit (sent email) | http://localhost:8025 |
| Drizzle Studio | `pnpm db:studio` → http://local.drizzle.studio |

Other commands: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm services:down`.

Payments run against a local mock checkout page (`PAYMENTS_PROVIDER=mock`) that exercises the same webhook code path as the real Stripe provider. Email sends through Mailpit (`EMAIL_TRANSPORT=smtp`). Turnstile uses Cloudflare's documented always-pass test keys with real server-side verification.
