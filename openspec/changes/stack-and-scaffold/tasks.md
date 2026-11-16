## 1. Before scaffolding

- [x] 1.1 Move the repository to a plain local folder, or confirm with Felix that its current folder is not cloud-synced; verify `git status` is clean and the remote is unchanged afterwards
- [x] 1.2 Create `docs/decisions.md` in the format from `ref/Design-Rationale.md` section 5, with entries for framework, database, hosting, payment, email and admin; verify each has "decision", "why" and "rejected"
- [ ] 1.3 Verify in Stripe test mode that MobilePay is offered to a Danish customer paying in DKK (give the shop's Instagram profile as the business website if asked); record the result with a date, and switch decision 7 to Quickpay if it fails
- [ ] 1.4 Update `docs/decisions.md` for the 16 Nov changes (frontend, backend, own server, email over SMTP and IMAP), keeping the replaced entries marked as superseded; verify every decision in design.md has an entry

## 2. First scaffold (managed-hosting plan, kept and moved in group 3)

- [x] 2.1 Create the Next.js app (App Router, TypeScript) in the repository root; verify `npm run dev` serves a page at `http://localhost:3000/`
- [x] 2.2 Add ESLint and Prettier with scripts `lint` and `format`; verify both pass on the fresh scaffold
- [x] 2.3 Add Vitest with one sample test and Playwright with one smoke test that loads the home page; verify `npm test` and `npm run test:e2e` pass
- [x] 2.4 Add start-up validation of environment variables and a checked-in `.env.example`; verify the app stops and names the variable when one is missing
- [x] 2.5 Record each dependency and its reason in `docs/decisions.md`; verify no package is unlisted
- [x] 2.6 Add Drizzle with one empty initial migration and scripts to generate and run migrations; verify the migration runs against the database
- [x] 2.7 Add the health check that reports database reachability without connection details; verify both the success and the failure response
- [x] 2.8 Add a GitHub Actions workflow running lint, type check, unit tests and build; verify a deliberately failing test turns the check red

## 3. Split into frontend and backend

- [ ] 3.1 Convert the root to npm workspaces and move the Next.js app into `frontend/`; verify lint, format, type check, unit tests, the Playwright smoke test and build all pass from the root
- [ ] 3.2 Create `backend/` with Fastify and TypeScript, its own environment check and `.env.example`; verify it starts on a local port and exits naming a missing variable
- [ ] 3.3 Move Drizzle, the migration, the `formatKroner` helper and the health check into `backend/`, and remove all database code and variables from `frontend/`; verify the migration runs, the health check returns 200 and 503 as before, and a search of `frontend/` finds no database client or connection string
- [ ] 3.4 Add backend unit tests using Fastify request injection for the health route; verify `npm test` runs both workspaces' tests
- [ ] 3.5 Let the frontend call the backend: server-side over an internal address, browser-side through `/api`; verify a frontend server component can show the backend's health status locally

## 4. Containers

- [ ] 4.1 Write Dockerfiles for the frontend and the backend (multi-stage, non-root user); verify both images build and start
- [ ] 4.2 Write the local `compose.yaml` running Caddy, frontend, backend, Postgres and Mailpit, with Postgres on the internal network only; verify `docker compose up` serves the home page and `/api/health` through Caddy, and the database port is not published
- [ ] 4.3 Extend CI to run the checks for both workspaces and build both images; verify a failing backend test turns the check red

## 5. Server and deploys

- [ ] 5.1 Felix rents a Hetzner cloud server (4 GB RAM) in Germany or Finland and adds an SSH key; record location and date in the decision log
- [ ] 5.2 Harden the server: SSH keys only, firewall for ports 22, 80 and 443, automatic security updates, Docker installed; verify a password login and a connection to port 5432 from outside are both refused
- [ ] 5.3 Write the staging and production Compose files and Caddy config under `deploy/`, using `sslip.io` addresses; verify both answer over HTTPS
- [ ] 5.4 Add the deploy job: build and push images, then restart the matching Compose project over SSH, rolling back if health checks fail; verify a merge into `DevEnv` updates staging, and a deliberately broken start keeps the old version running
- [ ] 5.5 Felix protects `DevEnv` and `main` on GitHub (pull request and passing checks required), sets `DevEnv` as default branch and deletes the old `dev` branch; verify a direct push is rejected

## 6. Backups

- [ ] 6.1 Felix orders a Hetzner Storage Box in the EU; record its location
- [ ] 6.2 Add the nightly `pg_dump` job copying to the Storage Box and keeping 14 days; verify a backup file appears after a manual run
- [ ] 6.3 Restore a backup into an empty database; verify the backend health check passes against it and the test data is present

## 7. Records and hand-over

- [ ] 7.1 Write `docs/runbook.md`: server access, deploy, rollback, backup and restore, updates, and how each account (Hetzner, Stripe, mailbox) moves to the owner; verify each step names the command or screen it uses
- [ ] 7.2 Save or link the data processing agreements for Hetzner, Stripe and the mail host in `docs/`; verify all three are listed
- [ ] 7.3 Update `CLAUDE.md` with the workspace commands and the local stack; verify the commands work as written
- [ ] 7.4 Update the process note with the architecture change and every check result; verify it links this change

## 8. Merge

- [ ] 8.1 Run `openspec validate stack-and-scaffold` and confirm every spec scenario has a recorded result
- [ ] 8.2 Open a pull request into `DevEnv`, merge it when the checks pass, and delete the feature branch; verify the staging address shows the app
