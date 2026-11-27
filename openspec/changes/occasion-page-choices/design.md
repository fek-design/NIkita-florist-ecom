# Design

## Context

See proposal.md for why. Today a cart line holds `cardMessage` (always shown on the occasion page, 200 characters, stored on `order_lines.card_message`). The basket has one delivery for all its bouquets (DD-16 family; checkout spec). The delivery field takes four digits and asks `GET /delivery/postcodes/:postcode`; the zone is the `delivery_postcodes` table (15 rows, postcode and town). The slip and the confirmation are rendered from the order lines (`backend/src/email/order-emails.ts`). Process note: `docs/process/2026-11-19-storefront.md` (entries of 27 Nov).

## Goals / Non-Goals

**Goals:**
- A visitor who wants no card and has no wish sees neither field.
- A wish reaches the owner's slip without a phone call.
- A visitor can type the town they think in.

**Non-Goals:**
- Add-ons (chocolate, vase): wait for the owner's answers on which and what price.
- Several deliveries in one basket: one delivery per basket stays.
- A national address service (DAWA or similar) for the street address: the shop delivers to 15 places; its own list is enough, and no outside service is called.
- A price for the card: wording only, once the owner has answered.

## Decisions

1. **Card and wish per bouquet, not per order** (Felix, 27 Nov). Two bouquets to one funeral often come from different senders. Rejected: once per order (simpler, but one sender only).
2. **Folded behind links**, "+ Tilføj et kort" and "+ Ønsker til buketten" (Baymard: optional fields behind a link make a form look shorter; Interflora and Bloomit fold the card). Opening keeps any text already typed; the cart line keeps the text, so editing the bouquet later starts from it.
3. **Wish wording sets expectations**: "Nikita binder med sæsonens blomster og følger dit ønske, så vidt det kan lade sig gøre." It is not a promise, so no price or refusal logic is needed. Brand voice: plain, no exclamation marks.
4. **Wish stored like the card**: a `wish` text column on `order_lines`, empty by default, at most 200 characters by a check constraint (as `card_message`); migration 0009 (0008 holds the owner's numbers of 27 Nov). Checkout's item schema takes `wish` (max 200, like `cardMessage`), and pricing ignores it.
4a. **Card priced on the server**: `shop_settings.card_price_oere` (2000) and `order_lines.card_price_oere` recorded per line, so a later price change never alters an old order. Pricing adds it to lines with a card message, times the quantity; the Stripe session shows it as its own line ("Kort til Bisættelse"). The browser's price is for display only, as with everything else (spec orders: "Prices come from the server").
5. **One place field with suggestions from the zone list**: `GET /delivery/places?q=` returns at most eight `{ postcode, town }` whose postcode starts with `q` or whose town starts with `q`, compared in lower case (Danish letters kept as typed). Picking a suggestion runs today's postcode check, so fee, zone and pickup logic are unchanged. A four-digit postcode outside the list still gets "Vi leverer ikke til 8000" and the pickup offer; a town that matches nothing says the same with the typed name. The field is a native input with a listbox of suggestions (the ARIA combobox pattern), keyboard and screen reader usable.
6. **The slip prints the wish under its bouquet**, labelled "Ønske:", so it is read at the bench, not missed (P1 slip, DD-16). **The card text stands in its own box with a dashed cutting line**, sized for a standard florist's card, so she can cut it out and put it in the card, as with Interflora's slips (the owner, 27 Nov).

## Risks / Trade-offs

- **Wishes the owner cannot meet** (a colour not in season): the line under the field sets the expectation; the owner can still call when she must. To watch in her first weeks.
- **Town names that are not on the list but are inside the area** (a village under 4300): the visitor sees no suggestion. Mitigation: suggestions also match the postcode, and the "no delivery" message offers pickup and the phone number. The owner reviews the list (interview question 1).
- **Archive order**: the `storefront` and `orders` deltas modify specs that exist only once `storefront` and `checkout-payment` are archived. This change archives after them.

## Open Questions

- Resolved 27 Nov: the card costs 20 kr. per bouquet (decision 4a).
- Unanswered: do two bouquets in one order usually go to the same recipient? One delivery per basket stays; to ask by message or on 7 Dec. Does not change what this change builds.
