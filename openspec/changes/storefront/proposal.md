## Why

Week 2's exit criteria need a shop a visitor can use on a phone: browse the occasions, choose a bouquet and a day, and fill a cart. The backend now serves the catalogue and the delivery rules (`openspec/specs/catalog`), the brand is approved (`ref/brand/`), and the owner chose concept C, occasions first. Today the frontend shows only a placeholder heading.

## What Changes

- **Front page:** the occasions as the first choice, with the lowest price and "Udsolgt" where sold out, plus the delivery facts customers ask about (fee, area, same-day cut-off, pickup) and a short factual FAQ, all read from the backend.
- **Occasion page** at `/anledning/<slug>`:
  - photos, with a calm placeholder area while the owner's photos are missing (no stock or AI images);
  - intro and description;
  - Lille/Mellem/Stor with price and size in words;
  - "Hvornår og hvor?": delivery or pickup, a postcode check for delivery with the fee shown at once (P3), and a date from the days the shop can actually deliver (P2);
  - a card message, then "Læg i kurv".
- **Cart** at `/kurv`:
  - the bouquets with quantity and remove;
  - the order's one delivery choice, which can be changed;
  - delivery fee and total including moms;
  - kept across reloads in the browser.
  - "Gå til betaling" is shown but not active until the checkout in week 3.
- **Available dates from the backend:** a new route `GET /delivery/dates` lists the days that can be chosen, from the weekdays, the same-day cut-off in Danish time and the closed dates. The rules live in one place, which the checkout reuses and extends with the daily capacity in week 3.
- **Brand in the app:** tokens, Ancizar Serif and Inter self-hosted, the half-moon logo in the navbar and the full logo in a Sand footer, favicons.
- **Findable:**
  - a title and description per page;
  - `sitemap.xml`, and `robots.txt` that also allows AI crawlers;
  - product data for each occasion.
  - The shop's business data (name, address, CVR, phone) is added only once the owner supplies the real details.
- **Placeholder content is marked** wherever it appears, so nothing unconfirmed looks final.
- **Checked:** phone tests from front page to cart and back after a reload, accessibility rules from the brand guide, and a dated Lighthouse baseline.

Defaults chosen for this change, confirmed by Felix on 19 Nov (design decisions 2–4):
- one delivery per order: one date and one place for the whole cart;
- date and card message chosen on the occasion page, before adding;
- cart prices for display only, recalculated by the server at checkout.

Out of scope: checkout, payment and orders (week 3), the admin and photo upload, the shop's business details.

## Capabilities

### New Capabilities
- `storefront`: the pages a customer uses (front page, occasion page, cart), the delivery choice, the cart's behaviour, placeholder marking, findability, and the phone and accessibility rules for them.

### Modified Capabilities
- `catalog`: adds the available delivery dates (new requirement; existing requirements unchanged).

## Impact

- `frontend/`: new pages and components, the brand tokens and fonts, `sitemap.ts`, `robots.ts`, icons. The `/status` page stays.
- `backend/`: one new route, `GET /delivery/dates`, with tests. No schema change.
- `ref/brand/tokens.css` is copied into the frontend; a test keeps the two copies identical.
- No new runtime packages are expected; any that turn out to be needed are recorded with a reason (roadmap rule 8).
- Branch: `feature/storefront`.
