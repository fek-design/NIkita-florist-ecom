## Why

The week 2 storefront and the week 3 checkout both need real data behind them: which occasions exist, what each tier costs, where the shop delivers and on which days. Today the database is empty and the backend has only `/health`. The owner interview (16 Nov) fixed the shape: concept C, where each occasion is one product sold in three budget tiers ([interview notes](../../../../docs/process/2026-11-16-owner-interview.md)).

## What Changes

- **Database tables** (Drizzle, in `backend/`):
  - Occasions: name, address slug, short intro, longer description, sort order, visible and sold-out flags.
  - Tiers: exactly three per occasion (Lille, Mellem, Stor), each with **its own price** in whole øre and a size in words. Felix chose this on 19 Nov over shared base prices plus an adjustment, so the owner edits exactly the prices customers see.
  - Photos per occasion, as addresses with alt text and a role (main, scale, detail). Upload and storage come with the admin change.
  - Shop settings: delivery fee, same-day cut-off time, delivery weekdays, daily capacity, pickup on or off, opening hours.
  - Delivery postcodes, and specific closed dates.
- **Seed data:** the interview's example occasions and prices, the 15 draft postcodes and the placeholder settings, every row marked as a placeholder until the owner confirms it. No photos are seeded: only the owner's own photos are used.
- **Read-only API for the storefront:** list the visible occasions, one occasion by its address, the public delivery rules, and a postcode check that answers "we deliver here, for this fee" or "pickup only".
- **Integration tests against a real Postgres**, locally through Docker and in CI through a database service.

Out of scope: orders and checkout (week 3), the date picker and its availability rules (storefront and checkout changes), everything the owner writes (admin change), sign-in, and photo upload.

## Capabilities

### New Capabilities
- `catalog`: the occasions, their three priced tiers and photos, the delivery rules and zone, and the read API the storefront uses to show them.

### Modified Capabilities

- `project-foundation`: every backend deploy now migrates its own database, and preview and staging deploys add the placeholder catalogue (added 19 Nov, Felix chose option A after the branch preview had no tables).

Also noted: A conflict is recorded for later: the `back-office` spec (written 12 Nov, before the interview) describes separate products with any number of sizes, and categories managed by the owner. With occasions as the products, categories disappear and every occasion has exactly three tiers. The admin change will update `back-office` with a MODIFIED delta; this change does not touch `back-office`.

## Impact

- `backend/src/db/schema.ts` gets its first tables, and `backend/drizzle/` its second migration.
- New backend routes under `/occasions` and `/delivery`. No change to the frontend in this change.
- New backend script `db:seed`. Running it twice leaves the same data.
- CI gains a Postgres service so the integration tests run there too.
- Staging and production databases need the migration and the seed once the change is merged.
- Branch: `feature/data-model`.
