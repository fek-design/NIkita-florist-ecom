## Context

See proposal.md for motivation. The repository holds documents, wireframes and OpenSpec changes only. The machine has Node 22 and npm 10; no pnpm. `ref/Roadmap.md` lists recommended choices, each with a check to make before committing. `CLAUDE.md` override 2 requires a dynamic app with server routes, not a static export. Felix must be able to explain every line at the exam (roadmap rule 3), which favours a small, conventional stack.

## Goals / Non-Goals

**Goals:**
- An empty app that builds, passes CI and deploys itself, so week 2 work starts on a working pipeline.
- Decisions that keep later weeks cheap: server-side price calculation, webhooks and an admin all fit without a second service.

**Non-Goals:**
- Any table, screen or business rule.
- Choosing a UI component library. That waits for the brand tokens.

## Decisions

### 1. Next.js (App Router) with TypeScript
Server rendering gives SEO and performance by default (P7, P10), and route handlers cover checkout, webhooks and the admin in one codebase.
*Rejected:* Astro (strong for content, weaker for the cart, checkout and admin flows); a separate API server (two deployments to run and explain); Shopify or WooCommerce (not an API-driven custom build, which the case requires).

### 2. PostgreSQL with Drizzle
Orders, order lines and products are relational. Drizzle keeps queries close to SQL, so each one can be read and explained, and migrations are plain SQL files in the repository.
*Rejected:* Prisma (heavier client and a generated layer that is harder to explain line by line); a document database (poor fit for orders and totals).
Host the database with a provider that offers a Frankfurt or other EU region, branch databases for previews, and a data processing agreement. Neon is the first candidate; Supabase is the fallback.

### 3. Hosting on Vercel with the function region set to the EU
It builds Next.js with no configuration, gives a preview URL per branch, and lets the function region be pinned (Frankfurt). `main` is the production branch; `DevEnv` gets a fixed staging domain.
*Rejected:* a self-managed VPS (patching and deploy scripts cost time the project does not have); Netlify (workable, but less direct support for current Next.js features).
*Check before committing:* where logs and build data are stored, and that the data processing agreement covers them.

### 4. Payment: Stripe hosted Checkout, conditional on MobilePay
Hosted Checkout keeps card data off our server, so PCI scope stays minimal, and test mode is available at once. Design-Rationale P5 makes MobilePay a requirement.
*Condition:* the first task verifies in test mode that MobilePay appears for a Danish customer paying in DKK. If it does not, switch to Quickpay or Frisbii before any payment code is written.
*Rejected for now:* Quickpay (needs a separate acquirer agreement, which adds paperwork and waiting time); building card fields ourselves (raises PCI scope).

### 5. Email: Resend, with Postmark as the fallback
A transactional API gives delivery logs and retries. The choice is confirmed only after checking EU data handling and the sending-domain setup. No email code is written in this change.

### 6. Minimal admin inside the same app
The catalogue is small and the back-office spec (`openspec/specs/back-office/`) describes seven simple screens. A separate CMS would add a second system for the owner to learn.

### 7. Tooling
- npm, because it is already installed and needs no extra setup.
- ESLint and Prettier for lint and format.
- Vitest for unit tests (price and delivery rules later) and Playwright for the end-to-end checkout test.
- GitHub Actions for CI, running lint, type check, unit tests and build on pull requests into `DevEnv` and `main`.
- Environment variables validated at start-up from one schema file, with `.env.example` checked in.

### 8. App in the repository root
The app lives at the root, next to `ref/`, `docs/` and `openspec/`. One app does not need a monorepo layout.

### 9. Branch flow with pull requests
Feature branches merge into `DevEnv` through a pull request so the checks can gate the merge. This tightens the CLAUDE.md rule, which today describes a local `--no-ff` merge.

## Risks / Trade-offs

- [The repository sits in a cloud-storage folder; installing thousands of dependency files there can be slow or trigger sync conflicts] → the first task moves the repository to a plain local folder, or confirms that the folder is excluded from sync.
- [MobilePay is not available through Stripe for this merchant] → verified first, with Quickpay as the named fallback.
- [Vercel and Neon are US companies with EU regions] → regions are pinned to the EU, the agreements are filed, and the choice is recorded for the GDPR data map in week 5.
- [Live payment approval is slow] → the application is sent in this change, in parallel with the scaffold.
- [The scaffold tempts early feature work] → this change ends at an empty app with a health page.

## Migration Plan

Nothing is live, so there is nothing to migrate. Rollback is deleting the feature branch and the hosting project.

## Open Questions

- Which domain will the shop use? It is needed for the production deploy and the sending domain, but not for this change.
