# Roadmap: Florist E-commerce Solution

**Period:** 10 Nov – 20 Dec 2026 (6 weeks)
**Source:** [Case Synopsis - Felix.md](Case%20Synopsis%20-%20Felix.md)

## Goal

Move a local florist from social-media-only sales to an API-driven full-stack webshop that handles the whole customer flow without manual steps: browse, order, pay, confirm, fulfil.

**Done means:** a real customer can order and pay for a bouquet on a phone, receives a confirmation email automatically, and the florist sees the order in an admin view and can process it. The site is fast, findable, secure and GDPR-compliant.

## Assumptions to confirm in week 1

These are not stated in the synopsis. Each one changes the plan if it is wrong.

| # | Assumption | If wrong |
|---|---|---|
| 1 | Hand-in is around 20 Dec 2026 | Shift week 6 |
| 2 | The florist is a real business that will actually go live | If demo only, drop production payment and domain work in week 6 |
| 3 | A written report or exam presentation is part of the deliverable | If not, the documentation track shrinks to handover docs |
| 4 | Delivery is local (own delivery + pickup in store), not national shipping | National shipping adds a carrier integration |
| 5 | Catalog is small (roughly 20–60 products) | A large catalog needs search and filtering earlier |

## Scope

**In scope**

- Storefront: catalog, product page, cart, checkout
- Florist-specific ordering: delivery date, delivery or pickup, recipient different from buyer, card message, order cut-off time
- Payment through a third-party provider (hosted fields, no card data on our server)
- Transactional email: order confirmation to the customer, new-order notice to the florist
- Admin: products, stock/availability, orders and order status
- SEO and GEO, web performance, security, GDPR

**Out of scope for the 6 weeks**

- Customer accounts and login (guest checkout only)
- Subscriptions, gift cards, discount codes
- Multi-language, accounting integration, national carrier integration
- Marketing email and newsletter

## Decisions to lock in week 1

Recommendations are a starting point, not a final choice.

| Decision | Recommendation | Why | Check before committing |
|---|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Server rendering gives SEO and performance by default; API routes keep one codebase | — |
| Database | PostgreSQL in an EU region, with a typed ORM | Relational fit for orders; EU region simplifies GDPR | Provider's data processing agreement |
| Payment | Stripe, or a Danish gateway (Quickpay, Frisbii) | Hosted fields keep PCI scope minimal | MobilePay and Dankort support, fees, payout time. Danish customers expect MobilePay |
| Email | Transactional API provider (Postmark, Resend or similar) | Deliverability and logs beat a raw SMTP relay | EU data handling, sending-domain setup |
| Hosting | Managed platform with EU region and preview deploys | Preview URL per change makes review and owner feedback fast | Where function and log data is stored |
| Admin | Custom minimal admin inside the same app | Avoids running a separate CMS for a small catalog | Revisit if the owner needs rich content editing |

## How we work: AI-driven, no slop

AI writes most of the code and drafts. A human owns every decision and every merge.

1. **Spec before code.** Each feature starts with a short written spec: what it does, acceptance criteria, edge cases. AI implements against the spec, not against a vague prompt.
2. **Small vertical slices.** One feature per branch, working end to end. No large generated dumps.
3. **Every diff is read.** Nothing merges that Felix cannot explain line by line. This also matters for the exam.
4. **Tests are the gate.** Order, price and payment logic have automated tests. Checkout has an end-to-end test. CI must be green to merge.
5. **Verify in the running app.** A feature is done when it has been clicked through on a phone-sized screen, not when the code compiles.
6. **Real content only.** Product photos, prices, descriptions and the shop's story come from the florist. AI may edit and structure text; it does not invent products, reviews, claims or imagery.
7. **Measured, not asserted.** Performance, accessibility, SEO and security claims are backed by a tool result or a test, recorded with a date.
8. **Dependencies are chosen, not accumulated.** Each new package needs a reason. Prefer the platform.
9. **Decision log.** Each significant choice gets three lines: what, why, what was rejected. This becomes report material.
10. **AI use is documented.** Note where AI was used and how the output was verified, so the process can be accounted for academically.

## Timeline

