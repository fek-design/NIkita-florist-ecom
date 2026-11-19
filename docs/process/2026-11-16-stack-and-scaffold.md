# Stack and scaffold

**Date:** 16 Nov 2026 · **Change:** [`stack-and-scaffold`](../../openspec/changes/archive/2026-11-19-stack-and-scaffold/) · **Branch:** `feature/stack-and-scaffold`
**Related:** [Decision log](../decisions.md) · [Roadmap](../../ref/Roadmap.md) · [Owner interview](2026-11-16-owner-interview.md)

## Goal

An empty app that builds, is checked automatically and connects to a database, so week 2 starts on a working pipeline. No tables, screens or business rules.

## Inputs

- The roadmap's recommended stack, each with a "check before committing".
- The owner interview: the shop does not go live within the project, so no live payment account or own domain is needed now.
- Design-Rationale P1 (phone first), P7 (speed) and P10 (findable).

## What was built

| Part | Result |
|---|---|
| App | Next.js 16.4.6, App Router, TypeScript, `src/` layout, Danish `lang`, placeholder home page |
| Checks | ESLint, Prettier, type check, Vitest (8 unit tests), Playwright smoke test on a Pixel 7 viewport |
| Config | Required variables checked at start-up (`src/env.ts`); `.env.example` committed, `.env.local` ignored |
| Database | Drizzle with an empty first migration; local Postgres 17 via `compose.yaml` |
| Health | `GET /api/health` reports whether the database is reachable, with no connection details |
| CI | GitHub Actions on every push and pull request: lint, format, types, unit tests, build |

## Options and decisions

The stack decisions, with what was rejected, are in the [decision log](../decisions.md) (D-001 to D-008). Notes on the ones that changed during the work:

- **Next.js version.** The first scaffold used 15.5.4. `npm audit` showed one critical and two high vulnerabilities in production dependencies, so it was regenerated on 16.4.6, which audits clean for production. Version 16 has changed APIs (Cache Components, generated route types), so each API was checked against the docs shipped in `node_modules/next/dist/docs/` before use. *Opinion:* the newest major is worth the learning cost for a project that must still be supported after hand-in.
- **Fonts left out.** The scaffold loaded Geist from Google Fonts. It was removed: brand fonts are self-hosted and come from change `brand-identity` (P7, GDPR).
- **Money in øre** (D-007): added with the first unit test so the convention exists before any price code.

## Dead ends and fixes

Recorded as they happened.

1. **Production did not stop on a missing variable.** The first version threw in the start-up hook. `next dev` stopped, but `next start` kept running and answered every request with 500. The spec says the app must stop, so the hook now logs the variable name and exits with code 1. Re-tested: both dev and production exit with code 1 and name `DATABASE_URL`.
2. **A misleading test.** The production test above first passed for the wrong reason: Next.js reads `.env.local` by itself, so unsetting the variable in the shell did nothing. Re-run with `.env.local` moved aside.
3. **The build needed a database secret.** Creating the database client when the module loaded made `next build` fail without `DATABASE_URL`, which would force a secret into CI. The client is now created on first use, and the build passes with no environment file.
4. **CI type check failed on a fresh checkout.** `LayoutProps` is generated into `.next/` by dev or build, which a fresh CI checkout lacks. Reproduced in a clean clone; fixed by running `next typegen` before `tsc`.
5. **Migrations ignored `.env.local`.** `npm run db:migrate` worked only because the variable had been loaded by hand earlier. Found while checking the commands in CLAUDE.md "as written"; the Drizzle config now loads `.env.local` the way Next.js does.
6. **Prettier reformatted CLAUDE.md.** Root Markdown files are now excluded from formatting, as are `ref/`, `docs/`, `openspec/` and the vendored skills.

## How it was checked (16 Nov 2026)

| Check | Result |
|---|---|
| Home page on the dev server | 200, `lang="da"` |
| Unit tests | 8 passed |
| Playwright smoke test (Pixel 7) | 1 passed |
| Start-up without `DATABASE_URL` (dev and production) | Exits with code 1, names the variable |
| Build without any environment file | Passes |
| Migration against local Postgres 17 | Applied, 1 row in `drizzle.__drizzle_migrations` |
| Health check, database up / down / back up | 200 / 503 without connection details / 200 |
| CI on `feature/stack-and-scaffold` | Green |
| CI with a deliberately failing test (throwaway branch `test/ci-red`, deleted) | Red at the unit-test step |
| `npm audit --omit=dev` | 0 vulnerabilities |

## Not done yet (needs accounts or GitHub settings)

