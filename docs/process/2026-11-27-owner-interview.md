# Owner interview 2: first look at the built shop

**Date:** 27 Nov 2026, video call (screen share), Felix with the owner
**Guide:** [2026-11-27-owner-interview-guide.md](../research/2026-11-27-owner-interview-guide.md)
**Related:** [first interview and open questions](2026-11-16-owner-interview.md) · [decision log](../design-decisions.md) · change `occasion-page-choices`

## Goal

Show the owner the built shop and her side of an order (email, slip, back office in Figma), and get the numbers that are placeholders in the system.

## How it went

The transcription started partway in, during the colour discussion; the record below is from Felix's transcript, summarised. Personal details unrelated to the shop are left out on purpose. The screen share dropped several times, so parts of the back office were described rather than shown. The customer flow was not tested on her, as planned; that goes to the test persons.

## What she said, and what it changes

| Topic | Her answer | Changes | Status |
|---|---|---|---|
| **Colours** | Not fond of black and white, "ikke så god til kridhvid". Would be happy with the background toned towards a very light sand or beige. On seeing more pages she noted the background is not pure white next to a white box. | Paper (`#F7F4EF`) and Ink (`#2D2A26`): a warmer, more beige ground is a brand-palette change, Felix's call (brand guide: palette not changed without him). Contrast must be rechecked. | **Open, Felix decides** |
| **Logo** | Fine with the redrawn logo (licence) and with the phone number moved off it. | None | Settled |
| **Card** | **20 kr. per card, per bouquet.** Asks how the card text prints: at Interflora the paper lets her cut out a square to put in the card. | The card becomes a priced choice (20 kr.) per bouquet, priced on the server; the slip should print the card text in a box she can cut out. | Into `occasion-page-choices` |
| **Wishes** | Free hand "relatively often"; she follows wishes "i det omfang jeg kan" and suggested the shop says so. | Confirms the wish field and its wording. | Into `occasion-page-choices` |
| **Daily capacity** | Realistically **5 deliveries a day**: she drives them herself and has no staff. Could bind more; the driving is the limit. For funerals she would allow **10** (one place). | Daily capacity placeholder 15 → 5. A separate, higher limit for funeral orders is a new rule (capacity per occasion or per delivery type). | 5: to set. Funeral limit: **open, Felix decides scope** |
| **Same-day delivery** | Orders should come **the day before**. | No same-day delivery; the earliest delivery day is tomorrow. Today's rule (cut-off 12:00 for same day) changes. | To set (rule change) |
| **Delivery time** | Varies, morning or afternoon; if a time must be stated, 9–17. | Keep "i løbet af dagen" (DD-19). | Settled |
| **Pickup hours** | Self-service around the clock; write **9–18**. Needs some time to prepare orders. | Opening hours placeholder (Mon–Fri 10–17, Sat 10–14) → 9–18. Whether that is every day, and how much notice a pickup needs, to confirm. | Partly settled |
| **Printing** | Liked the idea that the system **prints by itself** when an order comes in (and the slip goes on the pinboard, "lidt ligesom hos Interflora"). | Open question 9 moves from "one click per order" towards automatic printing on arrival. Needs a computer or a small print setup in the shop; printer model still unknown. | **Open: printer, setup** |
| **Add-ons** | **Aalborg Chokolade**, two boxes she nearly always has: **100 kr.** and **120 kr.** | Add-ons can be specified (two chocolate boxes). Photos of the boxes on 7 Dec. | Ready for a later change |
| **Back office** | Liked entering phone orders herself and having them print ("det er smart"). | Confirms the till (DD-21). | Settled |
| **Photos** | Will buy flowers for one Christmas bouquet, bound as small, medium and large, plus a **bårebuket** (funeral spray) for Bisættelse, and a cover picture. Has photos of her own as well. | Photo day: **Monday 7 Dec, about 10:00**, at the shop. Felix brings laptop and camera; she can pick him up at the station (Felix to send train times). Also photograph the chocolate boxes. | Planned |
| **Consent** | Felix may use the project as a case on his own website, with her name. | Portfolio use is agreed. | Settled |

## Not answered (still placeholders)

Delivery postcodes (question 1), pickups per hour (5), occasions and prices (6), what Messenger customers ask (7), two bouquets to one recipient (8a), large orders (10), a free amount (11), the printer model (12). To ask by message or on 7 Dec.

## Dead ends and surprises

- The colour concern was unexpected: the palette was built from her liking for paper (brand guide). What reads as "paper" on Felix's screen read as white on hers; screens differ, and she softened her view once she compared it with a truly white box.
- In the call Felix gave "around 7 December" as when he needs things gathered. The roadmap's hand-in is around 20 December. To confirm which date the photo day must serve.
