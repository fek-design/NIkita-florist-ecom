# v2 · 23 Nov 2026

**Figma:** page "v2 · 23. nov. (ejeren arbejder på papir)" · **Images:** [storefront.png](storefront.png), [back-office.png](back-office.png), [paper-and-email.png](paper-and-email.png)
**Before:** [v1](../v1/CHANGELOG.md) · **Working draft history:** [docs/design/hifi/draft-2026-11-23-v2/](../../hifi/draft-2026-11-23-v2/README.md)

## What caused it

Not a test round yet: the owner's way of working, relayed by Felix on 23 Nov. She works on paper and a pinboard, treats technology as a medium, and wants as little screen time as possible. v2 moves the back office onto paper and gives customers fixed promises instead of messages the owner has to send.

## Changes from v1

| Where | v1 | v2 | Caused by |
|---|---|---|---|
| Order handling | Phone list with statuses, one-tap "Markér som i gang" | Printed slip per order (80 mm receipt layout, emailed until a printer exists) + 7:00 morning sheet; no statuses | Owner works on paper and a pinboard (DD-16, DD-17) |
| B2 | "Ordrer" with status badges | "I dag": read-only list, "Luk for bestillinger i dag", reprint button | DD-16, DD-17 |
| B3 | Status badge and status button | Removed; "Print sedlen igen" | DD-17 |
| B7 Salg | Screen (not built) | E2 monthly email | DD-16 |
| Tab bar | Ordrer · Anledninger · Levering · Salg | I dag · Anledninger · Levering | Fewer places to look |
| S4c (new) | Pickup had no time | Pickup in one-hour slots, full slots struck through, morning reminder | Felix: no long waiting windows (DD-18) |
| S7 | No instructions for delivery | "Hvis modtageren ikke er hjemme" (3 choices); "Skal være fremme senest kl." for Bisættelse | DD-19 |
| S8 | "i løbet af dagen" only | Adds the latest time and the not-home choice | DD-19 |
| B1, B1b | Title only | Sign-in with email and password, "Husk mig i 30 dage", Face ID (passkey) first; password + "Husk mig i 30 dage" + 6-digit SMS code (B1b) as fallback | Back-office spec (second factor); DD-20 |
| B8a, B8b (new) + "+ Ny ordre" on B2 | — | Register shop and phone orders like a till; phone = pickup only; prints the same slip | Felix: orders outside the webshop must be tracked (DD-21) |
| P1, P2, E1, E2 (new) | — | Order slip, morning sheet, pickup reminder email, monthly sales email | DD-16, DD-18 |
| Forslag 1–4 | Yellow proposals | Decided (DD-22): intro line now leads into the recommended bouquet; payment methods in the footer; add-ons approved but waiting for the catalogue; passkey (DD-20) | Felix |
| B4 | No control of the front page | "På forsiden nu" with "Skift": the owner picks the featured bouquet | DD-23 |

## Decided during v2

DD-16 paper slips and morning sheet · DD-17 pinboard as status · DD-18 pickup slots · DD-19 delivery during the day · DD-20 passkey · DD-21 shop and phone orders like a till · DD-22 the four proposals · DD-23 everyday content editable by the owner.

## Open, carried into v3

- Add-ons need products in the catalogue (DD-22); not forgotten: task in `hifi-design`.
- All owner questions are held for the owner's first test of the built shop (Felix, 23 Nov); placeholders are marked until then.
- v3 will be caused by that test.
