# Design decisions

Every key design choice on a screen: what was chosen, why, the principle or evidence behind it, what was rejected, and how it is tested. Format from [Design-Rationale section 5](../ref/Design-Rationale.md). Numbered **DD-01** and up (stack decisions use D-, brand decisions B1–B12).

The choices are Felix's: Claude builds 2–3 variants at phone size with reasoning, Felix picks and says why (CLAUDE.md, "Design decisions are Felix's"). Variant boards live in `ref/design/`; images of chosen and rejected variants and annotated screenshots live in `docs/design/`.

Evidence grades as in the design rationale: **A** primary source, **B** reputable secondary, **C** practitioner advice or our own inference (a hypothesis to test).

---

## To confirm

Choices Claude made alone before this rule existed. Each goes to Felix with the screen it belongs to.

| Choice | Where it was made | Goes to Felix with |
|---|---|---|
| Navbar 72 px high, half-moon logo 110 px wide (below that the name is hard to read) | Brand board, 17 Nov | Felix's Figma front page (navbar measured there) |
| Tier picker as three equal buttons, chosen one filled Ink | Brand board, 17 Nov | Occasion page board |
| Cards as Paper with a 1 px Sand border (Linen on Paper is only 1.33:1) | Brand guide, 17 Nov | Felix's Figma front page: his occasion cards have no border, photo only |

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

### DD-07 Icons as thin as the logo
Date: 2026-11-21 · Principles: P11 · Evidence grade: C
Decision: Phosphor icons in a lighter weight (Light or Thin) so their lines match the logo's hairlines. The exact weight is chosen by comparing against the logo in Figma.
Rejected: Phosphor Regular (too heavy next to the logo, Felix).
Test: icons and logo side by side at the navbar size.

### DD-08 Footer
Date: 2026-11-21 · Status: open, variants to Felix
Decision: Felix found no elegant footer layout; Claude builds 2–3 variants in Figma keeping his content (logo, Kontakt, email, phone, Facebook, address). Felix chooses.
