# Design Rationale

**Status:** v0.1, desk research only, 10 Nov 2026. To be updated after the owner interview (week 1) and the usability test (week 5).
**Related:** [Roadmap.md](Roadmap.md) · [Case Synopsis - Felix.md](Case%20Synopsis%20-%20Felix.md)

## What this document is for

Every design decision on this project must point to a reason. This document sets out those reasons before any screen is drawn, so that:

- each choice in the brand, wireframes and UI can cite a principle here (P1–P12);
- AI sessions make choices from the same ground rules instead of generic defaults;
- the exam report can show why the solution looks and works the way it does.

**The rule:** a design decision cites a principle, a law, or a test result. A decision with none of these is labelled *opinion* in the decision log and becomes a candidate for testing.

## Evidence levels

The research is uneven, so each claim carries a grade.

| Grade | Meaning | Example |
|---|---|---|
| **A** | Primary source: statute, official statistics, peer-reviewed study, or the research body's own page | Danmarks Statistik, forbrugeraftaleloven, Aggarwal et al. 2024 |
| **B** | Reputable research reported through secondary sources, with figures that vary between editions | Baymard survey figures quoted by other sites |
| **C** | Practitioner or vendor advice, or our own inference. Treat as a hypothesis to test | Florist software vendor blogs |

Several Baymard figures could not be checked against baymard.com in this pass. They are graded B and quoted as ranges. **Before the report:** confirm them on Baymard's own pages.

---

## 1. Context: what we design for

### The shop

- A local florist whose customers today find and order via social media (case synopsis).
- The goods are perishable, often made by hand, and often gifts. A bouquet is bought for a date (a birthday, a funeral, Mors dag), not as a product to keep.
- Demand spikes on a few days (Valentinsdag, Mors dag, Christmas) and is capped by how much the shop can make and deliver per day.

### The Danish online shopper

| Fact | Grade | Source |
|---|---|---|
| Mobile accounts for about half of online purchases (49%) | B | DI e-commerce tracker 2025 [5] |
| MobilePay was the payment method at last checkout for about 4 in 10 Danes (39–40%) | B | DI tracker 2025 [5], Searchmind on E-handelsanalysen 2025 [7] |
| 74% trust Danish webshops to follow consumer rules, and trust in foreign shops is much lower | B | Dansk Erhverv [9] |
| Almost 3 in 4 feel safer buying from an e-mærket shop | B | Dansk Erhverv [10] |
| 48% of Danes aged 16–74 used generative AI tools in 2025, and 37% used AI weekly | A | Danmarks Statistik [11] |

### Who we design for (hypotheses, grade C)

These are assumptions until the owner interview and the shop's Instagram insights confirm or replace them.

1. **The gift sender.** Orders for someone else, on a phone, often arriving from an Instagram post. Cares about: will it arrive on the right day, will it look like the picture, what does it cost in total.
2. **The local regular.** Lives nearby and knows the shop. Wants to reserve a bouquet for pickup quickly.
3. **The occasion buyer.** Sympathy flowers or a wedding. Under time pressure or emotional strain. Needs a calm, clear flow and reassurance.

A plausible risk: social media traffic opens in Instagram's in-app browser, which has a small viewport, may lose cart state, and limits wallet payments. We will test checkout in that browser.

---

## 2. Design principles

### P1. Mobile first, built for the in-app browser

**Evidence:** about half of Danish online purchases happen on a phone (B) [5]. Our traffic source, social media, is almost entirely mobile (C). Secondary sources report that abandonment on mobile is far higher than on desktop (about 86% vs 70%, B) [1].
**So we:** design every screen at 390 px first. Keep the main action within thumb reach. Use a single column. Use full-width buttons and tap targets of at least 44 px. Do no hover-only interaction.
**Verify:** usability test on participants' own phones, including a link opened from Instagram.

### P2. The delivery date comes first

