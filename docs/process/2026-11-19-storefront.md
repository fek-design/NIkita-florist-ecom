# Storefront

**Started:** 19 Nov 2026 · **Change:** [`storefront`](../../openspec/changes/storefront/) · **Branch:** `feature/storefront`
**Related:** [Design decisions](../design-decisions.md) · [Design rationale](../../ref/Design-Rationale.md) · [Brand guide](../../ref/brand/brand-guide.md) · [Wireframe C](../../ref/wireframes/lofi/c-anledninger.html) · [Owner interview](2026-11-16-owner-interview.md)

## Goal

A shop a visitor can use on a phone: see the occasions, choose a bouquet, a size and a day, and fill a cart that survives a reload. Week 2 exit criterion.

## Inputs

- Wireframe C (occasions first), chosen by the owner.
- The catalogue API and delivery rules (`openspec/specs/catalog`), with placeholder data.
- The approved brand: tokens, Ancizar Serif and Inter, half-moon and full logo.
- Design-Rationale P1 (phone first), P2 (date first), P3 (no surprise costs), P6 (photos are the product), P8 (local trust), P9 (accessible), P10 (findable).
- Defaults confirmed by Felix on 19 Nov: one delivery per order; date and card message chosen on the occasion page.

## How the design is made

Felix's education is design-oriented, so every key layout choice is his (CLAUDE.md, "Design decisions are Felix's"). For each screen Claude builds 2–3 variants on a board at phone size with the real brand and data, with reasoning, evidence and risk per variant; Felix chooses and argues the choice; it is logged in [design-decisions.md](../design-decisions.md); the finished screen gets an annotated screenshot and the rejected variants are kept as images in `docs/design/storefront/`.

## Work log

- **Front page board (19 Nov).** Three choices, eight frames, real brand and seeded data at 390 px: A, what comes first (occasions, facts, large photo); B, card style (wide row, two-column grid, large photo); C, where delivery facts sit (strip, block after the occasions).
  - *Slip, caught before showing Felix:* the first texts guessed how many occasions were visible ("about two", "four") and drew the screen edge at 844 px, the full phone height. In Safari or Instagram, the toolbars leave roughly 660 px visible (approximate, grade C). The line was moved and every count rewritten from measurements of the frames. One variant (C2) had also shown only three occasions, which made its fact block look visible; with all five it starts at 844 px, below the visible area.
