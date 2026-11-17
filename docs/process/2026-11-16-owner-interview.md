# Owner interview: results

**Date recorded:** 16 Nov 2026 (interview held by Felix in week 1, notes relayed in conversation)
**Related:** [Roadmap](../../ref/Roadmap.md) · [Design rationale](../../ref/Design-Rationale.md) · [Back-office spec](../../openspec/specs/back-office/spec.md) · [Lo-fi concept C](../../ref/wireframes/lofi/c-anledninger.html)

## Goal

Settle the open questions from week 1 so the data model, the storefront and the scaffold can be planned.

## What was decided

| Topic | Answer | Effect |
|---|---|---|
| Storefront concept | **C, occasions** (Anledninger) | Navigation and products are organised by occasion. Concepts A and B are dropped |
| Products | **Occasion bouquets in budget tiers.** Each occasion is one product. Base tiers around 250, 350 and 500 kr., adjusted by about ±50 kr. per occasion | The catalogue is the list of occasions, not individual bouquets. The data model is occasion → tier with a price per tier |
| Going live | **Not live on her own domain by the end of the project.** The goal is a finished package she can take into use when her schedule allows | Roadmap assumption 2 is wrong: production payment and domain work move out of week 6. Week 6 hands over a demo-ready package plus a go-live guide |
| Delivery area | The town area, not only the town itself, "as long as it makes sense". Flat fee **80 kr.** | One delivery zone, one fee. The zone still needs to be written down as postcodes (open question 1) |
| Catalogue size | One product per occasion | Small catalogue (roadmap assumption 5 holds). No search or filtering needed |
| Admin users | **Only the owner** | One admin account. No roles or permissions |

## Effects on existing work

- **Roadmap assumption 2** (real business going live): answered *no, not within the project*. Cut from week 6: production payment account, own domain and DNS, live test purchase, soft launch. Added: a go-live guide in the handover.
- **Roadmap assumption 4** (local delivery): confirmed, flat fee.
- **Roadmap assumption 5** (small catalogue): confirmed.
- **Back-office spec:** the budget-tier screen becomes the main product screen. The "catalogue" model drops out; screens 4–5 (product list, edit product) become "occasions and their tiers".
- **Design rationale P2** (date first) still applies inside concept C: the delivery date is asked on the occasion page, before the cart.
- **Change `stack-and-scaffold`:** the live payment application (task 5.1) and the domain question are deferred. Test mode is enough.

## Example of the price model

Illustration only. The owner sets the real occasions and prices in the admin.

```
Occasion        Small   Medium   Large
Fødselsdag       250     350      500     (base)
Bisættelse       300     400      550     (base +50)
Bare fordi       200     300      450     (base -50)
```

## Follow-up answers (Felix, 16 Nov)

| Topic | Answer | Status |
|---|---|---|
| Delivery zone | 4300 Holbæk and surroundings ("omegn"), up to about 20–30 minutes' drive | Draft postcode list below, for the owner to confirm |
| Occasions | The example occasions are fine for now; the exact list is settled later | Placeholder |
| Cut-off, closed days, capacity | Use ordinary expected values for now | Placeholder defaults below, all changeable in the admin |
| Free amount | On hold | Owner question |
| Large orders (weddings, events) | Felix expects most people prefer the phone for these | Owner question |
| Pickup in the shop | **Yes, offered** | Decided. Opening hours still needed |
| Tier presentation | Felix leans towards both an example photo and a size in words per tier | To confirm with the owner (P6) |

### Draft delivery zone

Postcodes within roughly 20–30 minutes' drive of Holbæk, from general knowledge of the area. **Drive times are not measured.** The owner confirms or trims the list, and it stays editable in the admin.

| Postcode | Town |
|---|---|
| 4300 | Holbæk |
| 4390 | Vipperød |
| 4340 | Tølløse |
| 4350 | Ugerløse |
| 4360 | Kirke Eskilstrup |
| 4370 | Store Merløse |
| 4420 | Regstrup |
| 4440 | Mørkøv |
| 4450 | Jyderup |
| 4460 | Snertinge |
| 4520 | Svinninge |
| 4532 | Gislinge |
| 4540 | Fårevejle |
| 4550 | Asnæs |
| 4560 | Vig |

Outside the list, checkout offers pickup instead (P3).

### Placeholder defaults

Ordinary values for a small florist, to build and test against. They are *opinion*, not the owner's numbers, and each is a setting in the admin.

| Setting | Default |
|---|---|
| Same-day cut-off | Order before 12:00 for delivery the same day |
| Delivery days | Monday–Saturday |
| Closed days | Sundays and public holidays |
| Daily capacity | 15 orders per day (deliveries and pickups together) |
| Pickup | During opening hours, from the next working day or same day before cut-off |

## Open questions for the owner

1. **Delivery zone:** confirm or trim the draft postcode list.
2. **Opening hours** for pickup.
3. **Cut-off, closed days and daily capacity:** replace the placeholder defaults with her own numbers.
4. **Occasions:** the final list and the price adjustment for each.
5. **Free amount:** may a customer type their own amount above the top tier?
6. **Large orders:** should weddings and events be ordered online at all, or only by phone, with a "ring til mig" link?
7. **Tier presentation:** one example photo and a size in words per tier, as Felix suggests?

## How this was checked

Answers are as relayed by Felix on 16 Nov 2026. Nothing here is confirmed in writing by the owner yet. Placeholders let the build go ahead; open questions 1–3 must be answered before the checkout change in week 3 is finished.
