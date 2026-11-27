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
| ~~Tier picker as three equal buttons, chosen one filled Ink~~ | Brand board, 17 Nov | Approved by Felix, 23 Nov (in S4 and B8a) |
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
Decision: The delivery facts (fee, area, cut-off, pickup) are not added to the front page. They sit on the occasion page with the delivery choice, and the fee appears as soon as a postcode is entered, before anything goes in the cart. Felix's choice (option c). Why, in his words: let the customer fall in love with the product first. The 80 kr. will always hurt; better that someone who leaves does so knowing what the shop offers than leaves at once. (He calls it the sunk-cost effect: time spent choosing makes the fee easier to accept.)
Rejected: a short delivery block on the front page under the featured bouquet (a); the facts in the footer (b).
Risk, stated honestly: P3 asks for the fee before the visitor chooses. Here a visitor meets it after choosing an occasion but before the cart, so it is never a surprise at checkout.
Test: usability task "Hvad koster levering til 4300?": time to answer and where people look first. If most look on the front page first, revisit a) or b).

### DD-08 Footer: Sand band with tap rows (variant C)
Date: 2026-11-21, chosen 2026-11-23 · Principles: P9, P11 · Evidence grade: C
Decision: The footer is a Sand band with the full logo, text and icons in Paper (5.1:1). Kontakt lists email, phone, address and Facebook as full-width 48 px rows between Linen lines; below them the CVR number and links to Handelsbetingelser and Privatlivspolitik. Felix's reason: it follows the brand guide, where bands and the footer are Sand (the 30% share).
Kept from Felix's design: the content (logo, Kontakt, email, phone, Facebook), Ancizar Serif heading, icon + text rows. Added and accepted: address, CVR (placeholder until the owner supplies it), the two legal links (CLAUDE.md override 1).
Rejected (`docs/design/storefront/footer-variants.png`): A, Felix's side-by-side layout on Linen (the email only fits beside the 120 px logo at 14 px); B, a centred stack on Linen (centred lists scan slower).
Test: usability task "Ring til butikken" from the bottom of the front page; contrast already checked (Paper on Sand 5.1:1).

### DD-15 One hi-fi set from proven patterns, then tests
Date: 2026-11-23 · Principles: all; process decision · Evidence grade: n/a (process)
Decision: The remaining screens, front page to checkout and the back office, are made as one hi-fi set in Figma, in Felix's design language. No new patterns: each element follows Baymard, Nielsen Norman Group, Shopify Polaris (back office) or Felix's competitor boards, and cites it; anything else is marked "Forslag". After Felix's review the set is improved through usability tests on the live page, and each version is kept (`docs/design/versions/vN/`). Felix's call. Mobbin was considered and dropped again (no paid plan; it shows what apps do, not whether it works); Baymard's tested findings were preferred.
Rejected: 2–3 variants per key choice for every screen (does not fit the four weeks left); Mobbin as the pattern source.
Test: the versions' changelogs show which test findings changed the design.

