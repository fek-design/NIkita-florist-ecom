# Design decisions

Every key design choice on a screen: what was chosen, why, the principle or evidence behind it, what was rejected, and how it is tested. Format from [Design-Rationale section 5](../ref/Design-Rationale.md). Numbered **DD-01** and up (stack decisions use D-, brand decisions B1–B12).

The choices are Felix's: Claude builds 2–3 variants at phone size with reasoning, Felix picks and says why (CLAUDE.md, "Design decisions are Felix's"). Variant boards live in `ref/design/`; images of chosen and rejected variants and annotated screenshots live in `docs/design/`.

Evidence grades as in the design rationale: **A** primary source, **B** reputable secondary, **C** practitioner advice or our own inference (a hypothesis to test).

---

## To confirm

Choices Claude made alone before this rule existed. Each goes to Felix with the screen it belongs to.

| Choice | Where it was made | Goes to Felix with |
|---|---|---|
| ~~Navbar 72 px high, half-moon logo 110 px wide~~ | Brand board, 17 Nov | Settled by DD-09 |
| Tier picker as three equal buttons, chosen one filled Ink | Brand board, 17 Nov | Occasion page board |
| ~~Cards as Paper with a 1 px Sand border~~ | Brand guide, 17 Nov | Settled by Felix's design: occasion cards are photo, name and price with no border |

---

## Decisions

### DD-01 Felix designs the screens in Figma
Date: 2026-11-21 · Principles: P11 · Evidence grade: C (*opinion*: authorship in a design education)
Decision: Felix makes the hi-fi screens himself in Figma (first: the front page, `ref/mockups/iPhone 18 Pro - HiFi.pdf`). Claude builds them exactly and may change only font sizes and the spacing around elements and text, plus what Felix explicitly hands over (DD-02, DD-06 to DD-08).
Rejected: Claude's variant board for the front page (`ref/design/storefront/front-page.html`, 19 Nov), kept as a record of the alternatives considered; Claude designing and Felix reviewing.
Test: Felix can argue every element of each screen at the exam.

### DD-02 Paper as the page background, not white
Date: 2026-11-21 · Principles: P11 · Evidence grade: C
Decision: The mockup's white background becomes Paper `#F7F4EF`, the brand ground. Felix's permission, 21 Nov.
Rejected: white (not in the palette; breaks the 60/30/10 split built on Paper).
Test: the brand board and the built page side by side use the same ground.

### DD-03 "Bisættelse", not "Begravelse"
Date: 2026-11-21 · Principles: P10 · Evidence grade: C
Decision: The occasion keeps the catalogue's name, Bisættelse; the mockup's "Begravelse" was a placeholder word.
Test: names in the built pages match the catalogue.

### DD-04 A featured bouquet at the top of the front page
Date: 2026-11-21 · Principles: P6, P11 · Evidence grade: C
Decision: The front page opens with one featured bouquet ("Jul og advent", "Månedens buket", button "Se fra … kr."): the seasonal bouquet when there is a season, otherwise the most popular. Prices come from the catalogue; the mockup's prices are dummy text.
Rejected: occasions straight away and facts first (variants A1 and A2 on the 19 Nov board).
Note: the catalogue has no "featured" or seasonal bouquet yet. This needs a small data change (see the storefront plan).
Test: usability task: "Find this month's bouquet and its price."

