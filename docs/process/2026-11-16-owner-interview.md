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

## Open questions for the owner

1. **Delivery zone as postcodes.** Which postcodes count as "the town area"? Checkout needs a fixed list to check against (P3).
2. **Which occasions**, and the price adjustment for each.
3. **Cut-off time** for same-day and next-day orders, and **closed days**.
4. **Daily capacity:** how many orders a day she can make, if she wants a limit.
5. **Free amount:** may a customer type their own amount above the top tier, or only pick a tier? (Back-office spec: "whether a free amount is allowed and its minimum".)
6. **Pickup in the shop:** offered alongside delivery, and with which opening hours?
7. **What a tier means to the customer:** one example photo per tier, a size in words ("ca. 40 cm"), or both (P6)?

## How this was checked

Answers are as relayed by Felix on 16 Nov 2026. Nothing here is confirmed in writing by the owner yet. Open questions 1–3 block the checkout change in week 3.
