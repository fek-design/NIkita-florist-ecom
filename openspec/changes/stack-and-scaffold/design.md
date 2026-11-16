## Context

Process note: [docs/process/2026-11-16-stack-and-scaffold.md](../../../docs/process/2026-11-16-stack-and-scaffold.md). Decision log: [docs/decisions.md](../../../docs/decisions.md).

See proposal.md for motivation. Current state on this branch: a Next.js 16 app in the repository root with lint, tests, CI, an environment check, Drizzle with an empty migration, and a database health check, all verified on 16 Nov. That work was planned for managed hosting (Vercel and Neon). On 16 Nov Felix chose an own EU server, a separate backend service, and SMTP plus IMAP for email. This design replaces the managed plan; the verified code is moved, not thrown away.

Constraints: one developer, six weeks, feature freeze end of week 4; Felix must be able to explain every part at the exam (roadmap rule 3); the owner inherits the system later, so it must be documented to run without Felix.

## Goals / Non-Goals

**Goals:**
- A frontend and a backend that build, are checked automatically, and run together locally with one command.
- The same containers running on an EU server, with staging and production deployed from `DevEnv` and `main`.
- A setup simple enough to hand over: one server, one Compose file per environment, written runbook.

**Non-Goals:**
- Any table, screen or business rule.
- Sending or receiving email, and payment code. They get their own changes.
- Running a mail server. Mail goes through an existing mailbox (decision 6).

## Decisions

### 1. Repository layout: npm workspaces
```
/                  root package.json (workspaces, shared lint and format)
/frontend          Next.js storefront + admin screens
/backend           Fastify API, Drizzle, migrations
/deploy            Compose files, reverse proxy config, backup script
```
Felix asked for a `backend` folder in the root. Moving the Next.js app into `frontend/` gives the matching half, so neither app sits inside the other's folder.
*Rejected:* backend nested inside the Next.js root (two `package.json` trees overlapping, confusing builds); two separate repositories (one change would need two pull requests).

### 2. Backend: Fastify with TypeScript
Fastify validates request and response bodies against schemas, which is where server-side price and input validation will live (roadmap week 3). It has built-in request injection for tests, so routes are tested without starting a server.
*Rejected:* Express (no built-in validation, older async handling); Hono (smaller ecosystem for Node-hosted plugins); NestJS (heavy structure for a small API, harder to explain line by line).

### 3. Frontend: Next.js stays, without database access
Next.js keeps server rendering for SEO and speed (P7, P10). Its server components call the backend API over the internal Docker network; the browser calls the backend through the same domain under `/api`, so no cross-origin setup is needed.
*Rejected:* a client-only single-page app (worse SEO and first load, P7, P10).

### 4. Database: PostgreSQL 17 in Docker, reachable only by the backend
Postgres runs as a container on the server with no published port; only the backend container can reach it on the internal network. Drizzle and the migrations move to `backend/`.
*Rejected:* a managed database (Felix's choice: no US platform, everything on one EU server).

### 5. Hosting: one Hetzner server with Docker Compose and Caddy
- One small cloud server in a German or Finnish Hetzner data centre.
- Caddy as the reverse proxy: it gets and renews HTTPS certificates by itself.
- Staging and production run side by side as two Compose projects with their own databases.
- Until the shop has a domain, the addresses use a wildcard IP service (for example `staging.<server-ip>.sslip.io`), which works with automatic HTTPS.
- Deploys: a GitHub Actions job builds the two images, pushes them to the GitHub container registry, then connects to the server over SSH and restarts the matching Compose project. If the new containers fail their health check, the previous images are started again.
- Server hardening: SSH keys only, firewall open for ports 22, 80 and 443 only, automatic security updates.
*Rejected:* Coolify or a similar self-hosted platform (another system to learn and hand over); Vercel and Neon (Felix's choice); one preview per branch (needs per-branch databases and routing; staging covers owner review).

### 6. Email: an existing mailbox over SMTP and IMAP
The backend sends through the shop's mailbox over SMTP (port 587 or 465) and reads it over IMAP. No mail server runs on our machine: Hetzner blocks outbound port 25 on new servers, and a self-run mail server rarely reaches inboxes.
The weak points of plain SMTP are covered in the email change: an outbox table logs every message and its status, a worker sends at a steady rate and retries, and IMAP reads bounce messages back. Customer replies and orders sent by email are later changes that also use IMAP.
Locally, Mailpit catches all mail so nothing reaches real inboxes during development.

### 7. Payment: Stripe hosted Checkout, conditional on MobilePay
Unchanged. Stripe asks for a business website before payment methods can be set up; the shop's Instagram profile can be given. If MobilePay is not offered for DKK, switch to Quickpay or Frisbii before any payment code is written.

### 8. Backups
A nightly job on the server runs `pg_dump` for production and copies the file to a Hetzner Storage Box (EU), keeping 14 days. One restore into an empty database is tested before the change is merged.

### 9. Checks per workspace
Each workspace has its own `lint`, `typecheck`, `test` and `build` scripts; the root scripts run them for both. CI runs the root scripts and also builds the two Docker images, so a broken Dockerfile fails before deploy.

### 10. Branch flow with pull requests
Unchanged: feature branches merge into `DevEnv` through a pull request once CI is green.

## Risks / Trade-offs

- [Felix becomes the server administrator: updates, disk space, certificates, uptime] → automatic security updates, Caddy renews certificates, an uptime check in week 6, and a written runbook for hand-over.
- [One server is a single point of failure] → nightly off-server backups and a tested restore; acceptable for a demo package and a small shop.
- [Running two Compose projects on one small server may run out of memory] → start with 4 GB RAM; staging can be stopped when not reviewed.
- [No preview per branch] → the owner reviews staging; Felix reviews branches locally with `docker compose up`.
- [Mail from an ordinary mailbox may hit sending limits or spam filters] → outbox with steady rate and retries; check the mailbox's SPF, DKIM and DMARC before week 4.
- [Moving the app into `frontend/` breaks the verified setup] → each check is re-run after the move and recorded in the process note.

## Migration Plan

Nothing is live. The move happens on this branch: restructure first, re-run every check, then add the backend. Rollback is reverting the branch commits; the server can be deleted and recreated from the Compose files.

## Open Questions

- Which mailbox sends and receives: the shop's existing email address, or a new one? Needed for the email change, not for this one.
- A cheap domain would replace the `sslip.io` addresses and allow proper email records. Not needed now.