| Week | Dates | Theme | Milestone |
|---|---|---|---|
| 1 | 10–15 Nov | Discovery and foundation | Scope signed off, skeleton deployed |
| 2 | 16–22 Nov | Storefront and catalog | Products browsable, cart works |
| 3 | 23–29 Nov | Checkout and payment | Test-mode order paid end to end |
| 4 | 30 Nov – 6 Dec | Automation and admin | Order flow runs with no manual steps |
| 5 | 7–13 Dec | Hardening | Security, GDPR, performance and SEO verified |
| 6 | 14–20 Dec | Launch and handover | Live (or demo-ready), documented, handed in |

Feature freeze is the end of week 4. Weeks 5 and 6 add no new features.

---

### Week 1: Discovery and foundation (10–15 Nov)

Week 1 starts on a Tuesday, so it is short.

- Interview the florist: current order flow on social media, pain points, product range, prices, delivery area and fees, opening hours, cut-off times, peak days, who handles orders
- Collect assets: logo, photos, product list, CVR number, contact details
- Confirm the assumptions and lock the decisions above
- Map the customer flow and the florist's order-handling flow, current and target
- Data model: product, variant (size), order, order line, delivery, customer details
- Wireframes for the five key screens: home, category, product, cart, checkout
- Repo setup: project scaffold, linting, formatting, test runner, CI, preview deploys, environment handling, project instructions file for AI sessions
- Open accounts: hosting, database, payment (test mode), email

**Exit criteria:** owner has approved scope and wireframes. An empty app deploys automatically from `main`. Data model is migrated to the database.

### Week 2: Storefront and catalog (16–22 Nov)

- Design system: colours, typography, spacing, buttons, form fields, product card. Mobile first
- Home, category and product pages, server-rendered
- Image pipeline: responsive sizes, modern formats, lazy loading, defined dimensions
- Cart: add, change quantity, remove, persists across reload
- Admin: login for the florist, create/edit/hide products, upload images, mark sold out
- SEO built in from the start: semantic HTML, titles and meta descriptions, clean URLs, sitemap, robots.txt, `Product` and `Florist` structured data
- Enter the first 10 real products

**Exit criteria:** the owner can add a product in the admin and see it on the site. A visitor can browse and fill a cart on a phone. Lighthouse baseline recorded.

### Week 3: Checkout and payment (23–29 Nov)

The highest-risk week. Start with payment integration on day one.

- Checkout form: buyer details, recipient details, delivery or pickup, delivery date picker respecting cut-off time and closed days, postal-code delivery zone and fee, card message
- Server-side validation of everything. Prices and totals are calculated on the server, never trusted from the client
- Payment provider integration with hosted fields or hosted checkout
- Webhook handler: signature verification, idempotency, order marked paid only on confirmed webhook
- Order state machine: pending, paid, in progress, ready, delivered, cancelled, refunded
- Failure paths: declined card, abandoned payment, duplicate submit, sold out during checkout
- Terms acceptance and legal pages linked from checkout
- Tests: unit tests for price and delivery rules, end-to-end test for a full purchase

**Exit criteria:** a test-mode order goes from cart to "paid" in the database with correct totals. Declined and abandoned payments leave no paid order. Checkout end-to-end test runs in CI.

### Week 4: Automation and admin (30 Nov – 6 Dec)

- Order confirmation email to the customer: items, delivery date, total incl. VAT, shop contact details
- New-order notification to the florist
- Status emails where useful (ready for pickup, out for delivery)
- Sending domain authenticated: SPF, DKIM, DMARC
- Email sending is queued and retried, so a provider outage does not lose a confirmation
- Admin order view: today's and upcoming orders sorted by delivery date, status changes, printable order slip with card message
- Stock and availability: sold-out handling, daily capacity limit per delivery date if the owner wants it
- Refund and cancellation flow from admin
- Owner walkthrough of the full flow on the preview site. Collect feedback

**Exit criteria:** an order placed on the site reaches the florist and confirms to the customer with no manual step. The owner has processed a test order alone. **Feature freeze.**

### Week 5: Hardening (7–13 Dec)

**Security**

- Review against OWASP Top 10: access control on admin routes, injection, input validation, session handling
- Security headers: CSP, HSTS, frame and referrer policy
- Rate limiting on checkout, login and contact endpoints
- Secrets only in environment config. Repo history scanned for leaks
- Dependency audit. Admin login protected with strong auth (two-factor if the provider allows)
- Database backups configured and a restore tested once

