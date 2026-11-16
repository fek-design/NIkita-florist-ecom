## 1. Before scaffolding

- [x] 1.1 Move the repository to a plain local folder, or confirm with Felix that its current folder is not cloud-synced; verify `git status` is clean and the remote is unchanged afterwards
- [ ] 1.2 Create `docs/decisions.md` in the format from `ref/Design-Rationale.md` section 5, with entries for framework, database, hosting, payment, email and admin; verify each has "decision", "why" and "rejected"
- [ ] 1.3 Verify in Stripe test mode that MobilePay is offered to a Danish customer paying in DKK; record the result with a date, and switch decision 4 to Quickpay if it fails

## 2. Scaffold

- [x] 2.1 Create the Next.js app (App Router, TypeScript) in the repository root; verify `npm run dev` serves a page at `http://localhost:3000/`
- [x] 2.2 Add ESLint and Prettier with scripts `lint` and `format`; verify both pass on the fresh scaffold
- [x] 2.3 Add Vitest with one sample test and Playwright with one smoke test that loads the home page; verify `npm test` and `npm run test:e2e` pass
- [x] 2.4 Add start-up validation of environment variables and a checked-in `.env.example`; verify the app stops and names the variable when one is missing
- [ ] 2.5 Record each dependency and its reason in `docs/decisions.md`; verify no package is unlisted

## 3. Database

- [ ] 3.1 Create the Postgres project in an EU region and record the region and date; verify the connection string is only in environment configuration
- [ ] 3.2 Add Drizzle with one empty initial migration and scripts to generate and run migrations; verify the migration runs against the database
- [ ] 3.3 Add the health check that reports database reachability without connection details; verify both the success and the failure response

## 4. CI and deploys

- [ ] 4.1 Add a GitHub Actions workflow running lint, type check, unit tests and build on pull requests into `DevEnv` and `main`; verify a deliberately failing test turns the check red
- [ ] 4.2 Create the hosting project with the function region in the EU, `main` as production and `DevEnv` as staging; verify a pushed feature branch gets a preview URL
- [ ] 4.3 Felix protects `DevEnv` and `main` on GitHub (pull request and passing checks required) and deletes the old `dev` branch; verify a direct push is rejected
- [ ] 4.4 Request the health check on the preview and staging URLs; verify both report success

## 5. Accounts and records

- [ ] 5.1 Record for each account (hosting, database, payment, email) how ownership moves to the owner later; verify the steps are listed for the week 6 go-live guide
- [ ] 5.2 Check the email provider's EU data handling and sending-domain setup, and open the account; verify the result is in the decision log
- [ ] 5.3 Save or link the data processing agreement for hosting, database, payment and email in `docs/`; verify all four are listed
- [ ] 5.4 Update `CLAUDE.md` with the run, test and build commands and the pull-request rule from design decision 9; verify the commands work as written
- [ ] 5.5 Write the process note `docs/process/2026-11-16-stack-and-scaffold.md`; verify it links this change

## 6. Merge

- [ ] 6.1 Run `openspec validate stack-and-scaffold` and confirm every spec scenario has a recorded result
- [ ] 6.2 Open a pull request into `DevEnv`, merge it when the checks pass, and delete the feature branch; verify the staging URL shows the app
