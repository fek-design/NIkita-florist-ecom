## 1. Setup

- [x] 1.1 Start `docs/process/2026-11-19-storefront.md` with goal, inputs and the defaults to confirm; verify it links this change — *19 Nov: defaults recorded as confirmed*
- [ ] 1.2 Bring the brand into `frontend/`: copy `tokens.css`, the font files (via `next/font/local`), the web logo PNGs and the favicons; add the token drift test; verify the drift test fails when one token differs and passes when they match

## D. Design rounds (Felix chooses)

- [x] D.1 Create `docs/design-decisions.md` (format of Design-Rationale section 5) and `docs/design/storefront/`; verify the format matches the rationale's example — *19 Nov: numbered DD-01 and up; three earlier choices listed under "To confirm"*
- [x] D.2 Build the front page variant board in `ref/design/storefront/` (what comes first, cards one or two columns, place of the delivery facts) with reasoning and evidence per variant; verify each variant renders at 390 px with real tokens, fonts and seeded data — *19 Nov: 8 frames in three choices (A first screen, B cards, C delivery facts); every count in the texts measured from the frames against a ~660 px visible area; image in `docs/design/storefront/front-page-variants.png`*
- [ ] D.3 Build the occasion page variant board (order of photo, tiers and delivery; day buttons or calendar; delivery/pickup as two choices or a switch); verify as D.2
- [ ] D.4 Build the cart variant board (delivery summary above or below; total bar fixed or at the end); verify as D.2
- [ ] D.5 Felix chooses for each board and states why; verify each choice is logged in `docs/design-decisions.md` with the rejected variants saved as images

## 2. Backend: available dates

- [ ] 2.1 Write the available-dates function (Danish time, weekdays, closed dates, cut-off, 60 days) with unit tests on a fixed clock; verify the four spec scenarios
- [ ] 2.2 Add `GET /delivery/dates` with a response schema and a route test; verify the response holds only dates and no capacity

## 3. Layout and front page

- [ ] 3.1 Build the layout: navbar with the half-moon logo and the cart count, Sand footer with the full logo, base styles from the tokens, Danish not-found page; verify at 390 px with no horizontal scroll
- [ ] 3.2 Build the front page from `GET /occasions` and `GET /delivery`: occasion cards with "Fra … kr.", "Udsolgt" in words, placeholder labels, delivery facts and a short FAQ; verify against the seeded catalogue

## 4. Occasion page

- [ ] 4.1 Build `/anledning/<slug>`: photo area with "Foto kommer", intro and description, tier picker with prices and sizes; verify 404 for an unknown slug and that the chosen tier is marked without relying on colour
- [ ] 4.2 Build "Hvornår og hvor?": delivery or pickup, postcode check through `/api`, date buttons from `/api/delivery/dates`, card message with a 200-character counter; verify 4300, 8000 and that only offered dates can be chosen
- [ ] 4.3 Add to cart, including the confirm step when the order's delivery would change; verify the button is disabled until tier, delivery and date are chosen

## 5. Cart

- [ ] 5.1 Write the cart store (versioned `localStorage`, `useSyncExternalStore`, fallback when storage fails) and `formatKroner` with unit tests; verify add, quantity, remove, one delivery and the storage fallback
- [ ] 5.2 Build `/kurv`: lines, quantity 1–10, remove, delivery summary with change link, fee, total incl. moms, price refresh with a note, unavailable bouquets left out, checkout shown as coming; verify the totals scenario (350 + 80 = 430 kr.) and pickup without fee

## 6. Findability and checks

- [ ] 6.1 Add page metadata, `sitemap.ts`, `robots.ts` and the occasion `Product` JSON-LD, with `SITE_URL` in env, example and hand-over sheet; verify the sitemap lists the front page and five occasions only
- [ ] 6.2 Write the Playwright phone tests (full path with reload, keyboard-only path, no third-party font requests); verify they pass locally against the seeded database
- [ ] 6.3 Push for a preview, check the pages there, and record a mobile Lighthouse baseline with date and scores in the process note
- [ ] 6.3b Make an annotated screenshot of each finished screen (numbered markers, each with the reason and the decision it comes from) in `docs/design/storefront/`; verify every marker points to a logged decision or a brand-guide rule
- [ ] 6.4 Finish the process note (decisions, slips, a check per spec scenario), update `CLAUDE.md` if commands changed, validate and archive the change, and hand over for the pull request
