## Purpose

Defines how the webshop is built, checked and deployed, so that every change is verified automatically and reviewable on a live URL before it reaches customers.

## ADDED Requirements

### Requirement: Checks gate every merge
Every pull request into `DevEnv` or `main` SHALL run lint, type check, unit tests and a production build automatically. A pull request with a failing check MUST NOT be mergeable.

#### Scenario: Failing test blocks the merge
- **WHEN** a pull request contains a failing unit test
- **THEN** the check run is reported as failed on the pull request and the merge is blocked

#### Scenario: Passing checks allow the merge
- **WHEN** all checks pass on a pull request
- **THEN** the pull request is shown as ready to merge

### Requirement: Every branch has a preview
Every pushed feature branch SHALL be deployed automatically to its own preview URL. `DevEnv` SHALL deploy to a stable staging URL and `main` to production.

#### Scenario: Feature branch pushed
- **WHEN** a commit is pushed to a feature branch
- **THEN** a preview URL for that commit is available within a few minutes without any manual step

#### Scenario: Merge into DevEnv
- **WHEN** a feature branch is merged into `DevEnv`
- **THEN** the staging URL shows the merged result

### Requirement: Personal data stays in the EU
The database and the server functions that handle personal data SHALL run in an EU region.

#### Scenario: Region recorded
- **WHEN** the hosting and database projects are created
- **THEN** their regions are EU regions and are recorded with a date in the decision log

### Requirement: Secrets stay out of the repository
Secrets SHALL be supplied through environment configuration only. The repository SHALL contain an example environment file that lists every required variable without real values. The app MUST fail at start-up with a clear message when a required variable is missing.

#### Scenario: Missing variable
- **WHEN** the app starts without a required environment variable
- **THEN** it stops and names the missing variable

#### Scenario: No secret committed
- **WHEN** the repository history is scanned for secrets
- **THEN** no key, token or database password is found

### Requirement: The app proves its database connection
The deployed app SHALL expose a health check that reports whether it can reach the database, without revealing connection details.

#### Scenario: Database reachable
- **WHEN** the health check is requested on a deployed environment
- **THEN** it reports success

#### Scenario: Database unreachable
- **WHEN** the database cannot be reached
- **THEN** the health check reports failure with an error status and no connection string or credentials in the response

### Requirement: Stack decisions are recorded
Each stack decision SHALL be recorded in the decision log with what was chosen, why, and what was rejected.

#### Scenario: Decision log complete
- **WHEN** the scaffold is merged
- **THEN** the decision log has an entry for framework, database, hosting, payment, email and admin
