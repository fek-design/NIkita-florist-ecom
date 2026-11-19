## Why

Week 2 of the roadmap needs a running app: products browsable, a cart, and an admin the owner can use. The case describes an API-driven full-stack solution with a separate backend side that ties payment and email together (`ref/Case Synopsis - Felix.md`).

Inputs that shape the stack:
- The owner interview (16 Nov): the shop will not go live within the project. The result is a finished package she takes into use later. Test-mode payment is enough, and no own domain is needed now ([interview notes](../../../../docs/process/2026-11-16-owner-interview.md)).
- Felix's decisions (16–17 Nov): split the code into a separate backend service and a frontend; send email over SMTP and receive it over IMAP; host at no cost, because this is a school project. Simply.com's webhotel serves static sites only, and a rented server costs money, so the free tiers of managed platforms are used, in EU regions.

## What Changes

- **Two apps in one repository**, as npm workspaces:
  - `frontend/`: the Next.js storefront and admin screens. It never touches the database; it calls the backend API.
  - `backend/`: a standalone API service (Node.js, TypeScript, Fastify) that owns the database, business rules, payment and email.
- **Free hosting in EU regions:** the frontend and the backend as two Vercel projects (functions in Frankfurt), and PostgreSQL on Neon's free plan (Frankfurt).
- **Automatic deploys:** every branch gets a preview address, `DevEnv` deploys to staging, `main` to production.
- **A protected job endpoint** in the backend (`POST /jobs/<name>`, guarded by `JOB_SECRET`), ready for scheduled work.

*Moved out on 19 Nov (Felix):* the GitHub Actions schedule that calls it moves to the email change in week 4, where email retries first need it. Nightly encrypted backups and the restore test move to hardening in week 5, once real data exists. The runbook and the data processing agreements move to weeks 5–6. The designs stay in decisions 6 and 7 below and in decision log D-012.
- **Lock the stack** and record each decision in `docs/decisions.md`.
- **Checks on every push and pull request:** lint, format, type check, unit tests, build and a dependency audit, for both apps.
- **Local development unchanged in spirit:** Docker Compose runs Postgres and a mail catcher on Felix's Mac.
- **The work already done moves:** the scaffold, environment check, Drizzle setup and health check built earlier on this branch are kept and moved into the two apps.

Out of scope: the data model, any storefront or admin screen, the brand tokens, payment and email code. Sending email with an outbox, and receiving email over IMAP (bounce tracking, customer replies, orders sent by email), are separate changes in weeks 3–4.

## Capabilities

### New Capabilities
- `project-foundation`: how the webshop is split, built, checked, deployed and backed up: a backend API that alone owns the data, automated checks before merge, deploys with data in EU regions, secrets kept out of the repository, and restorable backups.

### Modified Capabilities

None.

## Impact

- The Next.js app moves from the repository root into `frontend/`. A new `backend/` workspace holds the API, the database code and the migrations.
- New runtime dependency for the backend: Fastify. Drizzle and the Postgres driver move to the backend. Each package is recorded with a reason (roadmap rule 8).
- Accounts, all free: Vercel (Hobby), Neon (Free), Stripe (test mode), GitHub Actions. Each is a data processor or stores project data and needs a data processing agreement on file for week 5. Vercel, Neon and GitHub are US companies with EU regions: this is recorded as a third-country transfer in the GDPR data map.
- Vercel's free plan is for non-commercial use. That fits a school project; when the owner goes live she moves to a paid plan or another host, which the hand-over runbook describes.
- The mailbox for SMTP and IMAP is still to be chosen. Simply.com is not used.
- `CLAUDE.md` commands change to workspace commands.
- Work happens on branch `feature/stack-and-scaffold`.
