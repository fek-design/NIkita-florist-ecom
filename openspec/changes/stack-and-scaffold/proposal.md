## Why

Week 2 of the roadmap needs a running app: products browsable, a cart, and an admin the owner can use. The case describes an API-driven full-stack solution with a separate backend side that ties payment and email together (`ref/Case Synopsis - Felix.md`).

Two inputs shape the stack:
- The owner interview (16 Nov): the shop will not go live within the project. The result is a finished package she takes into use later. Test-mode payment is enough, and no own domain is needed now ([interview notes](../../../docs/process/2026-11-16-owner-interview.md)).
- Felix's decisions (16 Nov): run everything on one EU server instead of managed US platforms; split the code into a separate backend service and a frontend; send email over SMTP and receive it over IMAP.

## What Changes

- **Two apps in one repository**, as npm workspaces:
  - `frontend/`: the Next.js storefront and admin screens. It never touches the database; it calls the backend API.
  - `backend/`: a standalone API service (Node.js, TypeScript, Fastify) that owns the database, business rules, payment and email.
- **Self-hosted on one EU server** (Hetzner, Germany or Finland), with Docker Compose running the frontend, the backend, PostgreSQL and a reverse proxy that handles HTTPS.
- **Automatic deploys:** `DevEnv` deploys to a staging address, `main` to production, both on the same server. Branches no longer get their own preview address; the owner reviews staging.
- **Nightly database backups** off the server, with one restore tested.
- **Lock the stack** and record each decision in `docs/decisions.md`.
- **Checks on every push and pull request:** lint, format, type check, unit tests and build, for both apps.
- **The work already done moves:** the scaffold, environment check, Drizzle setup and health check built earlier on this branch are kept and moved into the two apps.

Out of scope: the data model, any storefront or admin screen, the brand tokens, payment and email code. Sending email over SMTP with an outbox, and receiving email over IMAP (bounce tracking, customer replies, orders sent by email), are separate changes in weeks 3–4.

## Capabilities

### New Capabilities
- `project-foundation`: how the webshop is split, built, checked, deployed and backed up: a backend API that alone owns the data, automated checks before merge, deploys to an EU server, secrets kept out of the repository, and restorable backups.

### Modified Capabilities

None.

## Impact

- The Next.js app moves from the repository root into `frontend/`. A new `backend/` workspace holds the API, the database code and the migrations.
- New runtime dependency for the backend: Fastify. Drizzle and the Postgres driver move to the backend. Each package is recorded with a reason (roadmap rule 8).
- New infrastructure: one rented server, a Docker Compose file per environment, a reverse proxy, and off-server backup storage. Felix maintains the server until hand-over: operating-system updates, firewall, backups.
- Accounts: Hetzner (server and backup storage), Stripe in test mode, and the mailbox used for SMTP and IMAP. Each is a data processor and needs a data processing agreement on file for week 5.
- No vendor email service: email deliverability depends on the sending mailbox's domain records (SPF, DKIM, DMARC).
- `ref/Roadmap.md` recommended managed hosting with a preview per change. That is replaced by staging on the own server.
- `CLAUDE.md` commands change to workspace commands.
- Work happens on branch `feature/stack-and-scaffold`.
