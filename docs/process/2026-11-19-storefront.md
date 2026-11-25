# Storefront

**Started:** 19 Nov 2026 · **Change:** [`storefront`](../../openspec/changes/storefront/) · **Branch:** `feature/storefront`
**Related:** [Design decisions](../design-decisions.md) · [Design rationale](../../ref/Design-Rationale.md) · [Brand guide](../../ref/brand/brand-guide.md) · [Wireframe C](../../ref/wireframes/lofi/c-anledninger.html) · [Owner interview](2026-11-16-owner-interview.md)

## Goal

A shop a visitor can use on a phone: see the occasions, choose a bouquet, a size and a day, and fill a cart that survives a reload. Week 2 exit criterion.

## Inputs

- Wireframe C (occasions first), chosen by the owner.
- The catalogue API and delivery rules (`openspec/specs/catalog`), with placeholder data.
- The approved brand: tokens, Ancizar Serif and Inter, half-moon and full logo.
- Design-Rationale P1 (phone first), P2 (date first), P3 (no surprise costs), P6 (photos are the product), P8 (local trust), P9 (accessible), P10 (findable).
- Defaults confirmed by Felix on 19 Nov: one delivery per order; date and card message chosen on the occasion page.

## How the design is made

Felix's education is design-oriented, so every key layout choice is his (CLAUDE.md, "Design decisions are Felix's"). For each screen Claude builds 2–3 variants on a board at phone size with the real brand and data, with reasoning, evidence and risk per variant; Felix chooses and argues the choice; it is logged in [design-decisions.md](../design-decisions.md); the finished screen gets an annotated screenshot and the rejected variants are kept as images in `docs/design/storefront/`.

## Work log

- **Front page board (19 Nov).** Three choices, eight frames, real brand and seeded data at 390 px: A, what comes first (occasions, facts, large photo); B, card style (wide row, two-column grid, large photo); C, where delivery facts sit (strip, block after the occasions).
  - *Slip, caught before showing Felix:* the first texts guessed how many occasions were visible ("about two", "four") and drew the screen edge at 844 px, the full phone height. In Safari or Instagram, the toolbars leave roughly 660 px visible (approximate, grade C). The line was moved and every count rewritten from measurements of the frames. One variant (C2) had also shown only three occasions, which made its fact block look visible; with all five it starts at 844 px, below the visible area.
- **Change of direction: Felix designs in Figma (21 Nov).** Felix decided to make the hi-fi screens himself and shared the front page as a PDF (`ref/mockups/iPhone 18 Pro - HiFi.pdf`). The variant board above is superseded for the front page (DD-01); it stays as a record of what was considered. Claude may only change font sizes and spacing, plus what Felix hands over.
  - *Dead end:* the PDF gave layout and text but not reliable font weights, stroke widths or exact spacing. Rather than guess, Claude stopped and set up Figwright (pinned 0.7.0, D-015) so values are read from the Figma file itself. The first attempt to register it failed because the `claude` command was not on Felix's PATH; `.mcp.json` was written directly instead.
  - Read from Figma: 12 px body text, 10 px margins, 8 px radius, wireframe greys (`#E6E6E6`, `#DFDFDF`), black text, a 58 px navbar logo. Raised with Felix, not changed; his answers became DD-02 to DD-13 (Paper ground, Bisættelse, featured bouquet, photo direction, logo line scaling, thinner icons, logo 110 px, Ink text, 4 px radius, Linen placeholders with lazy loading, top four occasions with "Se alle" to `/anledninger`).
  - Icon weight: a comparison of Phosphor Regular, Light and Thin against the logo (`docs/design/storefront/icon-weights.png`), with measured line widths (about 1.5 / 1.1 / 0.75 px at 24 px).
