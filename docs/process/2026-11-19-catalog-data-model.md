# Catalogue data model

**Started:** 19 Nov 2026 · **Change:** [`catalog-data-model`](../../openspec/changes/catalog-data-model/) · **Branch:** `feature/data-model`
**Related:** [Owner interview](2026-11-16-owner-interview.md) · [Decision log](../decisions.md) · [Design rationale](../../ref/Design-Rationale.md) (P2, P3, P6, P10, P12)

## Goal

Give the storefront (week 2) and the checkout (week 3) one source for occasions, prices and delivery rules: database tables, placeholder seed data and a small read-only API in the backend.

## Inputs

- **Owner interview (16 Nov):** concept C; each occasion is one product in three budget tiers around 250/350/500 kr., about ±50 kr. per occasion; flat delivery fee 80 kr. in Holbæk and surroundings; pickup in the shop.
- **Follow-up (16 Nov):** draft zone of 15 postcodes; placeholder cut-off 12:00, Monday–Saturday, capacity 15; final occasions, free amount and large orders still open.
- **Felix, 19 Nov:**
  - Option A for prices: each occasion stores its own three prices instead of shared base prices plus an adjustment, so the owner edits exactly what customers see.
  - Pickup is a choice of its own, offered alongside delivery, not only when a postcode is outside the zone. The postcode check was changed to report pickup in every answer before any code was written.
- **Conflict noted, not resolved here:** the `back-office` spec (12 Nov) describes products and categories. With occasions as the products, categories disappear; the admin change will update that spec.

## Decisions

See the change's [design.md](../../openspec/changes/catalog-data-model/design.md): tiers as rows with their own price, the database enforcing the rules it can (one row per tier, prices above zero, rising prices, one settings row), JSON response schemas on every route so nothing extra leaks, and tests against a real Postgres.

## Work log (19 Nov)

- **Test database:** integration tests run against a real Postgres. A global setup recreates `florist_test` and migrates it once per run; it refuses any database whose name does not end in `_test`, so a wrong address can never wipe real data.
- **Schema:** six tables (occasions, occasion_tiers, occasion_photos, delivery_postcodes, closed_dates, shop_settings) and two enums (tier, photo_role). Postgres orders enum values as declared, so ordering by tier gives Lille, Mellem, Stor and ordering by photo role gives main first, without extra columns.
- **Price-order trigger:** a constraint trigger, deferred to commit time, so the owner can raise all three prices in one save without a false error halfway through. Tested both ways.
- **Seed:** five occasions with the interview's prices, 15 postcodes and the placeholder settings, all marked as placeholders. Size texts are "Lille/Mellem/Stor buket" and opening hours are empty, rather than invented measurements and times. Running it again inserts nothing and leaves owner-confirmed rows alone.
- **Routes:** four read-only routes with response schemas. Public answers may be cached for 60 seconds by Vercel's edge, which spares the free Neon database; a sold-out toggle therefore shows within about a minute. "Today" is computed in Danish time, because Vercel runs on UTC.

## Dead ends and slips

1. **Deleting the merged hosting branch failed:** git compares with the branch you stand on, and `feature/data-model` did not contain DevEnv yet. Order fixed: merge first, then delete.
2. **Column names:** without Drizzle's `casing: "snake_case"`, columns would have been named like the code (`sortOrder`). Set in the config and both connections before the first migration.
3. **A hidden formatting failure:** piping the format check through `tail` swallowed its error, so a commit went in with unformatted generated files. Drizzle's `meta/` folder is now excluded from Prettier (machine-written), and commands run with `pipefail`.
4. **A commit that was not mine:** a commit with my message appeared before my command reached it, containing the test files unformatted. Probably made from the editor. Its content was right; formatting was fixed in a follow-up commit rather than rewriting history.

5. **Error details leaked to visitors (found on the preview, fixed).** The branch preview answered 500 with Drizzle's message, which contains the full SQL query. A server error handler now answers every 5xx with `{"error":"internal error"}` and logs the full error, including Postgres's own reason, which Drizzle's message left out. Validation errors (400) keep their message. Tested with a forced database error and live against a database that does not exist.
6. **The preview's database had no tables.** Neon's integration gives preview builds their own database copy; this branch's copy was made before the migration ran on the main database. Staging, which uses the main database, is healthy. How previews get migrated is an open question for Felix.
7. **CI with Postgres:** green on the first run with the service container (`Initialize containers` to `Stop containers`).

## How it was checked

| Spec scenario | Check | Result |
|---|---|---|
| Occasion with its tiers | route test `/occasions/bare-fordi`; live run | Three tiers, Lille to Stor |
| Incomplete occasion is not offered | query and route tests with a tier deleted | Not listed, 404 |
| Prices rise with size | rule test; red when the trigger is disabled | Refused; test fails without trigger |
| Hidden occasion | query and route tests | Not listed, 404 |
| Sold out | query test | Listed with `soldOut: true` |
| Unknown address | route test; live run | 404 `{"error":"not found"}` |
| Occasion without photos | query test | Empty photo list |
| Rules for the storefront | route test, including that "capacity" never appears in the body | Pass |
| Inside the zone | route test 4300; live 4550 | In zone, 8000 øre, pickup offered |
| Outside the zone | route test 8000; live 2100 | Not in zone, pickup offered |
| Not a postcode | route test `43a0`; live `abc` | 400 naming `params/postcode` |
| Seeded data | seed test | All rows marked as placeholders |
| Seeding twice | seed test; local database seeded twice | No duplicates; confirmed price kept |

Totals: 53 backend tests (36 new), 4 frontend tests. Lint, types, format and build pass.
