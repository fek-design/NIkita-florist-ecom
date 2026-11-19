## 1. Setup

- [x] 1.1 Start `docs/process/2026-11-19-catalog-data-model.md` with goal, inputs and the option A decision; verify it links this change
- [x] 1.2 Add a test database setup: create `florist_test` in the local Docker Postgres and migrate it before integration tests; verify an empty test passes against it — *19 Nov: recreated and migrated once per run; refuses any database not ending in `_test`*

## 2. Schema and migration

- [x] 2.1 Write the Drizzle schema for occasions, occasion_tiers, occasion_photos, delivery_postcodes, closed_dates and shop_settings with the constraints from design decision 1; verify `npm run typecheck` passes — *19 Nov: plus snake_case column names, set in the Drizzle config and both connections*
- [x] 2.2 Generate the migration and add the rising-price trigger and the single-row check for shop_settings in SQL; verify it applies to a fresh local database and to `florist_test` — *19 Nov: trigger in `0002_tier_price_order.sql`, deferred to commit time; the single-row rule is a plain check in the schema (`shop_settings_single_row`), which needs no hand-written SQL*
- [x] 2.3 Write integration tests for the database rules (one row per tier, price above zero, rising prices refused, a second settings row refused); verify they pass — *19 Nov: 9 tests, also covering raising all prices in one transaction, cascade delete, slug format, weekday range and postcode format*

## 3. Seed

- [x] 3.1 Write `db:seed` with the occasions, tiers, postcodes and settings from design decision 3, all marked as placeholders; verify the row counts after one run — *19 Nov: 5 occasions, 15 tiers, 15 postcodes, 1 settings row, all placeholders (test and local database). Size texts are "Lille/Mellem/Stor buket" and opening hours are empty rather than invented*
- [x] 3.2 Run the seed twice and change one row to non-placeholder before the second run; verify nothing is duplicated and the confirmed row is unchanged — *19 Nov: covered by `seed.test.ts`; also run twice on the local database*

## 4. Read routes

- [x] 4.1 Write the catalogue queries taking the database as an argument; verify with integration tests for visible, hidden, sold-out and incomplete occasions — *19 Nov: 11 tests, plus photo order, closed dates and both postcode cases; "today" is computed in Danish time (`lib/danish-time.ts`, tested across midnight and summer time)*
- [ ] 4.2 Add `GET /occasions` and `GET /occasions/:slug` with response schemas; verify list order, lowest price, photo order, 404 for hidden, incomplete and unknown slugs
- [ ] 4.3 Add `GET /delivery` with a response schema that has no capacity field; verify the response and that closed dates before today are left out
- [ ] 4.4 Add `GET /delivery/postcodes/:postcode`; verify 4300 (in zone, 8000 øre, pickup offered), 8000 (not in zone, pickup offered) and `43a0` (400)

## 5. CI and records

- [ ] 5.1 Add a `postgres:17` service to the CI job and run the integration tests there; verify the CI run is green and a deliberately broken database rule turns it red
- [ ] 5.2 Record the new tables and routes in `docs/decisions.md` (decision entry and dependency check) and the run commands in `CLAUDE.md`; verify the commands work as written
- [ ] 5.3 Finish the process note with the checks and their results; verify it lists every spec scenario

## 6. Staging and merge

- [ ] 6.1 Felix runs the migration and the seed on staging (Neon); verify `GET /occasions` on the staging backend returns the five placeholder occasions
- [ ] 6.2 Run `openspec validate catalog-data-model`, archive the change, and hand over for the pull request into `DevEnv`
