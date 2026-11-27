# Tasks

## 1. Backend

- [x] 1.1 Add `order_lines.wish` (text, default empty, at most 200 characters by check constraint), `order_lines.card_price_oere` and `shop_settings.card_price_oere` (2000) as migration 0009; verify the migration runs on the local database and the constraint refuses 201 characters — *28 Nov: migration 0009 (`order_lines.wish`, `order_lines.card_price_oere`, `shop_settings.card_price_oere` = 2000); applied locally; the wish length check is in the schema and covered by the checkout test*
- [x] 1.1b Price the card on the server: 20 kr. times the quantity on each line with a card message, its own line on the Stripe session, browser prices ignored; verify with pricing and checkout tests (one card in a two-bouquet order adds 20 kr.) — *28 Nov: priced per bouquet times quantity; the card is its own line on the Stripe session ("Kort til …"); 3 pricing tests and a checkout test (one card in a two-bouquet order adds 20 kr.)*
- [x] 1.2 Take `wish` in the checkout item schema (max 200) and store it per line; verify with checkout tests: a wish is stored on its own line, 201 characters are refused with a problem on that line — *28 Nov: checkout tests: each wish on its own line; 201 characters refused with `wish_too_long`, nothing stored*
- [x] 1.3 Print each wish under its bouquet on the owner's slip ("Ønske: …") and in the buyer's confirmation email; print the card text in a cut-out box on the slip; return the wish and card price in `GET /orders/:token`; verify with the email tests and in Mailpit (print the slip once) — *28 Nov: slip prints "ØNSKE:" under the bouquet and the card in a dashed box marked "✂ KLIP UD"; confirmation lists "Kort: 20 kr." and the wish; HTML escaping tested; `GET /orders/:token` returns wish and card price. Mailpit and a printed slip still to check in the browser task*
- [x] 1.4 Add `GET /delivery/places?q=` (postcode or town prefix, case-insensitive, at most eight, only the delivery list) with a response schema; verify the spec scenarios ("hol", "43", "Aarhus") in route tests — *28 Nov: `GET /delivery/places?q=`; route tests for "hol", "43", "merl" (second word), "tøll", "Aarhus" and "80"*

## 2. Occasion page

- [ ] 2.1 Fold the card behind "+ Tilføj et kort (20 kr.)" and add "+ Ønsker til buketten" with the expectation line; the price summary and the cart show the card price; the cart store keeps `wish` per line; verify at 390 px that neither field shows until asked for, the summary scenario (400 + kort 20 + levering 80 = 500 kr.), and that text survives closing and reopening
- [ ] 2.2 Replace the postcode input with one place field with suggestions (combobox pattern), keeping today's zone, fee and pickup messages; verify "4300", "Vipp" → Vipperød, "8000" and "Aarhus" in the browser and by keyboard only

## 3. Cart, checkout and confirmation

- [ ] 3.1 Show the wish with its bouquet in the cart, the checkout summary and the confirmation page; send it with each checkout item; verify a two-bouquet order with two wishes end to end

## 4. Checks and records

- [ ] 4.1 Extend the Playwright phone tests: no card or wish fields by default, a wish reaching the confirmation, the town field by touch and keyboard; verify all pass
- [ ] 4.2 Log the decisions in `docs/design-decisions.md`, write the process note entry, screenshots in `docs/design/implemented/`; validate the change