### DD-16 Orders reach the owner on paper
Date: 2026-11-23 · Principles: P1 (her phone is not her workplace), back-office spec purpose ("less of her time than the phone orders it replaces") · Evidence grade: C (owner's way of working, via Felix)
Decision: Every order becomes a printed slip for her pinboard, laid out for a receipt printer (80 mm), the same way kitchens receive tickets and florist networks send work slips. She has no printer yet, so until one is bought the order email is laid out as the same slip and printed by hand. A morning sheet at 7:00 lists the day's deliveries and pickups. Felix's call, after the owner's preference for paper.
Rejected: managing orders on the phone (v1's back office; she treats technology as a medium, not a pleasure, and less screen time means more time with flowers); a printer with its own email address (no printer to build on).
Test: minutes per day the owner spends in the back office, measured in the usability test and after a week of use.

### DD-17 The pinboard is the order status
Date: 2026-11-23 · Principles: none beyond DD-16 · Evidence grade: C
Decision: No status buttons in the back office. A slip on the pinboard is an order to make; a slip taken down is done. Felix's call.
Rejected: one-tap statuses on the phone (v1, B2/B3); a QR code on each slip to scan when done.
Consequence: the back-office spec's "Order handling from one screen" (status in one tap) changes. Open: how customers learn when a pickup is ready or roughly when a delivery comes, without the owner having to act (Felix's concern, 23 Nov).

### DD-18 Pickup at a time the customer chooses
Date: 2026-11-23 · Principles: P2 (the date, and here the hour, is part of the product) · Evidence grade: C (CMP-K: Kaj Larsen offers pickup with a schedule; click-and-collect convention)
Decision: A customer who picks up chooses a one-hour slot within opening hours on the occasion page. The slip prints the slot in large type. On the morning of the pickup an automatic email says when and where the bouquet is ready. The owner does nothing; nobody keeps a long window free. Felix's call, from his own annoyance at long waiting windows.
Rejected: a "klar til afhentning" message the owner sends by hand (she would have to act, against DD-16/DD-17).
Open for the owner: opening hours and pickups per hour (owner questions 2 and 8).
Test: usability task "Bestil en buket, du selv henter i morgen eftermiddag"; afterwards, can the participant say when to come?

### DD-19 Delivery during the day, with instructions for when nobody is home
Date: 2026-11-23 · Principles: P2, P3 · Evidence grade: C (CMP-K: "Hvis modtageren ikke er hjemme, må vi …")
Decision: Delivery is promised for the chosen day ("i løbet af dagen"), not a window. Checkout asks what to do if the recipient is not home (by the door, with a neighbour, or call the buyer). For Bisættelse it asks when the flowers must be there at the latest, because a funeral has a fixed time. No messages need the owner to act. Felix's call (option a).
Rejected: a "på vej" message from one scan of the morning sheet (b; parked until it is known how she drives, owner question 10); morning/afternoon at checkout (c; binds her round to the customers' choices).
Test: in the usability test, ask the buyer whether "i løbet af dagen" is enough; collect what they would want instead.

### DD-20 The owner signs in with a passkey
Date: 2026-11-23 · Principles: P9; DD-16 (least screen time) · Evidence grade: A (NIST SP 800-63B rates passkeys as phishing-resistant multi-factor)
Decision: "Log ind med Face ID" (a passkey) is the main way into the back office: one touch, and it counts as two factors (her phone and her face or finger). Password plus a 6-digit SMS code remains for the first sign-in on a new phone and as the fallback. "Husk mig i 30 dage" keeps her signed in. Felix's call.
Rejected: an authenticator app as second factor (too complicated for the owner, Felix); password with no second factor (the spec requires one, and a forgotten password would still lock her out).
Test: in the usability test, time from opening the admin link to the "I dag" screen.

### DD-21 Orders taken in the shop or by phone are registered like a till
Date: 2026-11-23 · Principles: DD-16 (one paper flow), capacity in the back-office spec · Evidence grade: C (restaurant tills: order type → category → item → modifiers → ticket to the printer)
Decision: "+ Ny ordre" on the "I dag" screen registers orders that do not come through the webshop, so every order counts against the day's capacity and pickup slots, gets the same slip, and appears on the morning sheet and in the monthly figures. Two types: *I butikken nu* (registered in one tap, no slip) and *Telefon*, which is **pickup only**: occasion, size, optional comment, day and slot, name and phone, and "Ved afhentning" or "Allerede betalt". No payment runs through the system; she keeps taking MobilePay as today, and Stripe stays the online gateway. Felix's design, from restaurant tills; phone orders limited to pickup by Felix so she never types an address.
Rejected: a payment link sent to the customer (the problem was tracking, not payment); a card terminal linked to the system (hardware, a second payment flow, past feature freeze); a count-only "+1" capacity button (no slip, no record).
Open: add-ons ("upsells") as one-tap buttons need add-on products in the catalogue first (Forslag 4); how many orders come by phone or over the counter (owner question 11).
Test: time to register a phone order, target under 30 seconds, in the owner walkthrough in week 4.

### DD-22 The four hi-fi proposals
Date: 2026-11-23 · Principles: P8, P5, P9 · Evidence grade: B/C (sources per proposal in `openspec/changes/hifi-design/design.md`)
Decision (Felix):
- **Forslag 1, intro line on the front page:** yes, but it leads into the recommendation: "Håndbundne buketter fra Nikitas værksted i Tuse. Lige nu anbefaler hun:" followed by the featured bouquet, which is the seasonal one or else the best-selling (DD-04). The prime spot under the hero recommends a bouquet rather than only describing the shop.
- **Forslag 2, payment methods in the footer:** yes.
- **Forslag 3, passkey:** yes (DD-20).
- **Forslag 4, add-ons as one-tap buttons on shop orders:** yes, added once the catalogue has add-ons. Kept as an open task so it is not forgotten.
Test: front page first impression in the usability test ("Hvad sælger butikken, og hvad ville du købe?").

### DD-23 Everyday content is the owner's to change
Date: 2026-11-23 · Principles: back-office spec purpose · Evidence grade: C
Decision: What changes day to day or month to month is editable in the back office, even if Felix ends up maintaining the shop: the featured bouquet on the front page ("På forsiden nu · Skift" on B4), sold out, closed days, prices and photos. Code changes are only for what changes rarely. Felix's call.
Test: in the owner's first test, can she swap the featured bouquet without help?

### DD-24 Supporting text is toned down
Date: 2026-11-23 · Principles: P9 (contrast kept), P11 · Evidence grade: C (visual hierarchy: fewer elements competing for attention)
Decision: Descriptions, hints, meta lines and helper text use Sand instead of Ink (role token `--color-text-muted`; Sand on Paper 5.1:1, AA). Headings, prices, choices and buttons stay Ink, so they lead. On Linen panels supporting text stays Ink, because Sand on Linen is 3.8:1. The owner asked for simple; Felix found the hi-fi set busy even where the extra text is optional. Felix's call.
Rejected: removing the optional text (it answers real questions: size, fee, cut-off); a new grey outside the palette (brand rule: one palette).
Applies from v3; built into the frontend from the start. Figma working page to follow.
Test: in the owner's first test and the usability test, ask what people noticed first on the occasion page.

### DD-25 The customer's email is checked three ways
Date: 2026-11-25 · Principles: P4 (guest checkout), DD-18 (the pickup reminder goes by email) · Evidence grade: C
Decision: In checkout (S7) the email gets a typo suggestion ("Mente du …@gmail.com?"), a second field "Gentag e-mail", and is shown again in the summary before "Betal". Felix's call: the confirmation and the pickup reminder must arrive, and a typo means neither does.
Trade-off, stated honestly: the repeat field adds one field. A normal delivery has 8 fields and Bisættelse 9, one over Baymard's guide figure of about eight; Baymard advises against confirmation fields because people paste the first into the second.
Rejected: typo suggestion and summary only (Claude's recommendation); the repeat field only.
Test: in the usability test, time on the checkout form and whether anyone pastes into the repeat field; count bounced confirmation emails after launch.

### DD-26 A light skeleton wave on photo areas
Date: 2026-11-25 · Principles: P7 (light; no layout shift), P9 (reduced motion respected) · Evidence grade: C
Decision: While a photo loads, and where no owner photo exists yet, a soft band of Paper light slides across the Linen photo area. It stops when the photo has loaded and is off for visitors who ask for reduced motion. Felix's call ("very lightweight").
Trade-off, stated honestly: on areas with no photo yet the wave keeps running next to "Foto kommer", which reads a little like loading; the text keeps it clear. All areas are like this until the owner's photos arrive.
Rejected: plain Linen only (DD-12 as first built).
Test: Lighthouse layout shift stays under 0.1; in the usability test, nobody waits for a photo that is not coming.

### DD-27 The navbar stays at the top
Date: 2026-11-25 · Principles: P1 (phone: menu and basket in reach) · Evidence grade: C
Decision: The navbar is sticky: it stays at the top of the screen while the page scrolls, so the menu and the basket are always one tap away. Links that jump within a page land below it. Felix's call.
Trade-off: it takes 72 px of the screen at all times (about 9 % of an 844 px phone screen, less of the visible area in Safari or Instagram).
Rejected: a navbar that scrolls away with the page (as built first); one that hides on scroll down and returns on scroll up (Felix: elderly visitors "lose it" when it disappears, and the shop's buyers include older gift senders; also more motion and code).
Test: in the usability test, can people reach the basket from the bottom of a long page without scrolling back up?

### DD-28 A layout grid and 8 px spacing, for phone, tablet and desktop
Date: 2026-11-25 · Principles: P1 (mobile first, not mobile only), P11 (one system, fewer stray values) · Evidence grade: B (Material Design 3 window size classes and layout grid; 8-point spacing as used by Material and Shopify Polaris)
Decision: Phone under 600 px: 4 columns, 16 px margins and gutters. Tablet 600–1199 px: 8 columns, 32 px margins, 24 px gutters. Desktop from 1200 px: 12 columns of 72 px with 24 px gutters, 1128 px in all, centred. Layout spacing uses steps of 8 (tokens `--space-1` to `--space-10`); inside a single small part (button, row, badge, input) half steps of 4 are allowed. Coloured bands (footer, navbar) stay full width; their content keeps to the grid. Running text is capped at about 70 characters (`--measure`) where desktop layouts are built. Felix's call ("divisible by 8"; "we shouldn't neglect the desktop and tablet").
Follows from it on the phone: the card gap from the Figma frame (10 px) became 16 px, and a handful of 10, 12, 20 and 2 px gaps moved to the nearest step.
Rejected: 16 desktop columns so that column counts are divisible by 8 too (fiddly, unusual); a narrower 936 px desktop; an extra step for small laptops.
Next: tablet and desktop frames for S1, S3, S4 and S6/S7 in Figma, each element citing its pattern, for Felix to review before they are built.
Test: no horizontal scroll and content edges on the grid at 390, 768, 1280 and 1600 px (checked 25 Nov); in the usability test, one session on a laptop.

### DD-29 Tablet and desktop layouts: side by side from 600 px (replaced 27 Nov, see DD-31)
Date: 2026-11-26 · Principles: P1 (mobile first, not mobile only), P2 and P3 (price and fee visible before choosing), DD-28 · Evidence grade: B (Baymard product page, cart and checkout layouts; Shopify checkout)
Decision: From tablet width the long phone column splits in two. Occasion page: photo 7 columns, choices 5 (tablet 4 + 4), and the photo stays in place while the choices scroll past (Felix). Front page: photo 7 + recommendation 5 (tablet 4 + 4) with a 3:2 photo, bouquet name at the front-page heading size (40 px) and intro line 20 px; the top four occasions in one row; "Besøg Nikita" as a landscape photo across 6 columns beside centred text, heading 32 px; footer C in three columns (tablet: logo above two). Cart: items and delivery 7, totals and button 5. Checkout: form 7 with the pay button at its end, "Din ordre" 5 on the right, following the scroll (Felix). On tablet, the category page, cart and checkout keep the phone layout in the middle 6 columns. Felix's calls; he cared about the feel more than per-screen frames ("we just needed to nail the feel").
Rejected: the first frames (26 Nov), where the hero's 6:5 photo and the tall portrait in "Besøg Nikita" left awkward empty space beside short text (Felix: slightly in the hero, very in the about section); images kept as `docs/design/hifi/working-v3/grid/*-rejected-too-much-space.png`. Also rejected: a photo that scrolls away on the occasion page (the button would sit below a laptop screen's fold with the photo gone).
Test: in the usability test, one session on a laptop: does the person find "Læg i kurven" without scrolling back up, and does anything read as empty?

### DD-30 One column on every screen size: the phone layout, centred (reverted the same day, see DD-31)
Date: 2026-11-27 · Principles: P1 (mobile first), P11 (one system, less to learn), DD-28 · Evidence grade: C (opinion: Felix preferred the feel of the live one-column site over the two-column frames)
Decision: Tablet and desktop keep the phone layout: the same order and the same single column, centred in 8 of the 12 desktop columns (744 px; on tablet the full width). The front-page hero sits in the column from tablet up, and the occasion photo keeps its shape but never grows taller than about 70 % of the screen, so on a 1280 × 900 laptop the intro line, the recommended bouquet and its button show on the first screen. Navbar and footer bands stay full width with their content in the same column. Felix's call: he likes the live design better than the Figma frames.
Rejected: the two-column layouts of DD-29 (photo beside choices, form beside the order), kept as images and in the Figma section marked "AFVIST"; the live column at the full 1128 px (the hero filled the first screen, cards 550 px wide, checkout fields 1128 px wide); capping only the photos. With one column the sticky photo and the sticky "Din ordre" from DD-29 have nothing to stay beside and are dropped.
Known trade-off: "Besøg Nikita" keeps its portrait photo beside short text, which on a wide screen leaves empty space under the text, the same thing Felix found awkward in the first two-column frames.
Test: in the usability test, one person on a laptop: is anything on the first screen of the front page and the occasion page missed?

### DD-31 Tablet and desktop keep the live layout; only the hero is lower
Date: 2026-11-27 · Principles: P1, DD-22 (the intro line leads into the recommendation) · Evidence grade: C (opinion: Felix)
Decision: Tablet and desktop keep the layout the site already had: the phone's order in the 1128 px grid of DD-28. The only change is the front-page hero: it stays an edge-to-edge band, but from 600 px up it is at most 60 % of the screen height (560 px at most) instead of 6:5, with the photo filling and cropped. On a 1280 × 900 laptop it is 540 px instead of 1,067 px, so the intro line, the recommended bouquet and its button show on the first screen. The phone is unchanged. Felix's words: "tidy up the hero so it's not as big but same format".
Rejected: DD-30's 744 px column, built and reverted the same day (Felix: "it's worse now"; images kept as `docs/design/implemented/2026-11-27-column-rejected-*.png`); DD-29's two columns (Figma section marked "AFVIST").
Misread, recorded honestly: when Felix said he liked the live design, Claude took it as an invitation to choose how much of it to keep and offered a narrower column as the recommended option; what he wanted was the live layout as it was, with only the hero tidied.
Known: on desktop the occasion photo, the cards and the checkout fields stay as wide as the grid (the occasion photo is taller than a laptop screen). Left as Felix's live design; the laptop session in the usability test will show whether it matters.
Test: in the usability test on a laptop: is the recommendation on the front page noticed without scrolling?
