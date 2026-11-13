# Lo-fi wireframes: back office (2026-11-12)

OpenSpec change: [wireframe-back-office](../../openspec/changes/wireframe-back-office/design.md)
File: [Ref/wireframes/lofi/d-back-office.html](../../Ref/wireframes/lofi/d-back-office.html), linked as tab D from the overview.

## Goal

Sketch the owner's side of the shop next to the three storefront directions, so the owner review shows both halves. The real goal: show that the admin *relieves* her. She says she is too busy to run a webshop, so every screen has to take less time than the phone calls it replaces.

## Inputs

- Felix's finding (11 Nov): her main sale is a phone call where the customer gives an occasion and a budget, and she designs the bouquet. She says she is too busy to get a shop running.
- Felix asked for "a backend POS where you can easily update prices and categories, photos and sales".
- [Roadmap](../../Ref/Roadmap.md): custom minimal admin (week 2: products, images, sold out; week 4: orders by delivery date, slip, capacity per date; week 5: strong admin auth). Discount codes out of scope.
- [Design-Rationale](../../Ref/Design-Rationale.md): P1 mobile, P2 date first, P4 minimal data, P6 photos, P7 speed, P9 sold out in words.
- The existing lo-fi kit and [storefront note](2026-11-11-lofi-wireframes.md).

## Options considered

- **"POS" as an in-store till** (card terminal, receipts, stock shared with the counter). Rejected for this change: it means hardware, a terminal agreement and bookkeeping rules, and it's not a 6-week job. Read as "webshop admin" instead and stated on the page.
- **Wait for the storefront model** (budget flow vs catalogue) before sketching. Rejected: how big the admin gets is an argument in that choice. A budget model means much less upkeep for her. Both models are drawn, and the notes say what drops out.
- **A separate wireframe folder for admin.** Rejected: the owner review should show one set. D is the fourth tab.
- **A hamburger menu.** Rejected for a bottom tab bar: she uses the same 4 places every day, and the tab bar keeps them in thumb reach (P1).
- **A desktop admin.** Rejected: she works from her phone in the shop (P1). It can widen later.

## Decisions

- Seven screens in the order of her day: log ind, ordrer i dag, ordre, produkter, ret produkt, buketter & kapacitet, salg. (P1, roadmap weeks 2/4)
- Orders sorted by delivery date and window, today first, with a capacity line. (P2)
- Status in one tap on a segmented bar. The order slip has the card message. (Roadmap week 4)
- Only photo, name, price and category are required to publish a product. Everything else is folded away. Target: under a minute. (P1, P6)
- Sold out and hidden are toggles in the list, so she doesn't have to open the product. (P9)
- The budget tiers are a setting: price plus one line, an optional free amount with a minimum. Capacity per day, cut-off time and closed days sit on the same screen. (P2, Felix's finding)
- "Salg" is read as an overview of orders and revenue against the previous period, not discounts. Whether she wants a sale price is an open question, marked "?" on screen 5. (*Opinion*: the overview is cheap and shows her the shop works.)
- Sign-in with a second factor (passkey or code) and "remember this phone for 30 days". (Roadmap week 5. The 30 days is *opinion*.)
- Every frame's notes give a time cost ("1 tryk", "< 1 min") to support the pitch "hjemmesiden tager telefonen for dig". (*Opinion*)
- Four classes added to `wf.css` (toggle, list row, stat tile, tab bar). The existing classes are untouched.

## How it was checked

- A, B and C were screenshotted with headless Chrome before and after the `wf.css` additions. The files are byte-identical, so nothing changed for them.
- D rendered at desktop width (1800 px): all 7 frames laid out, with notes under each frame.
- Overflow at phone width: headless Chrome on Windows won't go below 500 px, so the overview and D were measured inside 390 px iframes (375 px usable). There was no horizontal overflow, and every frame was 343 px wide.
- Each spec scenario in `specs/back-office/spec.md` can be pointed to in a frame or its note. Every frame has 3-4 notes.
- Nav: all five pages link to all five, and `aria-current` marks the right tab.
- Not checked: keyboard or contrast (lo-fi is not the product). Not tested with the owner yet.

## Dead ends and changes of mind

- Screen 7 first showed "oktober: 0" next to November. It read like a bug rather than "the first month", so it now says "første måned".
- Felix said "POS". The first reading was an in-store till, and it was changed to the webshop admin after the explore session (see Options).

## Open questions

- Budget bouquets, fixed catalogue, or both? This decides how much of screens 4-6 she maintains.
- Does she want a sale price per product?
- Does anyone else use the admin (staff, a courier)?
- Order notifications: email only, or also SMS or push?
- Does the customer get an email when the status changes to "Klar / ude"?
- Tier names and prices (300 / 450 / 600, minimum 250) and capacity (8 per day) are placeholders until the owner interview.
