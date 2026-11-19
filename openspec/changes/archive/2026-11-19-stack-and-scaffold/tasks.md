## 1. Before scaffolding

- [x] 1.1 Move the repository to a plain local folder, or confirm with Felix that its current folder is not cloud-synced; verify `git status` is clean and the remote is unchanged afterwards
- [x] 1.2 Create `docs/decisions.md` in the format from `ref/Design-Rationale.md` section 5, with entries for framework, database, hosting, payment, email and admin; verify each has "decision", "why" and "rejected"
- [x] 1.3 Verify in Stripe test mode that MobilePay is offered to a Danish customer paying in DKK; record the result with a date — *17 Nov: MobilePay is offered in test mode for EUR, DKK, NOK and SEK (Felix). Stripe kept*
- [x] 1.4 Update `docs/decisions.md` for the 16–17 Nov changes (frontend, backend, free managed hosting, scheduling, backups, email over SMTP and IMAP, the rejected own-server and Simply options), keeping replaced entries marked as superseded; verify every decision in design.md has an entry

## 2. First scaffold (kept and moved in group 3)

- [x] 2.1 Create the Next.js app (App Router, TypeScript) in the repository root; verify `npm run dev` serves a page at `http://localhost:3000/`
- [x] 2.2 Add ESLint and Prettier with scripts `lint` and `format`; verify both pass on the fresh scaffold
- [x] 2.3 Add Vitest with one sample test and Playwright with one smoke test that loads the home page; verify `npm test` and `npm run test:e2e` pass
- [x] 2.4 Add start-up validation of environment variables and a checked-in `.env.example`; verify the app stops and names the variable when one is missing
- [x] 2.5 Record each dependency and its reason in `docs/decisions.md`; verify no package is unlisted
- [x] 2.6 Add Drizzle with one empty initial migration and scripts to generate and run migrations; verify the migration runs against the database
- [x] 2.7 Add the health check that reports database reachability without connection details; verify both the success and the failure response
- [x] 2.8 Add a GitHub Actions workflow running lint, type check, unit tests, build and a production dependency audit; verify a deliberately failing test turns the check red

## 3. Split into frontend and backend

- [x] 3.1 Convert the root to npm workspaces and move the Next.js app into `frontend/`; verify lint, format, type check, unit tests, the Playwright smoke test and build all pass from the root
- [x] 3.2 Create `backend/` with Fastify and TypeScript, runnable as a local Node server and deployable to Vercel, with its own environment check and `.env.example`; verify it starts locally and exits naming a missing variable
- [x] 3.3 Move Drizzle, the migration, the `formatKroner` helper and the health check into `backend/`, and remove all database code and variables from `frontend/`; verify the migration runs, the health check returns 200 and 503 as before, and a search of `frontend/` finds no database client or connection string
- [x] 3.4 Add backend unit tests using Fastify request injection; verify `npm test` runs both workspaces' tests
- [x] 3.5 Connect the frontend to the backend: server-side through `BACKEND_URL`, browser-side through a `/api/*` rewrite; verify locally that a frontend page shows the backend's health status
- [x] 3.6 Add the protected job endpoint `POST /jobs/ping` with a shared secret; verify a call with the secret succeeds and a call without it is rejected
- [x] 3.7 Extend the local `compose.yaml` with Mailpit, and update CI to run every check for both workspaces; verify a failing backend test turns CI red — *17 Nov: all CI steps pass in a fresh clone; a failing backend test makes the root `npm test` exit 1, which fails the CI step. Confirm on the next pushed CI run*

## 4. Hosting

*Order change, 17 Nov: the code in groups 1–3 is merged into `DevEnv` before this group, because Vercel imports a project from the repository's default branch (`DevEnv`), which must already contain `frontend/` and `backend/`. The remaining groups continue on a new branch, `feature/hosting`; this change is archived when they are done.*

- [x] 4.1 Felix creates the Neon project (free plan, Frankfurt) with the Vercel integration; record region and date in the decision log — *17 Nov: `nikita-florist`, Frankfurt, connected to the backend project only*
- [x] 4.2 Felix creates the two Vercel projects (Hobby) from the repository, root directories `frontend/` and `backend/`, function region Frankfurt; set environment variables in Vercel only; record region and date — *17–19 Nov: backend `nikita-florist-ecom` (root `backend/`) and frontend `nikita-florist-frontend` (root `frontend/`); functions pinned to Frankfurt by `vercel.json`; `JOB_SECRET` and the Neon variables in the backend only, `BACKEND_URL` in the frontend*
- [x] 4.3 Make `main` the production branch and `DevEnv` staging (its automatic branch address); verify a pushed branch gets preview addresses for both apps and the preview frontend talks to a non-production backend — *19 Nov: production is `main` on both projects (Felix); `DevEnv` builds as a preview on both (the frontend's `git-devenv` address exists behind the login wall); branch previews exist for the backend; every frontend environment points `BACKEND_URL` at the staging backend, never production*
- [x] 4.4 Run the migration against the staging and production databases; verify the backend health check reports success on preview and staging; production is verified at the first release to `main` (v0.1) — *17 Nov: migration applied to Neon's main branch (Felix; drizzle-kit printed no success line against Neon, confirmed in the Neon console: `drizzle.__drizzle_migrations` has 1 row). `/health` on the `feature/hosting` preview returns ok. 19 Nov: staging `/health` ok at `nikita-florist-ecom-git-devenv-fekdesign.vercel.app`; the frontend's `/status` shows "Alt kører" and its `/api/health` rewrite answers ok*
- [x] 4.5 Felix protects `DevEnv` and `main` on GitHub (pull request and passing checks required), sets `DevEnv` as default branch and deletes the old `dev` branch; verify a direct push is rejected — *17 Nov: `DevEnv` is the default and `dev` is deleted (confirmed via GitHub). Branch protection set by Felix the same day; the GitHub API reports both `DevEnv` and `main` as protected*

## 5. Moved out (19 Nov, Felix)

Not part of this change any more. Each is written into the roadmap week that needs it:
- Schedule calling `POST /jobs/<name>` from GitHub Actions: week 4, with the email change (retries and inbox reading need it first).
- `age` key pair, nightly encrypted backup workflow and a tested restore: week 5, hardening.
- `docs/runbook.md`, including the lesson that a start-up crash on Vercel shows as a generic 500: week 6, hand-over.
- Data processing agreements for Vercel, Neon, Stripe, GitHub and the mailbox: week 5, GDPR.

## 6. Records and hand-over

- [x] 6.0 Keep `docs/handover.md` complete: one row per account, secret and personal detail created in this change; verify every account and variable in group 4 and 5 has a row
- [x] 6.3 Update `CLAUDE.md` with the workspace commands and the local stack; verify the commands work as written
- [x] 6.4 Update the process note with the architecture changes of 16–17 Nov and every check result; verify it links this change — *19 Nov: dead ends 1–9, spec checks and status at close recorded*

## 7. Merge

- [x] 7.1 Run `openspec validate stack-and-scaffold` and confirm every spec scenario has a recorded result — *19 Nov: valid; every scenario has a result in the process note (point 10 and the hosting list)*
- [x] 7.2 Felix opens a pull request into `DevEnv` and merges it when the checks pass, then deletes the feature branch; verify the staging address shows the app — *completed by the pull request that carries this archive commit*
