# Tasks

## 1. Kit additions

- [x] 1.1 Add the missing patterns to `Ref/wireframes/lofi/wf.css` (toggle, dense list row, stat tile, bottom tab bar), greyscale and in the kit's existing style. Verify that A, B and C still render unchanged, using headless-Chrome screenshots before and after.

## 2. Back-office page

- [x] 2.1 Create `Ref/wireframes/lofi/d-back-office.html` with the page head (purpose, tags P1/P4/P9/P2, "works for both product models") and screens 1-3: Log ind with a second factor, Ordrer i dag sorted by delivery date, and Ordre detail with status in one tap and Print seddel. Verify that each spec scenario for sign-in and orders can be pointed to in a frame or its note.
- [x] 2.2 Add screens 4-5: the product list with sold-out and hidden toggles, and Ret produkt (photo, name, price, category with inline "ny kategori", sizes, optional tilbudspris marked as a question). Verify against the "Quick product upkeep" and "Categories managed in place" scenarios.
- [x] 2.3 Add screens 6-7: Buketter & kapacitet (budget tiers, free amount and its minimum, orders per day, cut-off, closed days calendar), and Salg (today/week/month stat tiles against the previous period, top sellers). Annotate what drops out in a budget-only or catalogue-only model. Verify against the "Budget tiers" and "Sales overview" scenarios.
- [x] 2.4 Annotate every frame with the principle it rests on and its time cost for her ("1 tryk", "< 1 min"). Verify that no frame lacks a note.

## 3. Wire into the set

- [x] 3.1 Add the "D · Back office" tab to the nav in `index.html`, `a-dato-forst.html`, `b-butiksvinduet.html`, `c-anledninger.html` and the new page. Verify that clicking through all five pages reaches every page and that `aria-current` marks the right tab.
- [x] 3.2 Add a back-office section to `index.html`: a card for D, the pitch line ("hjemmesiden tager telefonen for dig"), and the owner questions (budget tiers or catalogue, sale price, who else uses the admin, notification channel). Verify that it renders at 390 px and at desktop width.

## 4. Check and log

- [x] 4.1 Render `d-back-office.html` with headless Chrome at desktop width and at 390 px. Verify that all 7 frames lay out at 390 px, the notes sit under the frames, and nothing overflows horizontally.
- [x] 4.2 Write `docs/process/2026-11-12-back-office-wireframes.md` (goal, inputs, options incl. rejected ones, decisions citing principles or labelled *opinion*, how it was checked, open questions). Link it from this change's design.md, and add a link from `2026-11-11-lofi-wireframes.md`. Verify that both links resolve.

## Workflow follow-up

- Felix and the owner review the set, including D, in the owner interview.
- Archive the change after review. The `back-office` spec then becomes the baseline for the admin build in weeks 2 and 4.
