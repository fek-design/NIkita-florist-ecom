## Purpose

Defines how the webshop is split, built, checked and deployed, so that every change is verified automatically, customer data sits behind a backend that alone can reach it, and that data is stored and processed in EU regions.

## ADDED Requirements

### Requirement: The backend alone owns the data
The webshop SHALL consist of a frontend and a separate backend service. Only the backend SHALL hold database credentials and connect to the database. The frontend SHALL read and change data only through the backend's HTTP API. Database connections MUST use TLS.

#### Scenario: Frontend has no database access
- **WHEN** the frontend's configuration, environment variables and code are inspected
- **THEN** they contain no database connection string and no database client

#### Scenario: Unencrypted connection refused
- **WHEN** a client tries to connect to the hosted database without TLS
- **THEN** the connection is refused

### Requirement: Checks gate every merge
Every pull request into `DevEnv` or `main` SHALL run lint, format check, type check, unit tests, a production build and a dependency audit for both the frontend and the backend. A pull request with a failing check MUST NOT be mergeable.

#### Scenario: Failing test blocks the merge
- **WHEN** a pull request contains a failing unit test in either app
- **THEN** the check run is reported as failed and the merge is blocked

#### Scenario: Vulnerable dependency blocks the merge
- **WHEN** a production dependency has a known high or critical vulnerability
- **THEN** the check run is reported as failed

#### Scenario: Passing checks allow the merge
- **WHEN** all checks pass on a pull request
- **THEN** the pull request is shown as ready to merge

### Requirement: Every branch deploys automatically
Every pushed branch SHALL get its own preview address for both apps. A merge into `DevEnv` SHALL deploy to staging, and a merge into `main` to production. All addresses SHALL use HTTPS, and a preview frontend SHALL talk to a backend of the same branch or of staging, never production.

#### Scenario: Feature branch pushed
- **WHEN** a commit is pushed to a feature branch
- **THEN** preview addresses for the frontend and the backend are available within a few minutes without manual steps

#### Scenario: Merge into DevEnv
- **WHEN** a pull request is merged into `DevEnv`
- **THEN** the staging address shows the merged result

### Requirement: Data is stored and processed in the EU
The database SHALL be hosted in an EU region, and the server functions that handle personal data SHALL run in an EU region. Providers outside the EU SHALL be recorded as third-country transfers in the decision log.

#### Scenario: Regions recorded
- **WHEN** the hosting and database projects are created
- **THEN** their regions are EU regions and are recorded with a date in the decision log

### Requirement: Secrets stay out of the repository
Secrets SHALL be supplied through environment configuration only. Each app SHALL have a checked-in example environment file listing every required variable without real values. Each app MUST stop at start-up with a message naming any missing required variable.

#### Scenario: Missing variable
- **WHEN** either app starts without a required environment variable
- **THEN** it exits and names the missing variable

#### Scenario: No secret committed
- **WHEN** the repository history is scanned for secrets
- **THEN** no key, token or password is found

### Requirement: The backend proves its database connection
The backend SHALL expose a health check that reports whether it can reach the database, without revealing connection details.

#### Scenario: Database reachable
- **WHEN** the health check is requested on a running environment
- **THEN** it reports success

#### Scenario: Database unreachable
- **WHEN** the database cannot be reached
- **THEN** the health check reports failure with an error status and no connection string or credentials in the response

### Requirement: Stack decisions are recorded
Each stack decision SHALL be recorded in the decision log with what was chosen, why, and what was rejected.

#### Scenario: Decision log complete
- **WHEN** the change is merged
- **THEN** the decision log has an entry for frontend, backend, database, hosting, scheduling, backups, payment, email and admin
