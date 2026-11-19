## Context

See proposal.md for motivation. Process note: [docs/process/2026-11-19-storefront.md](../../../docs/process/2026-11-19-storefront.md) (written during implementation).

Current state:
- **Frontend:** Next.js 16 with Cache Components on; a placeholder home page and `/status`; server code calls the backend through `src/lib/backend.ts`; browser code calls `/api/*`, rewritten to the backend. Unit tests with Vitest; Playwright smoke tests on a phone viewport that start both apps. No brand applied yet.
- **Backend:** `GET /occasions`, `/occasions/:slug`, `/delivery`, `/delivery/postcodes/:postcode`, cacheable for 60 seconds, with placeholder marks. Every deploy migrates and seeds its own database.
- **Brand:** `ref/brand/` (tokens, fonts, logos, favicons, guide) and the `florist-brand` skill.
- **Inputs:** wireframe C (`ref/wireframes/lofi/c-anledninger.html`), the owner interview, Design-Rationale P1–P3, P6, P8–P10, P12.

## Goals / Non-Goals

**Goals:**
- A visitor on a phone can go from the front page to a filled cart with a chosen day, and the cart survives a reload.
- Every rule a customer meets (dates, fee, zone) comes from the backend, so checkout reuses it.
- Brand, accessibility and findability are built in now, not added in week 5.

**Non-Goals:**
- Checkout, payment, orders, the daily capacity in dates.
- Ceremony details for funerals (church, ceremony time); they belong to the checkout form.
- Search, filters, accounts.

## Decisions

### 1. Pages and addresses
| Address | Page | Rendering |
|---|---|---|
| `/` | Occasions and delivery facts | Server, catalogue cached 60 s |
| `/anledning/<slug>` | One occasion | Server shell; tier and delivery choice in a client component |
| `/kurv` | Cart | Client (the cart lives in the browser) |
| `/status` | Existing system status | Unchanged, left out of the sitemap |

Danish addresses (`anledning`, `kurv`) match the customers' language and read well in search results (P10). Catalogue data is read with `use cache` and a one-minute lifetime, matching the backend's cache header, so a sold-out toggle shows within about a minute.

### 2. One delivery per order *(confirmed by Felix, 19 Nov)*
The cart holds one delivery choice: pickup, or delivery to a postcode, plus one date. All bouquets go together.
- *Why:* most orders are one bouquet for one recipient, and one choice keeps checkout to a single address and date, which matters most on a phone (P1, P4).
- *Rejected:* a delivery per bouquet (several addresses and dates in one payment; heavier checkout, capacity counted per address).
- If the owner wants several recipients per order later, the cart format has a version number, so it can grow without breaking stored carts.

### 3. Date and card message on the occasion page *(confirmed by Felix, 19 Nov)*
The visitor chooses delivery or pickup, a postcode and a date before "Læg i kurv", following P2: the day is part of the product. The card message is written next to the bouquet it belongs to (wireframe C). The recipient's name and address belong to checkout, where the payment form already collects details.