**GDPR and Danish e-commerce rules**

- Data map: what personal data is collected, why, where it is stored, for how long
- Data processing agreements in place with hosting, database, payment and email providers
- Privacy policy and cookie policy. Consent banner only if non-essential cookies are used. Aim for none
- Retention rule: order data kept as required by bookkeeping law, everything else deleted or anonymised on schedule
- Procedure for access and deletion requests
- Terms of sale: prices incl. VAT, delivery terms, complaint rights, CVR and contact details. State clearly that the right of withdrawal does not apply to perishable goods such as fresh flowers
- Have the legal texts checked by the owner. They are the data controller

**Performance**

- Core Web Vitals within "good" thresholds on mobile for home, product and checkout
- Image, font and JavaScript budget reviewed. Caching strategy set

**SEO and GEO**

- Unique titles, descriptions and structured data validated on all page types
- Local SEO: consistent name, address and phone. Google Business Profile linked to the site
- Content AI search can quote: clear factual pages on delivery area, prices, opening hours, occasions and a real FAQ, all server-rendered
- AI crawlers allowed in robots.txt. `llms.txt` added as a low-cost experiment, its effect is unproven
- Search Console set up and sitemap submitted

**Quality**

- Accessibility pass to WCAG 2.1 AA: keyboard, contrast, form labels, error messages
- Usability test with 3–5 people ordering on their own phone. Fix the top issues
- Cross-browser check: iOS Safari, Android Chrome, desktop

**Exit criteria:** every claim in the synopsis (performance, SEO/GEO, security, GDPR) has a dated, recorded result behind it. No open critical or high issues.

### Week 6: Launch and handover (14–20 Dec)

- Full real catalog and content entered and proofread by the owner
- Production payment account live. One real low-value purchase and refund completed
- Domain, DNS and HTTPS. Redirects and links from the shop's social profiles
- Monitoring: error tracking, uptime check, alert on failed webhooks and failed emails
- Soft launch to existing social media followers
- Handover: short owner manual (add a product, handle an order, refund), credentials transferred to the owner's own accounts, technical README
- Report and presentation finalised from the decision log and recorded results
- Final two days are buffer. No changes to production other than fixes

**Launch timing risk:** this week falls in the Christmas peak. If the owner does not want a new system during their busiest days, run a limited soft launch (pickup only, or a small product selection) and move full launch to early January. Decide this in week 1.

**Exit criteria:** real or demo order completed in production. Owner can run the shop without Felix. Deliverables handed in.

---

## Running tracks (every week)

- **Owner check-in:** fixed weekly slot, show the preview site, get a decision on open questions
- **Documentation:** update the decision log and save evidence (screenshots, test results, measurements) as it is produced, not in week 6
- **Friday review:** compare against the week's exit criteria. If a week slips, cut scope from the list below instead of pushing into weeks 5 and 6

## If time runs short, cut in this order

1. Status emails beyond the order confirmation
2. Daily capacity limits
3. Refund from admin (do it in the payment provider's dashboard instead)
4. `llms.txt` and extra GEO content pages
5. Printable order slip

Never cut: server-side price validation, webhook verification, order confirmation email, legal pages, backups.

## Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Payment provider approval takes longer than expected | No live payments at launch | Apply in week 1 with the owner's CVR and bank details |
| Owner is slow to deliver photos, prices and texts | Empty shop at launch | Request assets in week 1, set a deadline end of week 3, enter the first 10 products in week 2 |
| Scope creep from owner wishes | Core flow unfinished | Out-of-scope list agreed in week 1, new wishes go to a "later" list |
| AI-generated code that is not understood | Bugs in payment logic, weak exam defence | Working rules 3 and 4, plus extra manual review of checkout and webhook code |
| Emails land in spam | Customers think the order failed | Authenticated sending domain in week 4, test against major mailbox providers |
| Launch collides with Christmas peak | Owner overloaded, bad first impression | Soft-launch decision made in week 1 |
| Legal texts are wrong | Liability for the owner | Use recognised Danish templates as a base, owner reviews and approves |
