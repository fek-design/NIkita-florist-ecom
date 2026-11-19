## Context

Process note: [docs/process/2026-11-16-stack-and-scaffold.md](../../../docs/process/2026-11-16-stack-and-scaffold.md). Decision log: [docs/decisions.md](../../../docs/decisions.md).

See proposal.md for motivation. Current state on this branch: a Next.js 16 app in the repository root with lint, tests, CI, a dependency audit, an environment check, Drizzle with an empty migration, and a database health check, all verified on 16 Nov.

How the plan got here, for the record:
1. 16 Nov, first plan: one Next.js app on Vercel with Neon.
2. 16 Nov, Felix: separate backend service, own EU server (Hetzner), SMTP and IMAP.
3. 17 Nov, Felix: no paid hosting, because this is a school project. Simply.com's webhotel was checked and serves static sites only. Chosen: free managed tiers. The separate backend and SMTP/IMAP stay.

Constraints: one developer, six weeks, feature freeze end of week 4; Felix must be able to explain every part at the exam (roadmap rule 3); zero hosting cost; the owner inherits the system later.

## Goals / Non-Goals

**Goals:**
- A frontend and a backend that build, are checked automatically, deploy themselves, and run together locally.
- Zero running cost during the project.
- A hand-over path: the runbook says what the owner must change (plans, accounts) when she goes live.

**Non-Goals:**
- Any table, screen or business rule.
- Sending or receiving email, and payment code. They get their own changes.

## Decisions

### 1. Repository layout: npm workspaces
```
/                  root package.json (workspaces, shared lint and format)
/frontend          Next.js storefront + admin screens       -> Vercel project 1
/backend           Fastify API, Drizzle, migrations          -> Vercel project 2
/compose.yaml      local Postgres + Mailpit for development
```
Felix asked for a `backend` folder in the root. Moving the Next.js app into `frontend/` gives the matching half.
*Rejected:* backend nested inside the Next.js root (overlapping `package.json` trees); two repositories (one change would need two pull requests).

### 2. Backend: Fastify with TypeScript, deployed as Vercel Functions
Fastify validates request and response bodies against schemas, which is where server-side price and input validation will live (roadmap week 3), and has built-in request injection for tests. Vercel deploys a Fastify app with zero configuration as Vercel Functions, so the backend is its own project with its own address. The same app also runs as an ordinary Node server locally.
*Rejected:* Express (no built-in validation); NestJS (heavy for a small API); Render's free web service (sleeps when idle, slow first request in a demo).

### 3. Frontend: Next.js without database access
Server rendering for SEO and speed (P7, P10). Server components call the backend over HTTPS using `BACKEND_URL`. Browser calls go to the frontend's own `/api/*`, which Next.js rewrites to the backend, so no cross-origin setup is needed and the backend address stays configurable per environment.

### 4. Database: Neon PostgreSQL, free plan, Frankfurt
Postgres 17 on Neon in AWS Frankfurt. Only the backend project holds the connection string. Connections require TLS. Neon creates a database branch per preview deploy through its Vercel integration, so previews never touch staging or production data.
Free plan limits to keep in mind: 1 GB storage per project and a 6-hour restore window (Neon docs, read 17 Nov). The storage is ample for this shop; the short restore window is why decision 7 exists.
Locally, Postgres runs in Docker (`compose.yaml`), as today.
*Rejected:* Supabase (more bundled features than needed); a database on Simply (webhotel cannot run the backend next to it).

### 5. Hosting: Vercel Hobby, two projects, functions in Frankfurt
Both projects deploy from GitHub: every branch gets a preview, `DevEnv` is assigned the staging domain, `main` is production. The function region is set to Frankfurt (`fra1`) so personal data is processed in the EU.
The Hobby plan is for non-commercial use. That fits the school project. At go-live the owner moves to Vercel Pro or to another host; the runbook covers both.
*Rejected:* own server (costs money; Felix's call); Oracle Always Free VM (card required, idle reclaim risk); Simply webhotel (static sites only).

### 6. Scheduled work: GitHub Actions calling the backend
*Built in this change: the protected endpoint. Deferred on 19 Nov to the email change (week 4): the schedule itself.*

Vercel Hobby runs cron jobs at most once a day, with up to an hour of drift (Vercel docs, read 17 Nov). Email retries and inbox reading need about every 15 minutes. A scheduled GitHub Actions workflow calls `POST /jobs/<name>` on the backend with a shared secret in a header. This change adds the mechanism with one harmless job (`ping`); the email changes add real jobs.
GitHub schedules can be delayed under load, which is acceptable for retries and inbox reading.
*Rejected:* Vercel Pro cron (costs money); an external cron service (one more account).

### 7. Backups: nightly encrypted dump via GitHub Actions
*Deferred on 19 Nov to hardening (week 5), once there is real data to protect. Until then Neon's 6-hour restore window covers test data.*

A scheduled workflow runs `pg_dump` against production, encrypts the file with `age` using Felix's public key, and stores it as a workflow artifact kept for 14 days. Only the encrypted file leaves the job, so GitHub (a US company) never holds readable customer data. One restore into a fresh Neon branch is tested before merge.
*Rejected:* relying on Neon's 6-hour restore window alone; unencrypted artifacts.

### 8. Email: SMTP and IMAP, mailbox to be chosen
Unchanged in principle: the backend sends over authenticated SMTP and reads over IMAP, with an outbox, retries and bounce reading added in the email change. Simply.com is not used. Which mailbox provider is chosen in that change. Locally, Mailpit catches all mail.

### 9. Payment: Stripe hosted Checkout
Confirmed 17 Nov: MobilePay is offered in Stripe test mode for DKK.

### 10. Checks per workspace
Each workspace has `lint`, `typecheck`, `test` and `build`; the root scripts run both. CI runs them plus `npm audit --omit=dev --audit-level=high` (added 17 Nov after the PHP2Shell flaws: the webshop has no PHP, but a similar flaw in a Node dependency must fail the build).

### 11. Branch flow
Felix pushes and opens pull requests; Claude commits only. Feature branches merge into `DevEnv` through a pull request once CI is green.

## Risks / Trade-offs

- [Free plans can change their limits] → limits are recorded with the date they were read; the runbook names the paid plan or alternative for each service.
- [US companies (Vercel, Neon, GitHub) with EU regions] → EU regions pinned, data processing agreements filed, recorded as third-country transfers in the week 5 data map; backups are encrypted before reaching GitHub.
- [Neon's free compute pauses when idle, so the first request after a pause is slower] → acceptable for a demo; noted for the owner's go-live plan.
- [Function time limits on Vercel Hobby] → backend jobs are kept short and resumable (the outbox design handles partial runs).
- [Moving the app into `frontend/` breaks the verified setup] → each check is re-run after the move and recorded in the process note.

## Migration Plan

Nothing is live. Restructure on this branch, re-run every check, add the backend, then connect the hosting. Rollback is reverting the branch commits and deleting the Vercel and Neon projects.

## Open Questions

- Which mailbox provider for SMTP and IMAP. Needed for the email change, not this one.
