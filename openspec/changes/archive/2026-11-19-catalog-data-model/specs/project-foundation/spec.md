## MODIFIED Requirements

### Requirement: Every branch deploys automatically
Every pushed branch SHALL get its own preview address for both apps. A merge into `DevEnv` SHALL deploy to staging, and a merge into `main` to production. All addresses SHALL use HTTPS, and a preview frontend SHALL talk to a backend of the same branch or of staging, never production. Every backend deployment SHALL bring its own database up to date with the code's migrations before it serves requests. Preview and staging deployments SHALL also add the placeholder catalogue; production SHALL never be seeded.

#### Scenario: Feature branch pushed
- **WHEN** a commit is pushed to a feature branch
- **THEN** preview addresses for the frontend and the backend are available within a few minutes without manual steps

#### Scenario: Merge into DevEnv
- **WHEN** a pull request is merged into `DevEnv`
- **THEN** the staging address shows the merged result

#### Scenario: Preview with a new table
- **WHEN** a branch adding a migration is pushed
- **THEN** its backend preview answers from a database that has the new tables and the placeholder catalogue, with no manual step

#### Scenario: Production is not seeded
- **WHEN** the backend deploys to production
- **THEN** migrations are applied and no placeholder data is added
