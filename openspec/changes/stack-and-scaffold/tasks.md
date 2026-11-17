## 1. Before scaffolding

- [x] 1.1 Move the repository to a plain local folder, or confirm with Felix that its current folder is not cloud-synced; verify `git status` is clean and the remote is unchanged afterwards
- [x] 1.2 Create `docs/decisions.md` in the format from `ref/Design-Rationale.md` section 5, with entries for framework, database, hosting, payment, email and admin; verify each has "decision", "why" and "rejected"
- [x] 1.3 Verify in Stripe test mode that MobilePay is offered to a Danish customer paying in DKK; record the result with a date — *17 Nov: MobilePay is offered in test mode for EUR, DKK, NOK and SEK (Felix). Stripe kept*
- [ ] 1.4 Update `docs/decisions.md` for the 16–17 Nov changes (frontend, backend, free managed hosting, scheduling, backups, email over SMTP and IMAP, the rejected own-server and Simply options), keeping replaced entries marked as superseded; verify every decision in design.md has an entry

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
- [ ] 3.5 Connect the frontend to the backend: server-side through `BACKEND_URL`, browser-side through a `/api/*` rewrite; verify locally that a frontend page shows the backend's health status
- [ ] 3.6 Add the protected job endpoint `POST /jobs/ping` with a shared secret; verify a call with the secret succeeds and a call without it is rejected
- [ ] 3.7 Extend the local `compose.yaml` with Mailpit, and update CI to run every check for both workspaces; verify a failing backend test turns CI red

## 4. Hosting

- [ ] 4.1 Felix creates the Neon project (free plan, Frankfurt) with the Vercel integration; record region and date in the decision log
- [ ] 4.2 Felix creates the two Vercel projects (Hobby) from the repository, root directories `frontend/` and `backend/`, function region Frankfurt; set environment variables in Vercel only; record region and date
- [ ] 4.3 Assign `DevEnv` to the staging domains and `main` to production; verify a pushed branch gets preview addresses for both apps and the preview frontend talks to a non-production backend
- [ ] 4.4 Run the migration against the staging and production databases; verify the backend health check reports success on preview, staging and production
- [ ] 4.5 Felix protects `DevEnv` and `main` on GitHub (pull request and passing checks required), sets `DevEnv` as default branch and deletes the old `dev` branch; verify a direct push is rejected

## 5. Scheduling and backups

- [ ] 5.1 Add the GitHub Actions schedule calling `POST /jobs/ping` every 15 minutes on staging; verify runs appear and succeed
- [ ] 5.2 Felix creates an `age` key pair and stores the public key as a repository secret, keeping the private key offline
- [ ] 5.3 Add the nightly backup workflow (`pg_dump`, encrypt with `age`, upload as an artifact kept 14 days); verify a manual run produces an encrypted file that cannot be read without the key
- [ ] 5.4 Restore a backup into a fresh Neon branch; verify the backend health check passes against it and test data is present

## 6. Records and hand-over

- [ ] 6.0 Keep `docs/handover.md` complete: one row per account, secret and personal detail created in this change; verify every account and variable in group 4 and 5 has a row
- [ ] 6.1 Write `docs/runbook.md`: accounts, deploys, rollback, backup and restore, scheduled jobs, free-plan limits with the dates they were read, and what the owner must change to go live (paid plans or another host, moving each account to her); verify each step names the screen or command it uses
- [ ] 6.2 Save or link the data processing agreements for Vercel, Neon, Stripe and GitHub in `docs/`, marking the third-country transfers; verify all four are listed
- [ ] 6.3 Update `CLAUDE.md` with the workspace commands and the local stack; verify the commands work as written
- [ ] 6.4 Update the process note with the architecture changes of 16–17 Nov and every check result; verify it links this change

## 7. Merge

- [ ] 7.1 Run `openspec validate stack-and-scaffold` and confirm every spec scenario has a recorded result
- [ ] 7.2 Felix opens a pull request into `DevEnv` and merges it when the checks pass, then deletes the feature branch; verify the staging address shows the app
