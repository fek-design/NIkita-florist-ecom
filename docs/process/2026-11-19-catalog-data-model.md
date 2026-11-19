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

## Work log

*(filled in as tasks are done)*
