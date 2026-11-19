## Context

See proposal.md for motivation. Process note: [docs/process/2026-11-19-catalog-data-model.md](../../../docs/process/2026-11-19-catalog-data-model.md) (written during implementation).

Current state: `backend/` has Drizzle with an empty schema and one empty migration, the `postgres` driver with prepared statements off (Neon's pooler), and routes built in `src/build-app.ts` with `registerRoutes()`. Tests use `app.inject()` with a fake database ping; nothing touches a real database in tests yet. Money is whole øre (D-007). Staging and production run on Neon in Frankfurt.

Inputs: the owner interview and its follow-up (occasions with tiers around 250/350/500 kr. ±50; flat fee 80 kr.; draft zone of 15 postcodes; placeholder cut-off, weekdays and capacity), Felix's option A for prices (19 Nov), Design-Rationale P2, P3, P6, P10 and P12.

## Goals / Non-Goals

**Goals:**
- A schema that the storefront, the checkout and the admin can all build on without reshaping it.
- Rules the database can enforce itself (three tiers, rising prices, one settings row), so a bug elsewhere cannot store an impossible catalogue.
- Read routes small enough to explain line by line.

**Non-Goals:**
- Orders, order lines and payments (week 3 checkout change).
- Computing which dates can be chosen: that needs the orders table to count capacity, so it comes with checkout.
- Any write route, sign-in or photo upload (admin change).

## Decisions

### 1. Tables

```
occasions                 occasion_tiers                 occasion_photos
---------                 --------------                 ---------------
id (pk)                   occasion_id (fk) -+            id (pk)
slug (unique)             tier (lille|mellem|stor) | pk  occasion_id (fk)
name                      price_oere (int > 0)           url
intro                     size_text                      alt
description               is_placeholder                 role (main|scale|detail)
sort_order                                               sort_order
is_visible
is_sold_out               delivery_postcodes             closed_dates
is_placeholder            ------------------             ------------
created_at, updated_at    postcode (char 4, pk)          date (pk)
                          town                           reason
                          is_placeholder

shop_settings (exactly one row, id = 1)
-------------
delivery_fee_oere, same_day_cutoff (time, Danish time), delivery_weekdays (1-7, ISO),
daily_capacity, pickup_enabled, opening_hours (json), is_placeholder, updated_at
```

- **Tiers as rows, not three price columns.** A tier row keeps price, size text and placeholder mark together, and the checkout can reference `(occasion_id, tier)`. The primary key `(occasion_id, tier)` with `tier` limited to the three values means at most one row per tier.
- **"Exactly three" is checked where it can be:** the database guarantees at most three; the read API treats an occasion with fewer as not ready (spec: "Incomplete occasion is not offered"). A database trigger could also force three, but it would make the admin's "add an occasion" step awkward (the occasion row must exist before its tiers). *Rejected:* a trigger.
- **Rising prices:** a deferred check is not possible across rows in plain SQL constraints, so the price order is enforced by a trigger on `occasion_tiers` that compares a tier with its neighbours. This is the one trigger in the schema, kept because a wrong price order is a real-money mistake.
- **Weekdays as ISO numbers** (1 = Monday) in an integer array, matching JavaScript's date libraries and Danish week order.
- **Opening hours as JSON** (`{"mon": ["10:00","17:30"], ...}`): only shown, never calculated with, so a structured column per day would be weight without use.
- **Placeholder marks** on occasions, tiers, postcodes and settings, not on photos (no photos are seeded).

*Rejected:* shared base prices plus an occasion offset (option B, Felix chose A); a generic key-value settings table (loses types and constraints); categories (occasions replace them, see proposal).

### 2. Read routes

| Route | Returns |
|---|---|
| `GET /occasions` | Visible, complete occasions in sort order: slug, name, intro, lowest price, main photo or null, sold out, placeholder |
| `GET /occasions/:slug` | One visible, complete occasion with description, three tiers and photos (main first); 404 otherwise |
| `GET /delivery` | Fee, cut-off, delivery weekdays, closed dates from today, pickup, opening hours, placeholder |
| `GET /delivery/postcodes/:postcode` | `{ postcode, inZone, town, feeOere, pickupOffered }`: town and fee are null outside the zone; pickup is reported in every answer, because it is a choice of its own (Felix, 19 Nov); 400 if not four digits |

Every route declares its response with a Fastify JSON schema, so extra fields (such as the capacity) can never leak, and the shape is documented in one place. *Rejected:* a schema library such as TypeBox or Zod for four routes (another dependency; plain JSON schema is enough and is what Fastify uses underneath).

Queries live in `src/catalog/queries.ts` as functions that take the database as an argument, so tests can pass a test database.

### 3. Seed

`npm run db:seed -w backend` inserts with `on conflict do nothing`, so running it twice changes nothing and never overwrites what the owner has confirmed. Seeded content:

| Occasion | Lille | Mellem | Stor | From |
|---|---|---|---|---|
| Fødselsdag | 250 | 350 | 500 | interview example (base) |
| Bisættelse | 300 | 400 | 550 | interview example (+50) |
| Bare fordi | 200 | 300 | 450 | interview example (−50) |
| Kærlighed | 250 | 350 | 500 | concept C wireframe, base price (*opinion*) |
| Tak | 250 | 350 | 500 | concept C wireframe, base price (*opinion*) |

Bryllup from the wireframe is left out until the owner answers the open question on large orders. Intro and description text is neutral Danish placeholder copy that makes no claim about the shop (roadmap rule 6), marked as placeholder. Postcodes: the 15 from the interview note. Settings: fee 8000 øre, cut-off 12:00, Monday–Saturday, capacity 15, pickup on, opening hours placeholder.

### 4. Tests against a real Postgres

The catalogue rules (three tiers, rising prices, hidden and incomplete occasions) live partly in the database, so mocks would not test them. Integration tests run against a real Postgres:
- locally: a separate database `florist_test` in the existing Docker container, created by the test setup;
- in CI: a `postgres:17` service container in the GitHub Actions job.

Each test file migrates a clean schema before it runs. The existing unit tests stay as they are. *Rejected:* PGlite, Postgres compiled to WebAssembly (another dependency, and not the same engine version as Neon).

## Risks / Trade-offs

- [Placeholder content reaches a public page unnoticed] → the placeholder mark travels through the API; the storefront change shows it on previews, and launch checks for remaining placeholders.
- [The trigger is the one piece of logic in SQL] → it is short, tested directly, and described in the process note.
- [CI gets slower with a database service] → a few seconds; acceptable for testing real rules.
- [The back-office spec still describes products and categories] → recorded in the proposal; resolved with a MODIFIED delta in the admin change.

## Migration Plan

Additive only: new tables, nothing changed or dropped. After merge, run the migration and the seed on staging (Neon's main branch). Rollback: a down migration is not used by Drizzle; the tables can be dropped by hand, since they hold no customer data yet.

## Open Questions

- Real occasions, prices, texts and photos come from the owner (interview open questions 4 and 7). They replace placeholders through the admin, not through this change.
