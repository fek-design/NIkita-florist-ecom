## Purpose

Defines how the webshop is split, built, checked, deployed and backed up, so that every change is verified automatically and customer data stays in a backend that only it can reach, on a server in the EU.

## ADDED Requirements

### Requirement: The backend alone owns the data
The webshop SHALL consist of a frontend and a separate backend service. Only the backend SHALL connect to the database. The frontend SHALL read and change data only through the backend's HTTP API. The database MUST NOT be reachable from the internet.

#### Scenario: Frontend has no database access
- **WHEN** the frontend's configuration and code are inspected
- **THEN** they contain no database connection string and no database client

#### Scenario: Database closed to the internet
- **WHEN** a connection to the database port is attempted from outside the server
- **THEN** the connection is refused

### Requirement: Checks gate every merge
Every pull request into `DevEnv` or `main` SHALL run lint, format check, type check, unit tests and a production build for both the frontend and the backend. A pull request with a failing check MUST NOT be mergeable.

#### Scenario: Failing test blocks the merge
- **WHEN** a pull request contains a failing unit test in either app
- **THEN** the check run is reported as failed and the merge is blocked

#### Scenario: Passing checks allow the merge
- **WHEN** all checks pass on a pull request
- **THEN** the pull request is shown as ready to merge

### Requirement: Staging and production deploy automatically
A merge into `DevEnv` SHALL deploy to a staging address, and a merge into `main` to the production address, without manual steps. Both SHALL be served over HTTPS.

#### Scenario: Merge into DevEnv
- **WHEN** a pull request is merged into `DevEnv`
- **THEN** the staging address shows the merged result within a few minutes

#### Scenario: Failed deploy keeps the old version
- **WHEN** a deploy fails to build or start
- **THEN** the previously running version keeps serving and the failure is reported in the deploy run

### Requirement: Everything runs in the EU
The server running the frontend, the backend and the database, and the backup storage, SHALL be located in the EU.

#### Scenario: Location recorded
- **WHEN** the server and the backup storage are created
- **THEN** their locations are EU data centres and are recorded with a date in the decision log

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

### Requirement: Backups can be restored
The production database SHALL be backed up at least daily to storage outside the server, and a restore SHALL have been tested.

#### Scenario: Nightly backup
- **WHEN** a day has passed
- **THEN** a new backup exists in the off-server storage

#### Scenario: Restore tested
- **WHEN** a backup is restored into an empty database
- **THEN** the restored database passes the backend health check and contains the backed-up data

### Requirement: Stack decisions are recorded
Each stack decision SHALL be recorded in the decision log with what was chosen, why, and what was rejected.

#### Scenario: Decision log complete
- **WHEN** the change is merged
- **THEN** the decision log has an entry for frontend, backend, database, hosting, payment, email and admin
