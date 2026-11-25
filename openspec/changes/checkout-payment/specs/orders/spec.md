## Purpose

What an order is and how it moves: its lines and totals, where it came from, its payment state, and how it holds the shop's capacity.

## ADDED Requirements

### Requirement: Prices come from the server
An order's line prices, delivery fee and total SHALL be calculated by the backend from the catalogue and delivery rules at the moment the order is created, in whole øre. Amounts sent by a browser SHALL be ignored.

#### Scenario: Tampered price
- **WHEN** a checkout request claims Mellem costs 1 kr.
- **THEN** the order is created at the catalogue price of Mellem

### Requirement: Orders record source and payment state
Every order SHALL record where it came from (web, telefon or butik) and its payment state: pending, paid, expired or refunded. There SHALL be no work states; the owner's pinboard is the work status (DD-17).

#### Scenario: Web order created
- **WHEN** a customer presses "Betal"
- **THEN** an order with source web and state pending exists

### Requirement: Paid only on confirmed payment
An order SHALL become paid only when the payment provider's signed notification confirms the payment. A notification that fails signature verification SHALL change nothing. The same notification received twice SHALL have the effect of one.

#### Scenario: Valid notification
- **WHEN** the provider sends a signed "payment completed" notification for a pending order
- **THEN** the order becomes paid

#### Scenario: Forged notification
- **WHEN** a notification arrives with an invalid signature
- **THEN** it is refused and no order changes

#### Scenario: Duplicate notification
- **WHEN** the same paid notification arrives twice
- **THEN** the order is paid once and the emails are sent once

### Requirement: Capacity is held while paying
A pending order SHALL count against its day's capacity and, for pickup, its slot, for as long as its payment can still complete, plus a short margin (about half an hour in all). When the payment expires or fails, the order SHALL become expired and stop counting. Checking capacity and creating the pending order SHALL be one step, so two customers cannot take the last place.

#### Scenario: Last place taken during payment
- **WHEN** one place is left on a day and a customer starts paying for it
- **THEN** a second customer is told the day is full until the first payment completes or expires

#### Scenario: Abandoned payment
- **WHEN** a customer leaves the payment page and the hold runs out
- **THEN** the order is expired and the place is offered again

### Requirement: Emails when an order is paid
When an order becomes paid, the buyer SHALL receive a confirmation with what was ordered, the delivery or pickup details, the total including moms and the shop's contact details, and the owner SHALL receive the order slip laid out for printing (DD-16). Each email SHALL be sent once per order.

#### Scenario: Paid order
- **WHEN** an order becomes paid
- **THEN** the buyer gets the confirmation and the owner gets the slip

### Requirement: Refunds are recorded
When the payment provider reports a full refund, the order SHALL become refunded and stop counting against capacity if its date has not passed.

#### Scenario: Refund before the day
- **WHEN** an order for Friday is refunded on Wednesday
- **THEN** the order is refunded and Friday has one place more
