# v2 draft · 23 Nov 2026 (not frozen yet)

**Figma:** page "Hi-fi (arbejde → v2)". Becomes v2 in `docs/design/versions/v2/` once Felix has reviewed it. v1 is kept unchanged in `docs/design/versions/v1/`.

## Changes from v1, and why

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
| P1, P2, E1, E2 (new) | — | Order slip, morning sheet, pickup reminder email, monthly sales email | DD-16, DD-18 |

## Open

- Forslag 1 (hero line) and Forslag 2 (payment methods in the footer) wait for Felix.

- Opening hours and pickups per hour are placeholders (owner questions 2 and 8).
- Whether the owner buys a receipt printer (owner question 9).
- Checkout fields: a normal delivery now has seven fields including the not-home choice; Bisættelse adds the latest time, eight in all, which is Baymard's guide figure.