- **Icon weight and delivery facts (23 Nov, logged the same day).** Felix chose Phosphor Light (DD-07) and to keep the delivery facts off the front page, on the occasion page only (DD-14). Claude had leaned towards Light too; for the delivery facts Claude's note was that P3 asks for the fee before choosing, so the risk and a test that would show it are written into DD-14.
- **Footer variants (23 Nov).** Felix found no elegant footer, so Claude built three in Figma beside his frame (`docs/design/storefront/footer-variants.png`), using the repository logo (rendered from `ref/brand/logo/logo-full-*.svg`, colour swap only) rather than the copy in Figma, and the Phosphor Light icons.
  - *What forced the variants:* at the brand minimum of 120 px for the full logo, Felix's side-by-side layout leaves about 234 px for the contact column. The email address at 16 px needs about 250 px, so A keeps his layout only with 14 px contact text, which the brand guide reserves for text nobody must act on. B and C stack instead and keep 16 px.
  - *Added beyond Felix's content, to be confirmed by him:* the address (Danish e-commerce law and CLAUDE.md override 1: name, address and CVR must be easy to find), a marked CVR placeholder, and links to Handelsbetingelser and Privatlivspolitik (a webshop needs both). Rows and links are 44–48 px high for tapping (design decision 12).
  - Measured heights at 402 px: A 335 px, B 496 px, C 516 px (Felix's original 213 px, without the additions).
- **Build starts: brand in the frontend (23 Nov).** The hi-fi set (change `hifi-design`, v2) is the design to build from. Task 1.2:
  - Fonts load through `next/font/local` from the subset files; checked in a browser at 390 px that both families load and headings use Ancizar Serif.
  - The tokens are copied into the frontend because Vercel builds only `frontend/`; a test compares every `:root` token with `ref/brand/tokens.css`. First run failed because Prettier had wrapped one value across lines in the copy; the test now compares values, not formatting.
  - DD-24 (toned-down supporting text) added as the role token `--color-text-muted` in the brand tokens and the brand guide before the copy.
  - *Found:* the font subsets do not contain ✓, ‹ or •, which the design uses. In the build these become Phosphor icons or plain words rather than fallback glyphs from another font.
- **Available dates, tasks 2.1–2.2 (25 Nov).** Built here, where the spec lives, and shared with checkout (Felix agreed after Claude's first idea, building it on the checkout branch, turned out to break the agreed merge order). One function decides which dates can be chosen; the storefront lists them and checkout checks a chosen date with the same function. Danish time throughout: 00:30 on a Tuesday in Denmark is still Monday on the server's clock, and the test covers it.
  - *Slip, caught by the test run:* a test meant to prove no capacity number leaks searched the response for "15" and failed on the date 2026-12-15. The real guarantee is that the response has no field but `dates`, which the test checks.
- **Layout, task 3.1 (25 Nov).** Built from hi-fi v2: navbar, the menu (S2) as a native `<dialog>` (focus handling and Esc for free), footer C with contact rows, CVR, legal links and payment methods (DD-08, DD-22), skip link, Danish not-found page. The menu's occasions come from the backend through a cached call that falls back to an empty list, so CI builds without a backend. Facebook link and CVR are marked placeholders. Icons are generated from the Phosphor Light files chosen in DD-07.
  - *Caught in the browser check:* the skip link, once shown, covered the menu button and swallowed clicks on it. It now appears below the navbar.
  - *Taken back:* an `overflow-x: hidden` on the page would have hidden horizontal scrolling instead of preventing it, so the 390 px check would prove nothing. Removed before measuring.
  - *Matched to the design after the first screenshot:* the open menu lacked the logo and basket that S2 shows in its top bar.
  - Verified at 390 px: scroll width 390, no visible target under 44 px, first Tab stop "Gå til indhold", Esc closes the menu. Images: `docs/design/implemented/2026-11-25-layout-menu.png`, `…-layout-404.png`.
- **Front page, task 3.2 (25 Nov).** Built from S1. The intro line "Håndbundne buketter fra Nikitas værksted i Tuse. Lige nu anbefaler hun:" is the page's `h1` (looks like plain text, tells search engines what the page is, P10); the featured bouquet and sections are `h2`. Photos are Linen areas with fixed ratios saying "Foto kommer" (DD-12, spec); placeholder prices carry "Eksempel".
  - *Deferred:* the owner-chosen featured bouquet (task D.8, DD-23) needs a migration, and the checkout branch already holds migrations 0003–0007; doing it here would collide at the merge. Until the back office, the first occasion in the owner's order is featured, which means it also appears in the grid of four. Raised with Felix.
  - *Slips:* a dev server left from the layout check still held port 3000 (stopping `npm run dev` had not stopped `next-server`), so the first check ran against it and showed no occasions; servers are now stopped by port. A text replacement did not apply because Prettier had wrapped the line first; caught because the heading check found no `h1`.
- **Skeleton wave on photo areas (25 Nov, DD-26).** Felix asked for a very light skeleton while photos load or are missing. CSS only: a band of Paper light slides across the Linen using `transform` alone (no repaint); it stops once a photo has loaded (a few lines of browser code per photo) and is off for visitors who ask for reduced motion (checked: animation "none"). The first screenshot looked empty because it caught the band at the edge; sampling the animation showed it running, and a frame paused mid-run shows it. Image: `docs/design/implemented/2026-11-25-photo-skeleton.png`.
