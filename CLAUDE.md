# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install                  # Install all workspace dependencies
pnpm dev                      # Build shared, then start web (port 3000) and api (port 3001) concurrently
pnpm build                    # Build all packages
pnpm lint                     # Lint all packages (builds shared first)
pnpm typecheck                # Type-check all packages (builds shared first)
pnpm format                   # Format with prettier

# Individual packages
pnpm --filter @odin-pulse/api dev
pnpm --filter @odin-pulse/web dev
```

No test framework is configured yet.

## Architecture

pnpm monorepo (pnpm 10.33.0, Node 22) with three workspace packages. `packages/shared` must be built before the other two can type-check or lint. All packages use TypeScript strict mode with ES2022 target.

### apps/api — Fastify 5 backend

Entry: `src/server.ts`. Registers route groups and starts a news fetch scheduler on `onReady`. Uses ESM (`"type": "module"` in package.json). Run with `tsx` for dev, `tsc` for build.

**Module structure** (`src/modules/<domain>/`):
- **news/** — `NewsService` orchestrates multi-source scraping (7 Chinese financial news sources), writes to Elasticsearch index `finance_news`. `NewsScheduler` runs a configurable loop (default 2 min). Supports keyword/category/source/sentiment search via ES. Sources defined in `news.sources.ts`, search logic in `news.search.ts`.
- **auth/** — `AuthService` handles email verification code login, password login, and GitHub/Google OAuth. `AuthSessionService` manages Redis-backed sessions via cookies. `MailService` sends verification codes via SMTP. `OAuthService` reads client credentials from the `platform_oauth_setting` PostgreSQL table. Password hashing via `bcryptjs` in `password.ts`.
- **short-link/** — `ShortLinkService` generates short URLs with optional custom slugs (via `nanoid`). `ShortLinkRepository` stores links in PostgreSQL (`short_links` table). Redirect endpoint at `/s/:slug`, accessed via `s.codego.eu.org` (nginx proxies `/:slug` to `/s/:slug`).
- **market/** — `MarketService` fetches stock/crypto/index quotes from iTick API, cached in Redis with 60s TTL. Route: `GET /api/v1/market/quotes?symbols=...`.

**Shared libs** (`src/lib/`):
- `postgres.ts` — pg pool singleton with healthcheck
- `redis.ts` — Redis client singleton with healthcheck
- `snowflake.ts` — Snowflake ID generator for short-link IDs
- `rate-limit.ts` — Redis-based rate limiter (check, recordFailure, reset)
- `require-session.ts` — Shared session validation helper for route handlers
- `errors.ts` — Custom error classes (AppError, ConflictError, NotFoundError, UnauthorizedError)

**Config**: `src/config/env.ts` uses Zod to parse and validate all env vars with sensible defaults. No `.env` file is committed — use `apps/api/.env.example` as template.

### apps/web — Next.js 16 frontend

App Router with React 19, `output: "standalone"` for Docker. **Next.js acts as reverse proxy** for API routes via `next.config.ts` rewrites — `/api/*`, `/health`, `/s/*` are proxied to the API container. All client API calls go through `src/lib/api.ts`. Key routes:
- `/` — Landing page with news preview and stats (server-rendered, `force-dynamic`)
- `/news`, `/news/[id]` — News listing and detail
- `/markets` — Stock/crypto/index market dashboard
- `/short-links` — Short link management (requires auth)
- `/login` — Email code / password / OAuth login
- `/account` — User profile (requires session)
- `/oauth/github-callback`, `/oauth/google-callback` — OAuth redirect handlers

**UI**: Base UI primitives (`@base-ui/react`), Tailwind CSS 4, shadcn-style components in `src/components/ui/`. Navy/Gold color scheme with CSS custom properties in `globals.css`. Inter font. Animations via `framer-motion`.

**Frontend auth pattern**: `getApiBaseUrl()` in `api.ts` returns empty string on the client (same-origin) and the full `API_BASE_URL` on the server (SSR). Same-origin client requests include cookies automatically via browser default (`credentials: "same-origin"`). For server-side API calls during SSR, there is no session cookie forwarding — authenticated data must be fetched client-side.

### packages/shared

Exports shared TypeScript types and constants from `src/news.ts`, `src/auth.ts`, `src/short-link.ts`, `src/market.ts`. Built as JS (not just type-only) so both api and web can consume it. Both apps reference it as `@odin-pulse/shared` via workspace protocol.

## Data Infrastructure

| Store | Purpose | Connection |
|-------|---------|------------|
| Elasticsearch | News articles (index: `finance_news`) | `ES_NODE` env var |
| PostgreSQL | Auth + short links (6 tables across 2 DDL files) | `POSTGRES_*` env vars |
| Redis | Session storage + market quote cache | `REDIS_*` env vars |

DDL files: `db/postgres/001_auth.sql`, `db/postgres/002_short_link.sql`. MySQL is no longer used — all relational data is on PostgreSQL.

## CI/CD

**CI** (`.github/workflows/ci.yml`): Runs on ubuntu-latest on PRs and pushes to main. Steps: install with frozen lockfile, typecheck, lint, build, validate docker-compose config.

**Deploy** (`.github/workflows/deploy.yml`): Runs on a **self-hosted ARM64 runner** (tagged `odin-pulse`) on push to main. Writes env files from secrets/variables, then calls `scripts/deploy_remote.sh` which builds Docker images and updates containers via `deploy/compose/docker-compose.prod.yml`.

Production: web on `127.0.0.1:3100`, api on `127.0.0.1:3101`. Nginx (`deploy/nginx/codego.eu.org.conf`) proxies all requests to Next.js (port 3100) — Next.js rewrites route `/api/*`, `/health` to the API container internally. No per-route nginx config needed. Both containers join the `hfcloud_net` Docker network. Short links use separate domain `s.codego.eu.org` (nginx in `biz.conf`).

Required GitHub Secrets: `PROD_API_ENV`, `ITICK_API_KEY`. Required GitHub Variables: `PROD_WEB_ENV` (non-sensitive). Container DNS names should be used in production env (e.g., `api:3101` not `127.0.0.1:3101`). `NEXT_PUBLIC_SHORT_LINK_DOMAIN` is injected at Docker build time from the web env file.
