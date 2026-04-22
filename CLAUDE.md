# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install                  # Install all workspace dependencies
pnpm dev                      # Start both web (port 3000) and api (port 3001) concurrently
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

pnpm monorepo with three workspace packages. `packages/shared` must be built before the other two can type-check or lint.

### apps/api — Fastify 5 backend

Entry: `src/server.ts`. Registers two route groups and starts a news fetch scheduler on `onReady`.

**Module structure** (`src/modules/<domain>/`):
- **news/** — `NewsService` orchestrates multi-source scraping (7 Chinese financial news sources), writes to Elasticsearch index `finance_news`. `NewsScheduler` runs a configurable loop (default 2 min). Supports keyword/category/source/sentiment search via ES.
- **auth/** — `AuthService` handles email verification code login, password login, and GitHub/Google OAuth. `AuthSessionService` manages Redis-backed sessions via cookies. `MailService` sends verification codes via SMTP. `OAuthService` reads client credentials from the `platform_oauth_setting` PostgreSQL table.

All routes exist in two prefixes: `/api/v1/*` (current) and `/finance/*`, `/auth/*`, `/user/*` (legacy compatibility).

**Config**: `src/config/env.ts` uses Zod to parse and validate all env vars with sensible defaults. No `.env` file is committed — use `apps/api/.env.example` as template.

### apps/web — Next.js 16 frontend

App Router with React 19. Key routes:
- `/` — Landing page (placeholder for future business modules)
- `/news`, `/news/[id]` — News listing and detail
- `/login` — Email code / password / OAuth login
- `/account` — User profile (requires session)
- `/oauth/github-callback`, `/oauth/google-callback` — OAuth redirect handlers

Styling: Tailwind CSS 4, Navy/Gold color scheme, Poppins (headings) + Open Sans (body), Soft UI Evolution aesthetic.

### packages/shared

Exports shared TypeScript types and constants from `src/news.ts` and `src/auth.ts`. Built as JS (not just type-only) so both api and web can consume it.

## Data Infrastructure

| Store | Purpose | Connection |
|-------|---------|------------|
| Elasticsearch | News articles (index: `finance_news`) | `ES_NODE` env var |
| PostgreSQL | Auth tables (5 tables: `odin_union_user`, `odin_open_user`, `odin_platform`, `odin_email_verify`, `platform_oauth_setting`) | `POSTGRES_*` env vars |
| Redis | Session storage | `REDIS_*` env vars |

DDL: `db/postgres/001_auth.sql`. MySQL is no longer used — all relational data is on PostgreSQL.

## Deployment

Push to `main` triggers GitHub Actions on a **self-hosted ARM64 runner**. The workflow writes env files from secrets, then runs `scripts/deploy_remote.sh` which builds Docker images and updates containers via `deploy/compose/docker-compose.prod.yml`.

Production: web on `127.0.0.1:3100`, api on `127.0.0.1:3101`. Nginx reverse-proxies `codego.eu.org` — `/api` and `/finance` route to the API container, everything else to web. Both containers join the `hfcloud_net` Docker network.

Required GitHub Secrets: `PROD_API_ENV`, `PROD_WEB_ENV`. Container DNS names should be used in production env (e.g., `api:3101` not `127.0.0.1:3101`).
