## 1. Groundwork

- [x] 1.1 Record the process change in CLAUDE.md and as DD-15; verify the rule names the pattern sources and versioning — *23 Nov*
- [x] 1.2 Read Felix's competitor boards and the public Baymard and Polaris sources; write the front page analysis and per-screen decisions in design.md; verify every element names a source or is marked "Forslag" — *23 Nov*
- [x] 1.3 Start `docs/process/2026-11-23-hifi-design.md`; verify it links this change and design.md links it

## 2. Figma set (storefront)

- [ ] 2.1 Create the Figma page "Hi-fi (arbejde)" with shared components: button primary/secondary, input with label, tier picker, choice button, row, card, navbar, footer; verify they use the brand values
- [ ] 2.2 S1 front page from Felix's frame with the analysis changes marked; verify every difference is a decision or a marked proposal
- [ ] 2.3 S2 menu and S3 category page; verify against design.md
- [ ] 2.4 S4 occasion page and S4b out-of-area state; verify against design.md
- [ ] 2.5 S5 added-to-cart, S6 cart, S7 checkout, S8 confirmation; verify the checkout has at most eight fields

## 3. Figma set (back office)

- [ ] 3.1 B1 sign-in, B2 orders, B3 order detail; verify against the back-office spec scenarios
- [ ] 3.2 B4 occasions, B5 edit occasion, B6 delivery and capacity, B7 sales; verify against the back-office spec scenarios

## 4. Review and version

- [ ] 4.1 Export the set to `docs/design/hifi/` with a source list per screen; verify every 44 px rule and contrast pair against the brand guide
- [ ] 4.2 Felix reviews; his changes are made and logged as decisions; verify the proposals are each accepted or dropped
- [x] 4.3 Freeze v1: Figma page "v1", PNGs in `docs/design/versions/v1/`, changelog; verify v1 matches the approved set — *23 Nov: frozen early, before Felix's full review, because the owner's way of working changes the back office (DD-16, DD-17)*

## 5. v2: the owner works on paper

- [x] 5.1 Decide how customers learn when a pickup is ready and when a delivery comes, with no action from the owner — *23 Nov: pickup slots with an automatic morning email (DD-18); delivery during the day with not-home instructions and a latest time for Bisættelse (DD-19)*
- [x] 5.1b Storefront for DD-18/DD-19: pickup slots on the occasion page, not-home choice and latest time in checkout, confirmation text, pickup reminder email; verify the checkout still has at most eight fields for a normal delivery
- [x] 5.2 Design the order slip at 80 mm (receipt printer) and the same slip as the order email; verify every field the owner needs to make and deliver is on it
- [x] 5.3 Design the 7:00 morning sheet (A4); verify it lists deliveries and pickups for the day
- [x] 5.4 Reduce the back office to the exceptions (sold out today, closed today, settings set at hand-over, sales as a monthly email); verify against DD-16/DD-17
- [x] 5.5 Write the back-office spec delta (statuses removed, slips and morning sheet added); verify `openspec validate --strict`
- [ ] 5.6 Felix reviews v2 (`docs/design/hifi/draft-2026-11-23-v2/`); then freeze v2 with its changelog
- [ ] 5.7 Add pickup slots (DD-18) and the not-home choice and latest time (DD-19) to the storefront spec (occasion page) and the checkout spec (week 3); verify `openspec validate --strict`
