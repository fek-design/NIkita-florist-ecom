# Decision log

Each significant choice: what, why, what was rejected. Format from [Design-Rationale section 5](../ref/Design-Rationale.md). Design and brand decisions also cite a principle (P1–P12) or are labelled *opinion*.

Status: **locked** means decided and in use. **Conditional** means decided, pending the check named in the entry.

---

## Stack

### D-001 Framework: Next.js (App Router) with TypeScript
Date: 2026-11-16 · Change: `stack-and-scaffold` · Principles: P7, P10 · Status: locked
Decision: Next.js 16.4.6 with the App Router and TypeScript, in the repository root.
Why: Server rendering gives SEO and speed by default. Route handlers cover checkout, payment webhooks and the admin in one codebase, so there is one deployment to run and explain.
Rejected: Astro (strong for content, weaker for cart, checkout and admin); a separate API server (two deployments); Shopify or WooCommerce (not an API-driven custom build, which the case requires); Next.js 15.5.4 (known vulnerabilities in production dependencies at scaffold time).

### D-002 Database: PostgreSQL with Drizzle
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked (local); hosting provider conditional
Decision: PostgreSQL, queried through Drizzle ORM with the `postgres` driver. Migrations are plain SQL files in `drizzle/`. Locally, Postgres 17 runs in Docker (`compose.yaml`).
Why: Orders, order lines and products are relational. Drizzle stays close to SQL, so each query can be read and explained.
Rejected: Prisma (heavier generated client, harder to explain line by line); a document database (poor fit for orders and totals).
Pending: hosted database in an EU region. Neon is the first candidate, Supabase the fallback. Region and data processing agreement to be recorded (task 3.1, 5.3).

### D-003 Hosting: Vercel with EU function region
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: conditional
Decision: Vercel, function region pinned to Frankfurt. `main` deploys to production, `DevEnv` to a fixed staging URL, every branch to a preview URL.
Why: Builds Next.js with no configuration and gives a preview per branch, which makes owner review fast.
Rejected: self-managed VPS (patching and deploy scripts cost time); Netlify (workable, less direct support for current Next.js features).
Pending: where logs and build data are stored, and the data processing agreement (task 4.2, 5.3).

### D-004 Payment: Stripe hosted Checkout
Date: 2026-11-16 · Change: `stack-and-scaffold` · Principles: P5 · Status: conditional
Decision: Stripe hosted Checkout in test mode. No card data touches our server.
Why: Minimal PCI scope, and test mode is available at once.
Rejected: Quickpay (separate acquirer agreement, more paperwork); our own card fields (raises PCI scope).
Condition: MobilePay must be offered to a Danish customer paying in DKK in test mode (task 1.3). If not, switch to Quickpay or Frisbii before any payment code is written. No live account is needed: the shop does not go live within the project ([interview](process/2026-11-16-owner-interview.md)).

### D-005 Email: Resend, Postmark as fallback
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: conditional
Decision: A transactional email API. Resend first, Postmark as fallback.
Why: Delivery logs and retries beat a raw SMTP relay, so a lost confirmation can be traced.
Pending: EU data handling and sending-domain setup (task 5.2). No email code is written yet.

### D-006 Admin inside the same app
Date: 2026-11-16 · Change: `stack-and-scaffold` · Principles: P1 · Status: locked
Decision: A minimal admin built into the webshop, one account (the owner).
Why: Small catalogue, seven simple screens (`openspec/specs/back-office/`), and only the owner uses it. A separate CMS would be a second system for her to learn.
Rejected: a headless CMS (extra service, extra login, extra cost).

### D-007 Money stored as whole øre
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: All amounts are integers in øre (250 kr. = 25000) and formatted with `formatKroner`.
Why: Integer arithmetic never rounds wrong, which matters once prices, delivery fee and totals are added up on the server.
Rejected: decimal numbers in JavaScript (floating-point rounding errors).

### D-008 Missing configuration stops the server
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: Required environment variables are listed in `src/env.ts` and checked when the server starts. If one is missing, the server logs its name and exits.
Why: A missing key should fail loudly at start-up, not halfway through a customer's checkout.
Rejected: checking at first use only (fails late, in front of a customer); a schema library such as Zod for one variable (a dependency without a need yet).
Note: the database client is created on first use, so `next build` and CI need no database secret.

---

## Dependencies

Roadmap rule 8: each package needs a reason.

| Package | Kind | Reason |
|---|---|---|
| `next` | runtime | The framework (D-001) |
| `react`, `react-dom` | runtime | Required by Next.js |
| `drizzle-orm` | runtime | Typed SQL queries (D-002) |
| `postgres` | runtime | Postgres driver used by Drizzle (D-002) |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | dev | Type checking |
| `eslint`, `eslint-config-next` | dev | Lint rules for Next.js and React |
| `prettier`, `eslint-config-prettier` | dev | One formatting style; turns off lint rules that clash with it |
| `vitest`, `vite-tsconfig-paths` | dev | Unit tests (price and delivery rules later); resolves the `@/` import alias in tests |
| `@playwright/test` | dev | End-to-end tests on a phone viewport, including the checkout test in week 3 |
| `drizzle-kit` | dev | Generates and runs migrations |
| `@next/env` | (ships with `next`) | Imported in `drizzle.config.ts` so migrations read `.env.local` like the app does. Not installed separately |

Audit on 2026-11-16: `npm audit --omit=dev` reports 0 vulnerabilities. 8 moderate findings are in lint tooling only (`minimatch` via `typescript-eslint`, pulled in by `eslint-config-next`), with no fix that keeps `eslint-config-next` at 16.4.6.
