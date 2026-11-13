# Proposal

## Why

The owner says she is too busy to run a webshop. Today she takes orders by phone: the customer gives an occasion and a budget, and she designs the bouquet. If keeping the shop up to date costs her more time than the phone does, she won't use it. The back office is the part she touches every day, so it has to be quick to use on her phone between two bouquets. It needs to be sketched next to the storefront before the owner review, so she sees both halves of what she is agreeing to.

The roadmap already plans a "custom minimal admin" (products, images, sold out, orders). This change sketches it first, at lo-fi, and tests the idea that the admin should relieve her, not add a chore.

## What Changes

- Add a fourth page to the lo-fi wireframe set in `Ref/wireframes/lofi/`: **D · Back office**. It uses the same kit (`wf.css`), phone frames at 390 px and annotations that cite the principles.
- Sketch the back-office screens on a phone:
  - login;
  - today's orders;
  - order detail with slip and status;
  - product list with quick toggles;
  - add or edit a product (photo, price, category, sizes);
  - budget bouquets and capacity (price tiers, orders per day, cut-off, closed days);
  - sales overview.
- Add the back-office tab to the navigation of all four pages. Add a section to the overview page that names what the owner must answer about the back office.
- Write a process note: `docs/process/2026-11-12-back-office-wireframes.md`.
- No app code. A true in-store POS (card terminal, till receipts) is **not** part of this change.

## Capabilities

### New Capabilities

- `back-office`: what the florist can do in the shop's admin, and how fast. Covers sign-in, the order list by delivery date, order handling, product upkeep from a phone, budget tiers and daily capacity, and a sales overview. The wireframes are the first expression of it. The build in roadmap weeks 2 and 4 implements it.

### Modified Capabilities

None. No specs exist yet.

## Impact

- `Ref/wireframes/lofi/`: a new `d-back-office.html`. The nav changes in `index.html`, `a-dato-forst.html`, `b-butiksvinduet.html` and `c-anledninger.html`, and `index.html` gains a back-office section. Small additions to `wf.css` only if a pattern is missing (toggle, list row, stat tile).
- `docs/process/`: a new note. The storefront note `2026-11-11-lofi-wireframes.md` gets a link to it.
- Roadmap: no change in scope yet. Two items for the owner interview are flagged: the budget-tier model, and what "sales" means to her.
- No dependency on `establish-brand-identity`, because lo-fi stays greyscale.
