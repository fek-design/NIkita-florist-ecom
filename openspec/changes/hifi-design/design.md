## Context

Felix's front page (Figma "Nikita", frame `102:7661`) and the decisions DD-01 to DD-14 set the design language: Paper ground, Linen photo areas, Ink text, Sand footer, Ancizar Serif headings, Inter body, 4 px radius, Phosphor Light icons, 16 px margins, 44 px tap areas. The lo-fi wireframes (concept C for the shop, D for the back office) set the screens and their order. Felix's competitor boards (`ref/competitor/`: Bloomit, Interflora, Kaj Larsen) record what he found good and bad. The process note is [2026-11-23-hifi-design.md](../../../docs/process/2026-11-23-hifi-design.md).

## Goals / Non-Goals

**Goals:**
- One complete hi-fi set Felix can review, and the live build can follow screen by screen.
- Every element traceable to a proven pattern, a competitor finding, the brand or a decision.
- Versions that show how the design changed after each test.

**Non-Goals:**
- No new patterns, no variants unless Felix asks or a test leaves two answers.
- No upsells or add-ons (not in the catalogue; Felix's Interflora note on choice overload).
- No customer accounts (P4).
- Not the code: the storefront, checkout and back-office changes build from this set.

## Sources

Evidence grades as in the Design Rationale. Baymard's full guidelines are paywalled; the public articles below give the finding and the share of sites that get it wrong (B until checked on the full report).

| Key | Source | Grade |
|---|---|---|
| BM-home | Baymard, [42% of mobile homepages risk setting wrong expectations](https://baymard.com/research-articles/mobile-homepage-usability); [Homepage & navigation best practices](https://baymard.com/research-articles/ecommerce-navigation-best-practice): 70% of mobile users scroll the homepage on arrival, so show the main categories as homepage content | B |
| BM-nav | Baymard, [Product categories as top-level mobile navigation](https://baymard.com/blog/main-navigation-product-categories) (33% don't); [“View all” at each level](https://baymard.com/research-articles/mobile-main-nav-view-all) (24% get it right) | B |
| BM-atc | Baymard, [Added-to-cart confirmation examples](https://baymard.com/ecommerce-design-examples/added-to-cart-confirmation): show the added item and totals, two clearly named next steps | B |
| BM-cart | Baymard, [Cart & checkout research](https://baymard.com/research/checkout-usability): the cart is for review; cross-sells and promotions push the line items and totals out of view | B |
| BM-fields | Baymard, [Minimize form fields](https://baymard.com/blog/checkout-flow-average-form-fields): average 11.3 fields, most sites need about 8; hide optional fields | B |
| BM-guest | Baymard, [Make guest checkout prominent](https://baymard.com/research-articles/make-guest-checkout-prominent) | B |
| BM-date | Baymard, [Checkout UX best practices](https://baymard.com/research-articles/current-state-of-checkout-ux): “Delivery date” instead of “delivery speed” (48% don't) | B |
| BM-confirm | Baymard, [Order confirmation page best practices](https://baymard.com/blog/order-confirmation-page) | B |
| POL | Shopify Polaris, [Index table](https://polaris-react.shopify.com/components/tables/index-table) and [resource index / details templates](https://shopify.dev/docs/api/app-home/latest/patterns/templates/resource-index): a list of same-type items each opening a details page; status shown on the item; primary action on the details page | A (the design system's own documentation) |
| CMP-B / CMP-I / CMP-K | Felix's competitor boards: Bloomit, Interflora, Kaj Larsen (`ref/competitor/*.pdf`) | C |

## Front page analysis (Felix's design)

| # | Element | What it follows | Verdict |
|---|---|---|---|
| 1 | Navbar: menu, half-moon logo, basket | Mobile convention on all three competitors (Jakob's law) | Keep. The basket needs a count (storefront spec) |
| 2 | Hero photo, a person with flowers | Emotional hero on all three competitors; CMP-I “intent driven UI” | Keep. **Gap:** no words saying what the shop is or where it delivers (BM-home: wrong expectations). Proposal: one line under the photo, for example “Håndbundne buketter fra Tuse”. Marked, Felix decides |
| 3 | Featured bouquet with one button and its price | Single clear CTA; CMP-B “CTA to category” | Keep (DD-04) |
| 4 | Occasions straight under the hero, 2×2 with “fra”-prices | “Typical catalogue under hero” on all three competitors; BM-home | Keep (DD-13). The heading “Hvad betyder blomsterne for dig?” is Inter; the brand guide puts headings in Ancizar Serif → changed without a variant (brand rule) |
| 5 | “Se alle” | BM-nav “View all” | Keep |
| 6 | “Besøg Nikita” with photo and address | P8 local trust; none of the competitors shows the person, which is our edge against the networks (Design Rationale §3) | Keep |
| 7 | Sand footer | DD-08 | Keep. **Gap:** no payment methods shown, which Bloomit shows as trust badges (CMP-B) and Danes look for (P5, P8). Proposal: “MobilePay · Dankort · Visa” as text in the footer. Marked |
| 8 | “Begravelse” on a card | DD-03 says “Bisættelse” | Changed (decision) |

## Decisions per screen

Storefront (S) and back office (B). Each element lists its source; “Forslag” marks a proposal without one.

**S1 Forside:** Felix's frame with the changes in the analysis above.

**S2 Menu (opened from ☰):** the occasions as top-level items, then “Se alle anledninger”, then “Besøg butikken” and “Kontakt” (BM-nav). Full-screen sheet on Paper, rows 48 px with Linen lines, like footer C (DD-08).

**S3 Anledninger `/anledninger`:** heading in Ancizar, one short line, all occasions in the front page's 2-column card (DD-13). No filters: five items (BM-home; Kaj Larsen's crowded catalogue as the counter-example, CMP-K).

**S4 Anledning `/anledning/<slug>`** (wireframe C order):
- photo 4:5 (P6), name, intro;
- Lille / Mellem / Stor as three buttons with price and size in words (CMP-B price pools; CMP-K predetermined choices for the “I don't know flowers” buyer; brand guide tier picker);
- “Hvornår og hvor?”: Levering / Afhent i butikken as two buttons (CMP-K); for delivery only the postcode, and the fee shows as soon as it is valid (P3, DD-14); the delivery facts in one plain line (DD-14);
- date as quick choices “I dag”, “I morgen”, “Vælg dato” with the cut-off in words (CMP-B, CMP-K; P2; BM-date);
- card message with a 200-character counter on this page, not hidden in the cart (CMP-K: card hidden under the cart is bad; CMP-I: the card binds emotion);
- “Læg i kurv”, the one primary button.
- **Not here:** recipient name and address (CMP-B: asking before add-to-cart is a barrier before the decision). They go in checkout.
- **S4b** shows the out-of-area postcode with the brand guide's error copy and pickup offered (P3, P9).

**S5 Lagt i kurven:** a bottom sheet with the bouquet, tier, date and the cart total; two buttons “Gå til kurven” and “Se flere buketter” (BM-atc).

**S6 Kurv `/kurv`:** line items with photo, tier, price, quantity and remove (CMP-I order overview); the delivery choice and date with “Ret”; card message shown; delivery fee and total incl. moms (P3); “Gå til betaling”. No cross-sells (BM-cart; Felix's Interflora note on choice overload).

**S7 Betaling `/betaling`** (one page, wireframe C):
- no account, no login (P4, BM-guest);
- Dine oplysninger: name, email, phone; Modtager: name, address with the postcode already filled in from the occasion page, phone (delivery only). Seven fields, under Baymard's eight (BM-fields); “Firma” hidden behind a link (BM-fields; CMP-K shows it as a field);
- order summary with date, fee and total (CMP-K “Har du alt du skal bruge?”);
- fresh flowers and the right of withdrawal in one plain line, with the terms link (P12);
- payment: MobilePay first, then card (P5); “Betal 430 kr.” states the amount.

**S8 Tak for din bestilling:** order number, what was ordered, delivery date and address, what happens next, the email it was sent to, and how to reach the shop (BM-confirm, P8).

**B1 Log ind:** email and password, then a code from an authenticator app (back-office spec: second factor).

**B2 Ordrer:** today first with the count against capacity (“8 af 15”), then tomorrow; each order a row with delivery or pickup, tier, postcode and status badge, opening its detail (POL index → details; back-office spec).

**B3 Ordre:** status as the primary action (“Markér som i gang”), card message in full and large, recipient with address and call link, buyer, payment status, “Print seddel” (POL details: primary info first, status and actions with it; back-office spec).

**B4 Anledninger:** the occasions with photo, “fra”-price and one-tap toggles for “Vis i shoppen” and “Udsolgt” (POL index; back-office spec).

**B5 Ret anledning:** photo, name, intro, three tier prices and sizes, visible; save as the one primary button (POL details; back-office spec “under a minute”).

**B6 Levering og kapacitet:** fee, cut-off time, weekdays, orders per day, postcodes, closed dates (back-office spec; catalogue settings).

**B7 Salg:** orders and revenue incl. moms for today, this week and this month, this week next to last week, top occasions (back-office spec).

## Risks / Trade-offs

- **Baymard figures are from public summaries** → grade B; confirm on the full reports before the exam report (as the Design Rationale already notes).
- **Competitor boards are desktop screenshots** → the patterns are taken, the desktop layouts are not; everything is phone first (P1).
- **One set means fewer alternatives on record** → the versions and the test findings become the record of why the design changed.
- **Back-office spec predates the catalogue model** (products vs occasions with tiers) → the set follows the catalogue model; the spec is updated by the back-office change.
