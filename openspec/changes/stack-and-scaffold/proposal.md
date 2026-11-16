## Why

Week 2 of the roadmap needs a running app: products browsable, a cart, and an admin the owner can use. There is no app yet, and none of the six stack decisions in `ref/Roadmap.md` is locked.

The owner interview (16 Nov) settled that the shop will not go live within the project: the result is a finished package she takes into use later. Test-mode payment is enough, and no own domain is needed now ([interview notes](../../../docs/process/2026-11-16-owner-interview.md)).

## What Changes

- **Lock the stack** and record each decision (what, why, what was rejected) in a new decision log, `docs/decisions.md`:
  - Framework: Next.js (App Router) with TypeScript
  - Database: PostgreSQL in an EU region, with Drizzle as the typed query layer
  - Hosting: a managed platform with an EU function region and a preview deploy per branch
  - Payment: Stripe hosted Checkout, on the condition that MobilePay works in test mode
  - Email: a transactional email API with EU data handling
  - Admin: a minimal admin inside the same app
- **Scaffold the app** in the repository root: lint, format, unit-test runner, end-to-end test runner, and environment handling with a checked-in example file.
- **Continuous integration** on every pull request into `DevEnv`: lint, type check, unit tests and build.
- **Automatic deploys:** a preview URL for every feature branch, a staging deploy from `DevEnv`, and production from `main`.
- **Database connection** proven end to end with one empty migration and a health page. The product and order tables are not part of this change.
- **Open the accounts** (hosting, database, payment in test mode, email) in a way the owner can take over later.

Out of scope: the data model, any storefront or admin screen, the brand tokens (they come from `brand-identity`), and real payment or email code.

## Capabilities

### New Capabilities
- `project-foundation`: how the app is built, checked and deployed: automated checks before merge, a deploy per branch, EU data location, and secrets kept out of the repository.

### Modified Capabilities

None.

## Impact

- New app source, configuration and lockfile in the repository root; a `.github/workflows/` folder for CI.
- New runtime dependencies: Next.js, React, Drizzle and a Postgres driver. New dev dependencies: TypeScript, ESLint, Prettier, Vitest and Playwright. Each is recorded with a reason (roadmap rule 8).
- New external accounts: hosting, database, Stripe (test mode) and email. Each is a data processor, so each needs a data processing agreement on file for week 5.
- `ref/Roadmap.md` says the app deploys from `main`. That stays true for production; `DevEnv` gets the staging deploy.
- `CLAUDE.md` gains the commands to run, test and build the app.
- Work happens on branch `feature/stack-and-scaffold`.