### DD-05 Photo direction per place
Date: 2026-11-21 · Principles: P6, P8 · Evidence grade: C
Decision:
- **Occasion photos:** the bouquet only, possibly held in a hand; no people.
- **Front page hero:** a person working with the flowers, face not shown.
- **"Besøg Nikita":** Nikita herself, preferably in front of her shop.
The photos in the mockup only show the feel and what each photo should contain; none of them is used.
Rejected: people in occasion photos (draws the eye from the bouquet, P6).
Test: usability question: "How big do you expect this bouquet to be?" (P6), and "Would you trust this shop?" (P8, the owner's own photo).

### DD-06 Logo lines scale with the logo
Date: 2026-11-21 · Principles: P11 · Evidence grade: C
Decision: The logo's thin lines (circle, divider) keep the same proportion at every size. In Figma: resize with the Scale tool (K). On the web: a version with the lines converted to filled shapes, so they cannot stay thick when the logo shrinks. Felix's gripe, 21 Nov.
Test: the logo at 110 px and at full size, side by side, with the same line-to-logo ratio.

### DD-07 Icons in Phosphor Light
Date: 2026-11-21, chosen 2026-11-23 · Principles: P11 · Evidence grade: C (measured)
Decision: Phosphor icons in the Light weight (lines about 1.1 px at 24 px), closest to the hairlines and letter strokes of the logo. Felix's choice from the weight comparison (`docs/design/storefront/icon-weights.png`).
Rejected: Regular (about 1.5 px, too heavy next to the logo, Felix); Thin (about 0.75 px, matches the logo circle but turns faint at 24 px on a phone).
Test: icons and logo side by side at the navbar size; icons recognisable in the usability test.

### DD-09 Navbar logo at the brand minimum
Date: 2026-11-21 · Principles: P9 · Evidence grade: C (measured)
Decision: The half-moon logo in the navbar is 110 px wide, the brand guide's minimum, and the navbar grows to fit it. Felix's permission.
Rejected: 58 px wide as in the mockup (the name's capitals are about 5 px tall: unreadable; `docs/design/storefront/icon-weights.png`).
Test: the name is readable at arm's length on a phone in the usability test.

### DD-10 Text in Ink, not black
Date: 2026-11-21 · Principles: P11 · Evidence grade: C
Decision: All text uses Ink `#2D2A26` instead of the mockup's `#000000`. Felix's permission.
Test: the contrast table (`ref/brand/contrast.md`): Ink on Paper 13.0:1.

### DD-11 Corner radius 4 px
Date: 2026-11-21 · Principles: P11 · Evidence grade: C
Decision: Buttons and photos use the brand guide's 4 px radius instead of the mockup's 8 px. Felix's call.

### DD-12 Linen instead of wireframe greys; photos load without jumps
Date: 2026-11-21 · Principles: P7, P11 · Evidence grade: A for the threshold (Google, CLS ≤ 0.1), C for the rest
Decision: Photo placeholders and dividers use Linen instead of `#E6E6E6` / `#DFDFDF`, which came from the lo-fi wireframe kit. Every photo reserves its size and shows Linen while loading; photos below the first screen load as the visitor scrolls, the hero first. Felix: "we should have something in place for the images' lazy loading".
Test: Lighthouse layout shift (CLS) on the front page under 0.1.

### DD-13 Top four occasions on the front page, all on the category page
Date: 2026-11-21 · Principles: P1, P2 · Evidence grade: C
Decision: The front page shows the four best-selling occasions; "Se alle" opens the category page (`/anledninger`) with every occasion. Until orders exist, the owner's sort order stands in for "best-selling". Felix's call.
Rejected: all occasions on the front page (with five, the two-column grid leaves an empty cell and the front page grows with every new occasion).
Test: usability task: "Find flowers for a thank-you" (Tak is not in the top four, so it tests "Se alle").

### DD-14 Delivery facts on the occasion page only
Date: 2026-11-23 · Principles: P3 · Evidence grade: C
Decision: The delivery facts (fee, area, cut-off, pickup) are not added to the front page. They sit on the occasion page with the delivery choice, and the fee appears as soon as a postcode is entered, before anything goes in the cart. Felix's choice (option c). Why: *to be added by Felix*.
Rejected: a short delivery block on the front page under the featured bouquet (a); the facts in the footer (b).
Risk, stated honestly: P3 asks for the fee before the visitor chooses. Here a visitor meets it after choosing an occasion but before the cart, so it is never a surprise at checkout.
Test: usability task "Hvad koster levering til 4300?": time to answer and where people look first. If most look on the front page first, revisit a) or b).

### DD-08 Footer
Date: 2026-11-21 · Status: open, variants to Felix
Decision: Felix found no elegant footer layout; Claude builds 2–3 variants in Figma keeping his content (logo, Kontakt, email, phone, Facebook, address). Felix chooses.
