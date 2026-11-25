# Decision log

Each significant choice: what, why, what was rejected. Format from [Design-Rationale section 5](../ref/Design-Rationale.md). Design and brand decisions also cite a principle (P1–P12) or are labelled *opinion*.

Status: **locked** means decided and in use. **Conditional** means decided, pending the check named in the entry. **Superseded** means replaced; the entry stays so the change of mind is visible.

---

## Stack

### D-001 Frontend: Next.js (App Router) with TypeScript
Date: 2026-11-16, updated 2026-11-17 · Change: `stack-and-scaffold` · Principles: P7, P10 · Status: locked
Decision: Next.js 16.4.6 with the App Router and TypeScript, in `frontend/`. It renders the storefront and admin screens and holds no database access (D-010).
Why: Server rendering gives SEO and speed by default.
Rejected: Astro (strong for content, weaker for cart, checkout and admin); a client-only single-page app (worse SEO and first load); Shopify or WooCommerce (not an API-driven custom build, which the case requires); Next.js 15.5.4 (known vulnerabilities in production dependencies at scaffold time).
History: on 16 Nov the plan was one Next.js app in the repository root handling everything. Replaced on 16 Nov by the frontend/backend split (D-009).

### D-002 Database: PostgreSQL with Drizzle, hosted on Neon (Frankfurt)
Date: 2026-11-16, updated 2026-11-17 · Change: `stack-and-scaffold` · Status: locked (local); conditional on account creation (Neon)
Decision: PostgreSQL 17, queried through Drizzle ORM with the `postgres` driver, in `backend/`. Migrations are plain SQL files in `backend/drizzle/`. Hosted on Neon's free plan in Frankfurt; locally in Docker (`compose.yaml`).
Why: Orders, order lines and products are relational. Drizzle stays close to SQL, so each query can be read and explained. Neon's free plan costs nothing, upgrades in place, and gives each preview deploy its own database branch.
Rejected: Prisma (heavier generated client); a document database (poor fit for orders and totals); Postgres on an own server (D-013); Supabase (more bundled features than needed).
Limits read 2026-11-17 (Neon docs): 1 GB storage per project, 6-hour restore window on the free plan. The short restore window is why D-012 exists.
Created 2026-11-17: project `nikita-florist` in Frankfurt (AWS eu-central-1), through Vercel's Neon integration, connected to the backend project only. The app uses the pooled `DATABASE_URL` with prepared statements turned off; migrations use `DATABASE_URL_UNPOOLED`.

### D-003 Hosting: Vercel Hobby, two projects, functions in Frankfurt
Date: 2026-11-16, updated 2026-11-17 · Change: `stack-and-scaffold` · Status: conditional on account creation
Decision: The frontend and the backend deploy as two Vercel projects from the same repository, with function region Frankfurt (`fra1`). Every branch gets a preview, `DevEnv` is staging, `main` is production.
Why: Zero cost for a school project, preview per branch for owner review, and an in-place upgrade path when the owner goes live.
Rejected: own EU server (D-013); Simply.com webhotel (D-013); Render's free web service (sleeps when idle, slow first request in a demo); Netlify (less direct support for current Next.js features).
Note: Hobby is for non-commercial use. At go-live the owner moves to a paid plan or another host ([hand-over sheet](handover.md)).

### D-004 Payment: Stripe hosted Checkout
Date: 2026-11-16, updated 2026-11-17 · Change: `stack-and-scaffold` · Principles: P5 · Status: locked
Decision: Stripe hosted Checkout in test mode. No card data touches our server.
Why: Minimal PCI scope, and test mode is available at once.
Rejected: Quickpay (separate acquirer agreement, more paperwork); our own card fields (raises PCI scope).
Check: 2026-11-17, MobilePay is offered in Stripe test mode for EUR, DKK, NOK and SEK (Felix). No live account is needed: the shop does not go live within the project ([interview](process/2026-11-16-owner-interview.md)).

### D-005 Email API service — superseded
Date: 2026-11-16 · Status: superseded by D-011 on 2026-11-16
Decision was: a transactional email API (Resend, Postmark as fallback).
Why it changed: Felix chose SMTP and IMAP, so the shop's own mailbox sends and receives, and the weak points of plain SMTP are handled in our own code (D-011).

