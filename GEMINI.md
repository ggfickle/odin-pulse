# GEMINI.md - Odin Pulse Project Context

## Project Overview
Odin Pulse is a comprehensive news aggregation and business portal platform. It is structured as a monorepo containing a high-performance backend, a modern frontend, and shared internal libraries.

- **Primary Goal:** To provide an extensible business portal starting with a robust news aggregation module.
- **Architecture:** Monorepo managed by `pnpm`.
- **Key Modules:**
    - `apps/api`: Fastify-based backend for news scraping, indexing, and authentication.
    - `apps/web`: Next.js 16 (React 19) frontend with Tailwind CSS 4.
    - `packages/shared`: Shared TypeScript types and business constants.
    - `deploy/`: Deployment configurations (Docker Compose, Nginx, Systemd).

## Tech Stack
- **Languages:** TypeScript (Strict mode).
- **Backend Framework:** [Fastify](https://fastify.dev/) (High-performance Node.js framework).
- **Frontend Framework:** [Next.js 16](https://nextjs.org/) with React 19 and Tailwind CSS 4.
- **Databases:**
    - **Elasticsearch:** Primary storage for news data (`finance_news` index).
    - **PostgreSQL / TimescaleDB:** Authentication and relational business data (`quant_db`).
    - **Redis:** Session management and health checks.
- **Infrastructure:** Docker, Nginx (Reverse proxy), GitHub Actions (Self-hosted runner).

## Building and Running
### Prerequisites
- Node.js (v20+ recommended)
- `pnpm` (v10+ recommended)
- Running instances of Elasticsearch, PostgreSQL, and Redis (local or via Docker).

### Key Commands
- `pnpm install`: Install all dependencies across the workspace.
- `pnpm dev`: Start both API (port 3001) and Web (port 3000) in development mode.
- `pnpm build`: Build all applications and packages.
- `pnpm typecheck`: Run TypeScript type checks across the entire project.
- `pnpm lint`: Run linting for all packages.
- `pnpm format`: Format code using Prettier.

### Specific Service Commands
- `pnpm --filter @odin-pulse/api dev`: Start only the backend.
- `pnpm --filter @odin-pulse/web dev`: Start only the frontend.

## Project Structure
```text
/
├── apps/
│   ├── api/          # Fastify Backend (src/server.ts)
│   └── web/          # Next.js Frontend (src/app/)
├── packages/
│   └── shared/       # Shared types, constants, and utilities
├── db/
│   └── postgres/     # Database migration and schema scripts
├── deploy/
│   ├── compose/      # Production Docker Compose files
│   ├── env/          # Environment variable templates
│   └── nginx/        # Nginx configuration for codego.eu.org
├── design-system/    # UI/UX design specifications (Soft UI Evolution)
└── scripts/          # Server installation and migration scripts
```

## Development Conventions
### Code Style & Standards
- **TypeScript:** Use explicit types. Avoid `any`. Prefer `zod` for validation.
- **Frontend:** Follow "Soft UI Evolution" guidelines. Use Lucide-React for icons. No emojis as icons.
- **Backend:** Modular architecture. Services for business logic, repositories for data access.
- **Shared Code:** Any type or constant used by both frontend and backend MUST reside in `packages/shared`.

### Database Strategy
- **News Data:** Always stored and retrieved from Elasticsearch. MySQL is deprecated for news.
- **Relational Data:** Use PostgreSQL for users, sessions, and platform settings.

### UI/UX Rules (from MASTER.md)
- **Primary Colors:** Navy (`#0F172A`) and Gold (`#CA8A04`).
- **Typography:** `Poppins` (Headings) and `Open Sans` (Body).
- **Interactions:** Always use transitions (150-300ms). Ensure focus states are visible for accessibility.
- **Icons:** Use SVG icons (Lucide) only.

## Infrastructure & Deployment
- **Deployment Strategy:** Git-push-to-deploy via GitHub Actions on a self-hosted runner.
- **Secrets:** Managed via GitHub Secrets, written to `/etc/odin-pulse/*.env` on the server.
- **Reverse Proxy:** Nginx handles SSL and proxies `/api` and `/finance` to the backend service.
- **CI/CD:** Pipelines for linting, typechecking, and automated deployment are defined in `.github/workflows/`.
