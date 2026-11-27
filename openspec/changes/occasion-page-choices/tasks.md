# Tasks

## 1. Backend

- [ ] 1.1 Add `order_lines.wish` (text, default empty, at most 200 characters by check constraint) as migration 0008; verify the migration runs on a copy of the local database and the constraint refuses 201 characters
- [ ] 1.2 Take `wish` in the checkout item schema (max 200) and store it per line; verify with checkout tests: a wish is stored on its own line, 201 characters are refused with a problem on that line
- [ ] 1.3 Print each wish under its bouquet on the owner's slip ("Ønske: …") and in the buyer's confirmation email; return it in `GET /orders/:token`; verify with the email tests and in Mailpit
- [ ] 1.4 Add `GET /delivery/places?q=` (postcode or town prefix, case-insensitive, at most eight, only the delivery list) with a response schema; verify the spec scenarios ("hol", "43", "Aarhus") in route tests

## 2. Occasion page

- [ ] 2.1 Fold the card behind "+ Tilføj et kort" and add "+ Ønsker til buketten" with the expectation line; the cart store keeps `wish` per line; verify at 390 px that neither field shows until asked for, and that text survives closing and reopening
- [ ] 2.2 Replace the postcode input with one place field with suggestions (combobox pattern), keeping today's zone, fee and pickup messages; verify "4300", "Vipp" → Vipperød, "8000" and "Aarhus" in the browser and by keyboard only

## 3. Cart, checkout and confirmation

- [ ] 3.1 Show the wish with its bouquet in the cart, the checkout summary and the confirmation page; send it with each checkout item; verify a two-bouquet order with two wishes end to end

## 4. Checks and records

- [ ] 4.1 Extend the Playwright phone tests: no card or wish fields by default, a wish reaching the confirmation, the town field by touch and keyboard; verify all pass
- [ ] 4.2 Fold in the owner's interview answers on the card price and two bouquets (design Open Questions), log the decisions in `docs/design-decisions.md`, write the process note entry, screenshots in `docs/design/implemented/`; validate the change