### D-006 Admin inside the same frontend
Date: 2026-11-16 · Change: `stack-and-scaffold` · Principles: P1 · Status: locked
Decision: A minimal admin built into the frontend, using the same backend API, with one account (the owner).
Why: Small catalogue, seven simple screens (`openspec/specs/back-office/`), and only the owner uses it. A separate CMS would be a second system for her to learn.
Rejected: a headless CMS (extra service, extra login, extra cost).

### D-007 Money stored as whole øre
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: All amounts are integers in øre (250 kr. = 25000) and formatted with `formatKroner` (`backend/src/lib/money.ts`).
Why: Integer arithmetic never rounds wrong, which matters once prices, delivery fee and totals are added up on the server.
Rejected: decimal numbers in JavaScript (floating-point rounding errors).

### D-008 Missing configuration stops the app
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: Each app lists its required environment variables in its own `src/env.ts` and checks them at start-up. If one is missing, the app logs its name and exits.
Why: A missing key should fail loudly at start-up, not halfway through a customer's checkout.
Rejected: checking at first use only (fails late, in front of a customer); a schema library such as Zod for a handful of variables (a dependency without a need yet).
Note: the database client is created on first use, so builds and CI need no secrets.

### D-009 Backend: separate Fastify service
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: A standalone API service in `backend/`, built with Fastify and TypeScript (ES modules). It owns the database, business rules, payment and email. Locally it runs as a Node server; on Vercel it deploys as a function.
Why: Felix's choice: the case describes an API-driven solution with a backend side that ties payment and email together. Fastify validates request and response bodies against schemas, which is where server-side price and input validation will live, and its `inject()` lets routes be tested without starting a server.
Rejected: server routes inside Next.js (no clear frontend/backend split); Express (no built-in validation, older async handling); NestJS (heavy structure for a small API, harder to explain line by line).

### D-010 Repository layout: npm workspaces, frontend without database access
Date: 2026-11-16 · Change: `stack-and-scaffold` · Status: locked
Decision: One repository with two npm workspaces, `frontend/` and `backend/`. Only the backend holds database credentials. Server-side frontend code calls the backend through `BACKEND_URL`; browser code calls the frontend's own `/api/*`, which Next.js rewrites to the backend.
Why: One pull request per change across both apps, and customer data sits behind one API with one set of rules. The rewrite keeps the browser on a single address, so no cross-origin setup is needed.
Rejected: backend nested inside the Next.js root (overlapping `package.json` trees); two repositories (one change would need two pull requests).

### D-011 Email: SMTP out, IMAP in, through a mailbox
Date: 2026-11-16, updated 2026-11-17 · Change: email change (weeks 3–4) · Status: conditional (mailbox provider not chosen)
Decision: The backend sends over authenticated SMTP and reads over IMAP. *(25 Nov: the outbox table and the first sending, for paid orders, built in change checkout-payment; the retry job and IMAP follow in week 4.)* Plain SMTP's weak points are covered in our own code: an outbox table logs every message, a scheduled job sends at a steady rate and retries, and IMAP reads bounce messages back. IMAP is also used later for customer replies and orders sent by email. Locally, Mailpit catches all mail.
Why: Felix's choice; the case names email "via SMTP/API". Running it ourselves is good exam material and keeps mail in a mailbox the shop controls.
Rejected: a vendor email API (D-005); running our own mail server (new servers usually cannot send on port 25, and self-run servers rarely reach inboxes); Simply.com mail (Felix: Simply was considered for hosting only).

### D-012 Scheduled work and backups through GitHub Actions
Date: 2026-11-17 · Change: `stack-and-scaffold` · Status: conditional on account setup
Decision: A GitHub Actions schedule calls `POST /jobs/<name>` on the backend about every 15 minutes, authorised by `JOB_SECRET` as a bearer token. A nightly workflow dumps the production database, encrypts it with `age` using Felix's public key, and keeps it as an artifact for 14 days.
Why: Vercel Hobby runs cron jobs at most once a day with up to an hour of drift (Vercel docs, read 2026-11-17), which is too slow for email retries. Neon's free plan keeps only 6 hours of restore history. Encrypting before upload means GitHub never holds readable customer data.
Rejected: Vercel Pro cron (costs money); an external cron service (another account); relying on Neon's restore window alone; unencrypted backup artifacts.