### 4. Available dates come from the backend
`GET /delivery/dates` returns `{ dates: ["2026-11-19", ...] }` for the next 60 days in Danish time: delivery weekdays only, closed dates removed, today only before the cut-off. The same function will be called by the checkout to re-check the date on the server, and the capacity check slots into it in week 3.
- *Rejected:* computing dates in the browser from `/delivery` (two copies of the rule that would drift; the browser's clock and time zone are not trustworthy).
- The date picker is a horizontally scrolling row of day buttons (weekday and date in Danish), not a calendar widget: on a phone, the next few delivery days are what people choose, and buttons need no date library. Later dates are reached by a "Vis flere datoer" button.

### 5. The cart in browser storage
- Stored in `localStorage` under `nn-cart-v1`, as `{ version: 1, delivery, lines }`. Each line holds slug, name, tier, unit price, quantity and card message.
- Read through a small store with `useSyncExternalStore`, so every component sees the same cart and changes in another tab show up too.
- If storage is unavailable (private mode, blocked), the cart still works for the visit and says it will not be remembered.
- Prices stored in the cart are display-only. When the cart opens, it fetches each occasion again, shows current prices and notes any change. A hidden or sold-out bouquet is marked unavailable and left out of the total. The server recalculates everything at checkout.
- *Rejected:* a server-side cart (needs a session and storage before there is an order; more personal data held).

### 6. Brand in the frontend
- `ref/brand/tokens.css` is copied to `frontend/src/styles/tokens.css`. A unit test compares the custom properties in both files and fails if they drift. *Rejected:* importing from `ref/` at build time (Vercel builds only `frontend/`).
- Fonts load through `next/font/local` from `frontend/src/fonts/` (the same subset WOFF2 files). Next.js adds a size-matched fallback, which limits layout shift (P7). The token variables point at the font variables Next.js creates.
- The navbar uses the half-moon PNG at 110 px wide (brand guide minimum). The footer uses the full Paper logo on Sand. Favicons go in `app/icon.png` and `app/apple-icon.png`.
- Components follow the guide:
  - buttons at least 48 px;
  - the tier picker as three equal buttons, the chosen one filled Ink;
  - Linen cards with a Sand border on Paper;
  - links on Linen in Ink.

### 7. Placeholder marking
Whenever the API marks something as a placeholder, an "Eksempel" label is shown, on every environment. Production must have no placeholders at launch, and the launch check looks for them; showing the label there too is safer than hiding unconfirmed content. A photo area without photos shows "Foto kommer" on a Linen ground.

### 8. Findability
- Metadata per page through Next.js's metadata API. `app/sitemap.ts` lists the front page and the visible occasions; `app/robots.ts` allows all crawlers, including AI crawlers such as GPTBot, ClaudeBot and PerplexityBot (P10), and points to the sitemap.
- Each occasion page carries JSON-LD `Product` with an `AggregateOffer` (lowest and highest tier price, DKK, availability from sold out).
- No `Florist`/`LocalBusiness` data until the owner's real name, address, CVR and phone exist (CLAUDE.md override 1; nothing invented).
- The site address for absolute URLs comes from a new frontend variable `SITE_URL` (the staging address for now), added to `.env.example`, `src/env.ts` and the hand-over sheet.

### 9. Money on screen
Prices are formatted in Danish: "350 kr.", "1.250,50 kr.", with tabular numbers. The frontend gets its own small `formatKroner`, matching the backend's and tested with the same cases. *Rejected:* a shared package for one function (workspace plumbing out of proportion).

### 10. Tests and measurements
- **Unit tests:** cart store (add, change quantity, remove, one delivery, storage failure), money formatting, token drift. Backend: the dates rule, with a fixed clock across the cut-off, Sundays, closed dates and the 60-day edge.
- **Playwright on a phone viewport:** front page → occasion → tier → delivery to 4300 → date → card message → add → cart → reload → still there; plus a keyboard-only pass and a check that no request goes to another address for fonts. They run locally against the seeded database. Running them in CI needs a browser download per run; that is considered at the week 5 hardening checkup.
- **Lighthouse baseline** on the public preview address, mobile, recorded with date and scores in the process note (roadmap week 2 exit criterion). How it is run (local Chrome, or PageSpeed Insights on a public address) is decided when the pages exist.

## Risks / Trade-offs

- [The owner wants different delivery rules (several recipients, ceremony details)] → defaults 2 and 3 are named for review; the versioned cart format can change.
- [Placeholder text and "Foto kommer" make the shop look unfinished on previews] → intended: it is unfinished until the owner's content arrives, and the labels make that visible.
- [Cart prices go stale] → refreshed when the cart opens; the server decides at checkout.
- [Week 2 time is short] → tasks are ordered so the front page and occasion page come first; the cart follows; findability and the baseline close the change.

## Open Questions

None. Defaults 2 and 3 were confirmed by Felix on 19 Nov.
