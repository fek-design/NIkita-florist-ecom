# Design

Process note: [docs/process/2026-11-12-back-office-wireframes.md](../../../docs/process/2026-11-12-back-office-wireframes.md).

## Context

- The lo-fi set in `Ref/wireframes/lofi/` has an overview page and three storefront directions (A, B, C). They share `wf.css` (phone frame, controls, annotation notes) and a nav bar that is copied into each page. See [2026-11-11-lofi-wireframes.md](../../../docs/process/2026-11-11-lofi-wireframes.md).
- The roadmap plans a custom minimal admin inside the same app: products, images, sold out, orders sorted by delivery date, an order slip, capacity per date, and strong admin auth. Discount codes are out of scope.
- Felix's finding (11 Nov): her main sale is a phone call with an occasion and a budget, and she designs the bouquet. It isn't settled yet whether the storefront is a budget flow, a catalogue or a mix. Requirements: see `specs/back-office/spec.md`.

## Goals / Non-Goals

**Goals:**
- One page, **D · Back office**, that a reviewer reads like A-C: phone frames left to right in the order of her day, with an annotation under each one.
- It works for both storefront models, so the owner review doesn't have to wait for that choice.
- Everything that is a guess is visible as a guess.

**Non-Goals:**
- A desktop layout. Admin can widen later. Phone first, because that's where she is (P1).
- Visual style. It stays greyscale, the same as A-C.
- In-store POS, bookkeeping, customer accounts, discount codes.

## Decisions

**1. A separate page in the same set, not a frame added to A, B or C.**
The back office is the same whichever storefront direction wins. A shared page avoids drawing it three times, and the nav makes it the fourth tab.
*Rejected:* a separate wireframe folder. The owner review should show one set.

**2. Screens follow her day, not the data model.**

```
  1 Log ind --> 2 Ordrer i dag --> 3 Ordre --> 4 Produkter --> 5 Ret produkt
                                                   |
                         6 Buketter & kapacitet <--+--> 7 Salg
```

Orders come first, because that is what she checks every morning. Product upkeep is second. Settings and sales are occasional.
Basis: P1 (mobile, thumb reach). Order by delivery date: roadmap week 4.

**3. Both product models on one screen set.**
The product list holds fixed bouquets. Screen 6 holds the budget tiers ("Buket efter budget: 300 / 450 / 600 / eget beløb"), the daily capacity, the cut-off and the closed days. If the storefront becomes budget-only, screens 4-5 shrink to a few inspiration photos. That is annotated on the page.
*Rejected:* waiting for the storefront decision. The admin's size is itself an argument in that decision, because a budget model means less upkeep for her.

**4. "Salg" is drawn as an overview, and sale prices are an open note.**
Screen 7 shows orders and revenue for today, the week and the month, plus the top sellers. A "tilbudspris" field is sketched as optional on screen 5, with a note asking whether she wants it. Discount codes stay out of scope.
*Opinion:* the overview is cheap once orders exist, and it shows her the shop works.

**5. Reuse the kit, and add to `wf.css` only what's missing.**
Expected additions: an on/off toggle, a dense list row, a stat tile and a bottom tab bar. Each one is a few lines in the same greyscale style.

**6. Bottom tab bar for admin navigation (Ordrer · Produkter · Butik · Salg).**
Thumb reach on a phone (P1). The storefront uses a top bar. The admin is used daily with the same 4 places, so a tab bar is faster.
*Rejected:* a hamburger menu. It hides the 4 places she uses every day behind an extra tap.

**7. Sign-in sketched with a second factor.**
The roadmap requires strong admin auth (OWASP review, week 5). A passkey or code step appears on screen 1, so the owner knows it is coming.

## Risks / Trade-offs

- [The owner sees the admin as work, the opposite of the pitch] → each frame's annotation states the time cost ("1 tryk", "< 1 min"). The overview page frames it as "the website takes the phone call for you".
- [Drawing both models makes the page look bigger than the real admin] → screen 6's annotation says what drops out in each model.
- [The real data model differs from the sketch] → it's lo-fi. Field lists come from the roadmap and get confirmed in the owner interview before the build.

## Open Questions

- Does she want a sale price per product (screen 5)?
- Who else uses the admin (staff, a courier)? This doesn't change the screens now. Roles can come later.
- Order notifications: email only, or also SMS or push? The roadmap has email. This affects the build, not the wireframes.