**Evidence:** for flowers, the date *is* the product. A bouquet a day late has no value. Baymard recommends showing a concrete delivery date, not a shipping speed, and reports that many sites fail to (B) [3]. Florist practice: Farmgirl Flowers asks for postcode and date first, then shows only what can arrive. Florist platforms treat a date picker with capacity limits as a must-have (C) [12][13].
**So we:**
- ask "When should it arrive?" early (product page or before the cart), not as the last checkout field;
- show the order cut-off time plainly ("Bestil inden kl. 12 for levering i dag");
- grey out closed days and full days, and say why;
- keep delivery *date* separate from delivery *window*, and promise only what the shop can keep.
**Verify:** in testing, can a participant tell the delivery day before paying, without help?

### P3. No surprise costs

**Evidence:** extra costs found late (delivery, fees) are the most-cited reason for abandoning checkout, at about 39–48% of abandoners across survey editions (B) [1][2].
**So we:**
- show the delivery fee on the product page or from the first postcode entry;
- check the postcode against the delivery zone *before* checkout, so an out-of-area customer learns at once and is offered pickup;
- show all prices including VAT (also a legal requirement).
**Verify:** the total at the first checkout step equals the amount charged.

### P4. Guest checkout only

**Evidence:** about 18–19% of abandoners cite forced account creation (B) [2][14]. A florist's customers often buy once a year.
**So we:** offer no account wall and no login. The form collects only what fulfilling the order needs: buyer, recipient, date, card message and payment. Each extra field has to justify itself against GDPR data minimisation.
**Verify:** count the checkout fields, then try to remove one more.

### P5. Pay the way Danes pay

**Evidence:** MobilePay is the most common payment method at checkout in Denmark (B) [5][7].
**So we:** show MobilePay prominently next to card (Dankort, Visa/Mastercard), and treat it as a requirement when choosing a payment provider.
**Verify:** the provider supports MobilePay in test mode in week 3.

### P6. The photos are the product