- MobilePay check in Stripe test mode (task 1.3).
- Hosted Postgres in an EU region (3.1), Vercel project and preview deploys (4.2, 4.4).
- Branch protection on `DevEnv` and `main`, and deleting the old `dev` branch (4.3).
- Account hand-over notes, email provider check and data processing agreements (5.1–5.3).

## Open questions

- Felix has no GitHub CLI installed, so pull requests are opened in the browser for now.

## Hosting: first deploy to Vercel (17 Nov)

Recorded as it happened, on branch `feature/hosting`.

1. **Vercel could not import the backend folder.** Vercel imports from the default branch (`DevEnv`), which did not have `backend/` yet. The code part of this change was merged first (PR #3); hosting continues on `feature/hosting`.
2. **"No entrypoint found which imports fastify".** Vercel only accepts an entry file that imports `fastify` itself. `server.ts` now creates the Fastify instance; the routes moved into `registerRoutes()`, which the tests also use.
3. **The production address returned DEPLOYMENT_NOT_FOUND.** Not a bug: the production build of `DevEnv` had failed on point 2, and the working build was the `feature/hosting` preview, which has its own address.
4. **The preview crashed with INTERNAL_FUNCTION_INVOCATION_FAILED and no app output.** First suspicion was the top-level `await app.listen()`, which differs from Vercel's example; it was changed to match the example and a "Backend starting" log line was added. The real cause, found by Felix: `JOB_SECRET` was not set for the Preview environment, so the start-up check stopped the backend on purpose. The listen change is kept because it matches Vercel's documented pattern, but it did not fix anything.
   - Lesson for the runbook: a missing variable shows on Vercel as a generic 500, not as our message naming the variable. When a deployment crashes at start-up, check that every variable in `backend/.env.example` is set for that environment first.
5. **Neon's pooler and prepared statements.** The Neon integration's `DATABASE_URL` goes through pgbouncer, so the Postgres driver now runs with prepared statements turned off. Migrations use `DATABASE_URL_UNPOOLED`.
6. **First migration against Neon (17 Nov).** Run by Felix from his Mac with `DATABASE_URL_UNPOOLED`. Against Neon, `drizzle-kit migrate` printed no success line, unlike locally; Neon's console showed `drizzle.__drizzle_migrations` with 1 row, so it worked. The `feature/hosting` preview's `/health` returned `{"status":"ok","database":"reachable"}`: the backend on Vercel reaches the database in Frankfurt.
7. **Staging and the frontend (18–19 Nov).** Vercel's login wall was switched off on the backend project only: the backend has no pages, `/health` reveals nothing and `/jobs` needs `JOB_SECRET`. A custom staging domain was dropped: Vercel gives every preview branch its own address, so staging is `nikita-florist-ecom-git-devenv-fekdesign.vercel.app`. Production was moved to `main` on both projects. Felix asked why the repository is imported a second time for the frontend: one Vercel project builds one folder, so each app gets its own project, which also keeps the database credentials in the backend only.
8. **End to end (19 Nov), checked from outside:** staging backend `/health` ok; the frontend at `nikita-florist-frontend.vercel.app` serves the Danish home page, its `/status` shows "Alt kører", and `/api/health` reaches the backend through the rewrite. That frontend address was built from `DevEnv` at import, before production moved to `main`; it stays on that build until the first release.
9. **Re-scope (19 Nov, Felix):** to close the foundation and start the catalog in week 2, the scheduled-job workflow (week 4), backups and restore test (week 5), runbook (week 6) and data processing agreements (week 5) moved out of this change into the roadmap.

10. **Spec scenarios checked at close (19 Nov):**
    - *No secret committed:* the full git history (all branches) was searched for connection strings with passwords, Stripe and webhook keys, Neon passwords, private keys, `age` keys, GitHub and Vercel tokens, and `JOB_SECRET` values. The only matches are the local Docker password (`florist`) and fake passwords in tests.
    - *Vulnerable dependency fails CI:* in a scratch folder with `lodash@4.17.4`, `npm audit --omit=dev --audit-level=high` reported a critical finding and exited with code 1, which fails the CI step.
    - *Unencrypted connection refused:* tested by Felix on 19 Nov with a Node script that connects to Neon's direct address with TLS turned off. Neon refused it ("Refused without TLS"). The same script against the local Docker database, which has no TLS, was accepted, which shows the test can tell the two apart.

## Status at close (19 Nov)

Built and verified: two workspaces, CI with audit, local stack, backend on Vercel reaching Neon in Frankfurt, frontend on Vercel reaching the backend. Production on `main` is verified at the first release (v0.1).