### D-013 Rejected hosting: own EU server and Simply.com webhotel
Date: 2026-11-16 to 2026-11-17 · Status: rejected
Considered: one Hetzner server in Germany or Finland running everything in Docker Compose behind Caddy (Felix's first choice on 16 Nov: everything in the EU, fully explainable). Then Felix's existing Simply.com subscription.
Why rejected: the Hetzner server costs money, which Felix does not want to spend on a school project (17 Nov). Simply.com's webhotel serves static sites only, so it cannot run the frontend or the backend (checked by Felix, 17 Nov). Kept here because the own-server design is still the natural target if the owner later wants to leave Vercel.

### D-014 Catalogue data model: occasions in three tiers with their own prices
Date: 2026-11-19 · Change: `catalog-data-model` · Principles: P2, P3, P6, P10 · Status: locked
Decision: Each occasion is one product with exactly three tiers (Lille, Mellem, Stor), each tier a row with its own price in øre and a size in words. Shop settings are one typed row; delivery postcodes and closed dates are tables. The database enforces one row per tier, prices above zero, prices rising from Lille to Stor (a commit-time constraint trigger), and a single settings row. Four read-only routes serve the storefront, each with a response schema so internal values such as the daily capacity cannot leak.
Why: The owner interview made occasions the products. Felix chose explicit prices per occasion (option A) so the owner edits exactly the prices customers see. Rules in the database hold even if code elsewhere has a bug.
Rejected: shared base prices plus an occasion offset (option B); categories (occasions replace them); a key-value settings table (loses types and checks); a trigger forcing exactly three tiers (makes creating an occasion awkward; the API treats incomplete occasions as not offered instead); PGlite for tests (not the same Postgres as Neon).
Note: no new packages. Tests run against a real Postgres: `florist_test` locally, a `postgres:17` service in CI.

### D-015 Figma connection: Figwright, pinned
Date: 2026-11-21 · Status: locked
Decision: Claude reads and writes Felix's Figma files through Figwright (`@figwright/mcp`, MIT), configured for this project in `.mcp.json` and pinned to version 0.7.0.
Why: Felix designs the screens in Figma (DD-01). Figwright needs no paid Figma seat and avoids the official connection's API limits, and it can also write to the canvas (footer variants, DD-08).
Checked 2026-11-21: version 0.7.0 published 26 Oct 2026, no install scripts, ordinary dependencies (ws, zod, msgpack, the MCP server library); one maintainer, which is why the version is pinned instead of `@latest`.
Rejected: Figma's official MCP (API limits, paid seat for Dev Mode); reading PDF exports (fonts, weights and line widths are lost in the export, as found on 21 Nov).

### D-016 Payment: Stripe Checkout, hosted
Date: 2026-11-25 · Status: locked
Decision: Payment runs on Stripe's hosted Checkout page (MobilePay and cards), reached from our own checkout form; the backend uses Stripe's server library (`stripe`). An order is paid only on a verified webhook.
Why: Felix, 25 Nov. Stripe is acquirer and gateway in one contract, has no monthly fee, offers MobilePay, and its test mode covers webhooks and failures, which matters in the riskiest week of the plan. The hosted page keeps card data off our servers and needs the least UI work.
Rejected: Stripe Payment Element embedded in our page (more payment states to build now; possible later); the Vipps MobilePay ePayment API directly (MobilePay only, a second integration for cards); QuickPay (needs a separate acquirer agreement and a monthly fee). The payment code sits behind a small module so a later switch does not touch the rest.

### D-017 Payment methods are chosen in the Stripe dashboard, instant ones only
Date: 2026-11-25 · Status: locked
Decision: The code does not list payment methods; Stripe's dashboard decides which ones the checkout page shows ("dynamic payment methods", as stripe-best-practices advises). In the dashboard only methods that are confirmed at once are switched on: MobilePay and cards (Apple Pay and Google Pay are cards). Felix, 25 Nov: "as long as it has no vulnerabilities; give a user access to what they need and nothing more".
Why: the owner can switch methods on and off herself without code (DD-23). It adds no attack surface on our side: the payment page is Stripe's, and our key's permissions stay the four from 25 Nov.
Rule for the dashboard: no delayed methods (bank debits, invoices, pay-later that settles later). A same-day bouquet cannot wait days for a payment to settle; the webhook handles delayed methods correctly, but the shop could not use them. Whoever holds the Stripe login (Felix now, the owner at hand-over) uses two-factor sign-in.
Rejected: listing `allowed_payment_method_types` in code (MobilePay and card only), used in the 25 Nov payment test.

### D-018 Stripe webhook: caller address checked as a second layer
Date: 2026-11-25 · Status: locked (report now, enforce in week 5)
Decision: Besides the signature, the webhook checks whether the caller is one of Stripe's published webhook addresses (`stripe.com/files/ips/ips_webhooks.json`, fetched and cached for a day, the last good list kept if a fetch fails). `STRIPE_WEBHOOK_IP_CHECK=report` logs unknown callers and lets them through; in the hardening week, once the logs show no false alarms, it is set to `enforce`, which refuses them. Signature failures are logged too. Felix, option b: "we can't skip security".
Why: defence in depth, as stripe-best-practices advises. The signature alone already stops forged events; the address check only matters if the signing secret leaks.
Guard: if Stripe's list cannot be fetched, events still go through (logged as an error). Refusing them would lose real payments, and the signature still protects. Locally, `stripe listen` calls from localhost and is let through outside Vercel only.
Rejected: skipping it (option a); enforcing from day one (option c: a stale or unfetched list could refuse genuine payments before we have seen it work); a list copied into the code (goes out of date silently).

---

## Dependencies

Roadmap rule 8: each package needs a reason.

### Root (`package.json`)

| Package | Kind | Reason |
|---|---|---|
| `prettier` | dev | One formatting style for the whole repository |

### Frontend (`frontend/package.json`)

| Package | Kind | Reason |
|---|---|---|
| `next` | runtime | The framework (D-001) |
| `react`, `react-dom` | runtime | Required by Next.js |
| `typescript`, `@types/node`, `@types/react`, `@types/react-dom` | dev | Type checking |
| `eslint`, `eslint-config-next` | dev | Lint rules for Next.js and React |
| `eslint-config-prettier` | dev | Turns off lint rules that clash with Prettier |
| `vitest`, `vite-tsconfig-paths` | dev | Unit tests; resolves the `@/` import alias in tests |
| `@playwright/test` | dev | End-to-end tests on a phone viewport, including the checkout test in week 3 |

### Backend (`backend/package.json`)

| Package | Kind | Reason |
|---|---|---|
| `fastify` | runtime | The API framework (D-009) |
| `drizzle-orm` | runtime | Typed SQL queries (D-002) |
| `postgres` | runtime | Postgres driver used by Drizzle (D-002) |
| `nodemailer` | runtime | Sends email over SMTP through the shop's mailbox (D-011). Added 25 Nov; MIT-0; `npm audit --omit=dev` 0 vulnerabilities |
| `stripe` | runtime | Stripe's server library: Checkout Sessions, webhook signature checks (D-016). Added 25 Nov; `npm audit --omit=dev` 0 vulnerabilities |
| `typescript`, `@types/node` | dev | Type checking and the production build |
| `tsx` | dev | Runs the TypeScript server directly in development, restarting on change |
| `eslint`, `typescript-eslint`, `eslint-config-prettier` | dev | Lint rules for TypeScript |
| `vitest` | dev | Unit tests, including route tests with `app.inject()` |
| `@types/nodemailer` | dev | Types for nodemailer |
| `drizzle-kit` | dev | Generates and runs migrations |

Audit on 2026-11-17: `npm audit --omit=dev` reports 0 vulnerabilities. CI fails on any high or critical finding in production dependencies.

### CI actions

| Action | Version | Reason |
|---|---|---|
| `actions/checkout` | v5 | Runs on Node 24. v4 ran on Node 20, which GitHub deprecated (warning on PR #3, 17 Nov 2026) |
| `actions/setup-node` | v5 | Same. v7 exists (Oct 2026) but v5 is the version whose behaviour with our inputs is known; revisit at the hardening checkup in week 5 |
