# catalog Specification

## Purpose
Holds the shop's catalogue (occasions sold in three priced tiers) and its delivery rules, and serves them read-only to the storefront, so that every page and the later checkout work from one source of prices and rules.

## Requirements

### Requirement: Occasions are sold in three tiers
Every occasion SHALL have exactly three tiers, Lille, Mellem and Stor, in that order. Each tier SHALL have its own price, stored as whole øre including moms, and a size or description in words. Prices SHALL be greater than zero, and each tier SHALL cost more than the one before it.

#### Scenario: Occasion with its tiers
- **WHEN** the storefront requests a visible occasion
- **THEN** the response contains three tiers in the order Lille, Mellem, Stor, each with a price in øre and a size in words

#### Scenario: Incomplete occasion is not offered
- **WHEN** an occasion has fewer than three tiers, or a tier with no price
- **THEN** it does not appear in the list and its address answers as not found

#### Scenario: Prices rise with size
- **WHEN** someone tries to save a tier price that is not higher than the smaller tier's price
- **THEN** the database refuses it

### Requirement: Only visible occasions reach customers
The list of occasions SHALL contain only occasions marked visible, in the owner's sort order. Each entry SHALL carry its name, address, intro, lowest price, main photo if there is one, and whether it is sold out. A sold-out occasion SHALL still be listed, marked as sold out.

#### Scenario: Hidden occasion
- **WHEN** an occasion is marked hidden
- **THEN** it is missing from the list and its address answers as not found

#### Scenario: Sold out
- **WHEN** an occasion is marked sold out
- **THEN** it stays in the list with a sold-out flag, so the storefront can say so in words

#### Scenario: Unknown address
- **WHEN** the storefront requests an occasion address that does not exist
- **THEN** the API answers 404 with no other data

### Requirement: Photos belong to occasions
An occasion MAY have photos. Each photo SHALL have an address, alt text in Danish and a role: main, scale (showing the size) or detail. The occasion response SHALL return its photos main first.

#### Scenario: Occasion without photos
- **WHEN** an occasion has no photos yet
- **THEN** the API returns an empty photo list and the occasion is still shown

### Requirement: Delivery rules come from settings
The API SHALL publish the delivery rules customers need: the delivery fee, the same-day cut-off time, the weekdays with delivery, the specific closed dates from today on, whether pickup is offered, and the opening hours. The daily capacity SHALL NOT be published.

#### Scenario: Rules for the storefront
- **WHEN** the storefront requests the delivery rules
- **THEN** it receives the fee in øre, the cut-off as a time of day in Danish time, the delivery weekdays, upcoming closed dates, pickup on or off, and opening hours, and no capacity figure

### Requirement: Postcode check before checkout
The API SHALL answer whether the shop delivers to a given Danish postcode, and at what fee, so customers learn it before checkout (P3). Pickup in the shop is a choice of its own, not only a fallback: every answer SHALL also say whether pickup is offered, inside the zone as well as outside it (Felix, 19 Nov: "we deliver to Holbæk omegn for 80 kr. and we also do pickup in the shop").

#### Scenario: Inside the zone
- **WHEN** a customer checks 4300
- **THEN** the answer is: delivery possible, town Holbæk, fee 8000 øre, and pickup offered

#### Scenario: Outside the zone
- **WHEN** a customer checks 8000
- **THEN** the answer is: no delivery, pickup offered

#### Scenario: Not a postcode
- **WHEN** the value is not four digits
- **THEN** the API answers 400 and names the problem

### Requirement: Placeholder data is marked
Every occasion, price, postcode and setting that has not been confirmed by the owner SHALL be marked as a placeholder, and the API SHALL pass that mark on, so previews can show it and nothing unconfirmed goes live unnoticed.

#### Scenario: Seeded data
- **WHEN** the database is seeded from scratch
- **THEN** every seeded occasion, postcode and the settings row carry the placeholder mark

#### Scenario: Seeding twice
- **WHEN** the seed is run on a database that already holds the seed data
- **THEN** no row is duplicated and rows the owner has confirmed are left unchanged