**Evidence:** on a product page, 56% of test subjects first explore the images, and 42% try to judge size from them. 28% of sites show no image that conveys scale (B, Baymard's own pages) [4]. For flowers, colour and size decide whether the gift matches expectation.
**So we:**
- use only the owner's own photos at launch. No stock or AI images (roadmap rule; CLAUDE.md override 4);
- shoot each product as: main image on a consistent neutral background, plus one image in hand or on a table for scale, plus one detail;
- use the same light, angle and background across the range, so the grid reads as one collection;
- state the size in words as well ("ca. 40 cm høj").

**Not decided:** whether a neutral or a styled main image sells better. The published "lifestyle vs white background" lifts come from vendor blogs and conflict (C) [15]. We start neutral for consistency and treat it as a test.
**Verify:** in testing, ask participants how big they expect the bouquet to be and compare their answer with the real size.

### P7. Speed is a design constraint

**Evidence:** in a Deloitte study commissioned by Google, a 0.1 s mobile speed improvement went with 8.4% more retail conversions and 9.2% higher order value (B: 2020 data, 37 brands) [6]. Google's "good" Core Web Vitals thresholds are LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1 (A) [16].
**So we:**
- set budgets before visual design: at most two font families, served from our own domain and subset;
- give every image fixed dimensions (no layout shift) and a modern format;
- use no shader effects, scroll scenes or autoplay video. taste-skill also rules these out for "place" businesses such as florists;
- render pages on the server.
**Verify:** Lighthouse and field data on home, product and checkout, recorded with a date each week.

### P8. Trust is local and real

**Evidence:** Danes trust Danish shops far more than foreign ones (B) [9]. Trust marks matter to most buyers (B) [10]. Fake reviews are a known problem, and the Consumer Ombudsman treats them as unlawful marketing (A/B) [17].
**So we:**
- show what makes the shop local: the real shop name, address, CVR number, phone and photos of the shop and the people;
- show only real reviews, quoted with permission, or none. We never invent testimonials;
- treat e-mærket as an option for the owner to decide, not a design element we add on our own;
- use plain Danish copy about delivery, freshness and complaints.
**Verify:** usability test question: "Would you trust this shop with your card? Why or why not?"

### P9. Accessible by default (WCAG 2.1 AA)

**Evidence:** the European Accessibility Act applies to consumer e-commerce in Denmark from 28 June 2025 through *tilgængelighedsloven* (A/B) [18][19]. Microenterprises (under 10 staff and €2M turnover) providing services may be exempt, but the Danish wording is **not yet confirmed** [20].
**So we:** design to AA whether or not the exemption applies. It costs little at the start and much later. It also helps older gift senders and people on small screens in sunlight.
- Text contrast is at least 4.5:1, and 3:1 for large text and UI parts, checked when the palette is chosen, not after.
- Colour is never the only signal (sold out, errors).
- Every field has a visible label, and every error is shown under its field.
- The whole flow works by keyboard and with reduced motion.
**Verify:** automated check plus a manual keyboard pass in week 5. Check the exemption against the act's text with the owner.

### P10. Written to be found and quoted (SEO + GEO)

**Evidence:** in the GEO study, adding citations, quotations and statistics raised a source's visibility in generative engine answers by up to about 40%, and keyword stuffing did not help (A: Aggarwal et al., KDD 2024) [8]. Nearly half of Danes use generative AI (A) [11].
**So we:**
- write factual, server-rendered pages that answer what people ask: delivery area and fees, cut-off times, opening hours, prices, flower care and occasions (what suits a funeral, for example);
- state concrete facts ("Levering i [postnumre] alle hverdage, 59 kr.") rather than marketing language;
- add structured data for the business (`Florist`/`LocalBusiness`) and products, and keep name, address and phone identical everywhere.
**Verify:** structured-data validator; later, ask AI assistants local questions and record whether the shop appears.

### P11. A brand from the shop, not from a template

**Evidence:** none in the statistical sense. This is a quality stance from the roadmap ("no slop"). The `brand-identity` skill gives the framework, and `design-taste-frontend` gives the anti-generic rules.
**So we:**
- build the identity from the shop's real material: its name, the shopfront, the owner's style, the flowers it actually sells;
- follow the five parts of `brand-identity`: logo system, colour, type, imagery, motion. Each must work at 16 px, in one colour, and at AA contrast;
- avoid category clichés unless the owner's style really is that, for example generic pastel pink with a script font. (This is an *opinion*, logged as such.)
- record in the decision log any palette or type pairing that taste-skill's random "deal" suggests, with the reason it was kept or rejected (CLAUDE.md override 3).
**Verify:** owner sign-off, and an outsider can match the site to the shop's Instagram.

### P12. Legal clarity is part of the UX

**Evidence:** forbrugeraftaleloven § 18, stk. 2, nr. 4 excludes goods that deteriorate quickly from the 14-day right of withdrawal. Cut flowers usually qualify, and bouquets made to the customer's wishes also fall under nr. 3. The exception is read narrowly by the Consumer Ombudsman (A/B) [21][22].
**So we:**
- state in plain words, at checkout and in the terms, that the right of withdrawal does not apply to fresh flowers, and why;
- **do not** extend that statement to non-perishable add-ons such as vases or cards. Those keep the 14-day right. The product data model must mark which items are perishable;
- explain what happens if something is wrong on delivery (the complaint path).
**Verify:** the owner reviews all legal texts. Check against the consolidated act (LBK nr. 1184 af 28/09/2025) on retsinformation.dk.

---

## 3. Competitive baseline (unverified, grade C)

The national networks set customer expectations. Figures below come from third-party pages and reviews and must be checked against the live sites before they are used in the report [23].

- **Interflora Danmark:** delivery fee reported around 79 kr. Same-day cut-off reported anywhere between 12:00 and 16:00 depending on area. Delivery 09–19 with no exact time guaranteed. Reviews mention late deliveries.
- **What this means for us:** we can't beat a network on reach. We can beat it on *certainty and closeness*: one cut-off time, a delivery area we really cover, a day we keep, and photos of the actual bouquets from the actual shop.

---

## 4. How the AI skills fit this rationale

| Skill | Used for | Limits |
|---|---|---|
| `brand-identity` | Structure for the brand system (P11) | Assumes a brand direction exists. We get that from the owner |
| `design-taste-frontend` (taste-skill) | Anti-generic layout and copy rules, copy-lint, layout checker and finish gate (P1, P7, P9) | Its demo-site rules are overridden (CLAUDE.md 1–4) |
| `brand-guidelines` | Format model for our future florist brand-guidelines skill | Contains Anthropic's brand. Never applied |

The Mobbin skills (`redesign-screen`, `search`, `best-practices`, `plain-writing`) were removed on 2026-11-11: no paid plan. See [the skill curation note](../docs/process/2026-11-10-skill-curation.md).

---

## 5. Decision log format

Each significant design decision is added to a decision log (location decided in week 1) in this shape:

```
### D-012 Delivery date picker on the product page
Date: 2026-11-18 · Principles: P2, P3 · Evidence grade: B
Decision: Date and postcode are chosen on the product page; the cart shows the total incl. delivery.
Rejected: Date as the last checkout field (hides the core constraint until the end).
Test: Usability task 2, "Order flowers for Friday".
```

---

## 6. What to research next (primary research)

Desk research gives the starting principles. These will confirm or replace them:

1. **Owner interview (week 1):** share of orders by occasion, delivery or pickup, typical order value, peak days and capacity, recurring questions in DMs, cut-off and delivery area.
2. **Instagram insights (week 1):** follower location and age, share of mobile, which posts lead to orders.
3. **Short customer survey via the shop's Instagram (week 1–2):** how they order today, what made them hesitate, whether they use MobilePay.
4. **Usability test (week 5):** 3–5 people, own phones, tasks drawn from P1–P6.
5. **Confirm grade-B facts:** Baymard's own pages for P2–P4. The Danish EAA microenterprise wording for P9.

---

## Sources

Accessed 10 Nov 2026. The grades refer to how the figure was obtained in this pass, not to the quality of the original research.

1. Baymard Institute cart abandonment figures, via secondary summaries: [Red Stag Fulfillment](https://redstagfulfillment.com/percentage-of-online-shoppers-abandon-their-cart/), [Tidio](https://www.tidio.com/blog/shopping-cart-abandonment-statistics/). Primary to check: baymard.com/lists/cart-abandonment-rate
2. Baymard abandonment reasons, via [Contentsquare](https://contentsquare.com/guides/cart-abandonment/reasons/), [Shopify](https://www.shopify.com/enterprise/blog/44272899-how-to-reduce-shopping-cart-abandonment-by-optimizing-the-checkout), [Baymard: reduce cart abandonment](https://baymard.com/blog/reduce-cart-abandonment)
3. Baymard, [Use "Delivery Date" not "Shipping Speed"](https://baymard.com/blog/shipping-speed-vs-delivery-date); [Checkout UX Best Practices 2026](https://baymard.com/research-articles/current-state-of-checkout-ux)
4. Baymard, [In-scale product images](https://baymard.com/research-articles/in-scale-product-images); [Guideline 741](https://baymard.com/guidelines/741-visually-indicating-product-scale)
5. Dansk Industri, [Danskernes årlige e-commerce tracker 2025](https://www.danskindustri.dk/vi-radgiver-dig/ecommerce/di-e-commerce-analyser/analyser/2026/danskernes-arlige-e-commerce-tracker-2025/)
6. Deloitte / Google, [Milliseconds Make Millions](https://www2.deloitte.com/content/dam/Deloitte/ie/Documents/Consulting/Milliseconds_Make_Millions_report.pdf); [web.dev case study](https://web.dev/case-studies/milliseconds-make-millions)
7. Dansk Erhverv, [E-handelsanalysen 1. halvår 2025](https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2025/september/e-handelsanalysen-1.-halvar-2025-er-klar-her-er-6-ting-du-skal-vide-om-danskernes-forbrug-pa-nettet/); [Searchmind summary](https://www.searchmind.dk/on-our-mind/e-handelsanalysen-2025-marketing-bundlinje); [Hvordan betaler forbrugerne online?](https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2026/april/hvordan-betaler-forbrugerne-online-fa-svarene-her/)
8. Aggarwal et al., *GEO: Generative Engine Optimization*, KDD 2024: [arXiv 2311.09735](https://arxiv.org/pdf/2311.09735v2.pdf); [Princeton record](https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization/)
9. Dansk Erhverv, [Tillid til e-handel er i top](https://www.danskerhverv.dk/presse-og-nyheder/nyheder/tillid-til-e-handel-er-i-top)
10. Dansk Erhverv, [Tillid er afgørende for dine kunder](https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2026/februar/tillid-er-afgorende-for-dine-kunder-sadan-skaber-du-den/); [Trustmarks](https://www.danskerhverv.dk/branche/digital-handel/trustmarks/)
11. Danmarks Statistik, [NYT: generative AI use 2025](https://www.dst.dk/da/Statistik/nyheder-analyser-publ/nyt/NytHtml?cid=51815); [weekly AI use](https://www.dst.dk/da/Statistik/udgivelser/NytHtml?cid=52821). Context: Dansk Erhverv, [Over halvdelen af danskerne har brugt ChatGPT](https://www.danskerhverv.dk/politik-og-analyser/analyser/2025/september/over-halvdelen-af-danskerne-har-brugt-chatgpt-eller-andre-sprogmodeller/)
12. [Farmgirl Flowers shop](https://farmgirlflowers.com/shop) (observed pattern)
13. Hana, [Essential florist e-commerce features](https://www.hanafloristpos.com/blog/florist-ecommerce-website-features/); NuFlorist, [Delivery dates for a flower shop](https://nuflorist.com/blog/shopify-delivery-dates-flower-shop/) (vendor sources)
14. Baymard via Amazon Pay, [How forcing sign-ups drives down sales](https://pay.amazon.com/blog/the-baymard-report-series-how-forcing-sign-ups-drives-down-sales)
15. [Nightjar: lifestyle vs white background](https://nightjar.so/blog/lifestyle-vs-white-background-product-photos); [Pixc](https://pixc.com/blog/white-background-vs-lifestyle-product-photos/) (vendor sources, conflicting figures)
16. Google, [Web Vitals](https://web.dev/articles/vitals) (thresholds at the 75th percentile)
17. Tænk, [Masser af falske anmeldelser på Trustpilot](https://taenk.dk/forbrugerliv/elektronik-og-digitale-tjenester/masser-af-falske-anmeldelser-paa-trustpilot)
18. Bech-Bruun, [Implementation of the Accessibility Act in Denmark](https://bechbruun.com/insights/news-and-cases/implementation-of-the-accessibility-act-in-denmark/)
19. Dinero, [Tilgængelighedsloven](https://dinero.dk/nyheder/tilgaengelighedslov/)
20. e-include, [The European Accessibility Act](https://e-include.eu/web-accessibility/european-accessibility-act/); [Xictron on microenterprise exemptions](https://www.xictron.com/en/blog/accessibility-act-exemptions-microenterprises-2026/) (German law focus, check the Danish text)
21. Lovguiden, [Forbrugeraftaleloven § 18](https://www.lovguiden.dk/loven/forbrugeraftaleloven/18?stk=2-4); [Praksisoversigt: blomsterbutik](https://www.lovguiden.dk/praksisoversigt/branche/blomsterbutik)
22. Dansk Erhverv, [Flaskevand er omfattet af fortrydelsesretten](https://www.danskerhverv.dk/presse-og-nyheder/nyheder/2018/juni/forbrugerombudsmanden-flaskevand-kobt-pa-nettet-er-omfattet-af-fortrydelsesretten/) (narrow reading of the exception)
23. [Interflora Danmark on Trustpilot](https://www.trustpilot.com/review/www.interflora.dk?page=5); [Ældre Sagen partner page](https://www.aeldresagen.dk/tilbud-og-rabatter/samarbejdspartnere/bolig-og-have/interflora/offers/interflora); [TechRadar DK comparison](https://global.techradar.com/da-dk/deals/send-blomster-bedste-blomsterhandlere-online)
