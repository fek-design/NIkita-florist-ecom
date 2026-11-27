# Owner interview guide, 27 Nov 2026

**For:** Felix, running the session with the owner in person.
**Related:** [first interview and open questions](../process/2026-11-16-owner-interview.md) · [decision log](../design-decisions.md) · [process note](../process/2026-11-19-storefront.md)

## Purpose

The owner's first look at the built shop. She tests **her own side**: what reaches her when an order comes in, and how it fits her paper-and-pinboard way of working. She also gives the numbers that only she knows, which today are placeholders in the system.

She does **not** test the customer flow. She is not a customer, and a half-built flow tested by the expert gives opinions, not behaviour. The customer flow goes to 3–5 test persons once the cart, checkout and desktop layouts are built (roadmap week 5).

**Rule for every question:** it must fill a placeholder or settle a decision in the system. No "how does it feel?" or "do you like it?". Where a question does not lead to something we would build or change, drop it. "Last time" questions (what happened at the last real order) beat "would you" questions, because they give facts instead of guesses.

## Setup (before she arrives)

- Laptop: Docker running (Postgres, Mailpit), `npm run dev -w backend`, frontend started so the phone can reach it (see "Running on the phone" below).
- Stripe CLI forwarding webhooks (`stripe listen --forward-to localhost:4000/webhooks/stripe --events ...`), so a paid test order fires the emails.
- Figma open on the back-office screens (B1–B8) and the paper slip (P1).
- Printed: the postcode list (from the first interview note), this guide.
- Ask at the start: may we take notes and quote her (anonymously if she prefers) in the project documentation?

### Running on the phone

Felix's phone on the same Wi-Fi as the PC. Before the session, check on the phone that the front page loads from the PC's address (for example `http://192.168.x.x:3000`) and that a test payment returns to the order page, not to `localhost`.

## Part 1: Her day with an order (about 15 min)

**T4.** Felix places a test order on his phone in front of her (delivery tomorrow, card message filled in) and pays with Stripe's test card. Then:

> "Ordren er kommet ind. Her er mailen, du får. Vis mig, hvad du gør, fra mailen til buketten er kørt."

Open the slip in Mailpit and print it through the normal print dialog. Then walk the Figma back office only where her answer needs it (marking an order done, sold out, closed days).

Observe, do not help. Note where she hesitates, what she reads first on the slip, and what she says is missing.

| Watch for | Decides |
|---|---|
| What she reads first on the slip; anything she has to search for | Order and size of the fields on the slip (P1) |
| Whether she would print every order, or only some | Whether printing stays manual or a print-on-arrival option is worth building |
| What she does when it is done (crosses out, removes the slip, nothing) | Whether the back office needs a "done" step at all (DD-16 to DD-21) |

## Part 2: The numbers only she knows (about 20 min)

Ask with the screen or the slip in front of her, so the question has a concrete place.

| # | Question (Danish, as asked) | Placeholder today | Decides |
|---|---|---|---|
| 1 | *(Show the postcode list.)* "Stræg dem, du ikke kører til." | 15 postcodes, unmeasured | The delivery zone (open question 1) |
| 2 | "Hvornår har du åbent, og hvornår kan folk hente?" | Mon–Fri 10–17, Sat 10–14 | Opening hours and pickup slots (2) |
| 3 | "Hvornår kører du ud? Hvis en bestilling kommer kl. 11, kan du så nå den samme dag?" | Cut-off 12:00 | Same-day cut-off and the delivery round (3, 10) |
| 4 | "Hvor mange buketter nåede du på din travleste dag sidste år?" | 15 a day | Daily capacity (3) |
| 5 | "Hvor mange afhentninger kan du have klar på én time?" | 4 per hour | Pickups per slot (8) |
| 6 | "Hvilke anledninger sælger du mest til, og hvad koster de i lille, mellem og stor?" | 5 occasions, example prices | The occasion list and prices (4), the featured bouquet |
| 7 | "Fortæl om de sidste tre bestillinger på Messenger: hvad spurgte kunden om, før de bestilte?" | Nothing | What the occasion page is missing |
| 8 | "Hvad skriver folk på kortet, og hvor langt plejer det at være?" | 200 characters | The card-message limit |
| 9 | "Når nogen ringer og bestiller: hvad spørger du om, og hvad sælger du ekstra? Til hvilken pris?" | No add-ons | The till screen fields, add-ons (11) |
| 10 | "Hvornår har nogen sidst bestilt til et bryllup eller en fest? Hvordan foregik det?" | Not offered online | Large orders online or by phone (6) |
| 11 | "Hvornår har nogen sidst villet bruge mere end den største størrelse?" | Three fixed tiers | A free amount above the top tier (5) |
| 12 | "Hvilken printer har du, eller har du adgang til en?" | Slip as email | Print layout: A4 or 80 mm (9) |

Write the answers into the open-questions list of the [first interview note](../process/2026-11-16-owner-interview.md), dated, and replace each placeholder in the system only after that.

## Part 3: Photos (about 5 min, facts only)

Content (photos, texts, real prices) is planned for the end of the build, with placeholders until then. Felix makes the photo plan himself. Ask only what the plan needs:

- "Hvor mange buketter laver du på en normal uge i december?" (Could real orders be photographed as they pass, rather than making bouquets for the camera?)
- "Har du et sted i butikken med godt dagslys og en fri væg eller et bord?" (Where a fixed photo corner could be.)
- "Må vi bruge dine Instagram- og Facebook-billeder midlertidigt, indtil de rigtige er taget?"

## After the session

- Answers into the first interview note (open questions), dated.
- New findings into the process note; any design change gets a decision-log entry before it is built.
- Placeholders replaced in the seed or, once it exists, in the back office.
