# Spec Delta

## Purpose

Lets the florist run the webshop from her phone, between bouquets, without a computer. Covers sign-in, orders, product upkeep, budget tiers and capacity, and a sales overview. The back office must take less of her time than the phone orders it replaces.

## ADDED Requirements

### Requirement: Usable on a phone
Every back-office screen SHALL work at 390 px wide, one-handed. It SHALL use tap targets of at least 44 px and no hover-only actions, the same mobile rules as the storefront (P1).

#### Scenario: Owner works from her phone
- **WHEN** the owner opens any back-office screen on a 390 px wide phone
- **THEN** every action on it is reachable without horizontal scrolling or zooming

### Requirement: Protected sign-in
The back office SHALL only be reachable after the owner signs in with a second factor. No customer-facing page SHALL link to it.

#### Scenario: Not signed in
- **WHEN** someone opens a back-office address without a valid session
- **THEN** they see the sign-in screen and no shop data

#### Scenario: Second factor required
- **WHEN** the owner enters a correct password
- **THEN** she is asked for a second factor before any back-office screen opens

### Requirement: Orders sorted by delivery date
The order list SHALL open on today's deliveries and pickups, then upcoming days, sorted by delivery date, not by order time. Each row SHALL show the time window, the delivery or pickup type, the product or budget tier, and the status.

#### Scenario: Morning check
- **WHEN** the owner opens the back office
- **THEN** the first screen lists today's orders with how many there are, followed by tomorrow's

### Requirement: Order handling from one screen
An order's detail SHALL show everything needed to make and deliver it: the bouquet or budget and wishes, the card message, the recipient and address, and the buyer's contact. It SHALL let her change the status in one tap (new, being made, ready or out for delivery, delivered or picked up) and print a slip.

#### Scenario: Making the bouquet
- **WHEN** the owner opens an order
- **THEN** she sees the card message in full and can mark the order "I gang" with one tap

#### Scenario: Printing a slip
- **WHEN** the owner taps "Print seddel"
- **THEN** she gets a slip with recipient, address, date, window and card message

### Requirement: Quick product upkeep
The owner SHALL be able to add or edit a product from her phone: take or pick a photo, set name, price, category and sizes, and publish. Sold out and hidden SHALL be one-tap toggles in the product list.

#### Scenario: New product in under a minute
- **WHEN** the owner adds a product with a photo, a name, one price and a category
- **THEN** it can be published without filling in any other field

#### Scenario: Sold out for today
- **WHEN** the owner taps the sold-out toggle on a product in the list
- **THEN** the storefront shows it as sold out in words, without her opening the product

### Requirement: Categories managed in place
The owner SHALL be able to create, rename, reorder and hide categories. She SHALL be able to assign a product to a category while editing that product.

#### Scenario: New seasonal category
- **WHEN** the owner adds the category "Jul" while editing a product
- **THEN** the category exists and the product is in it, without leaving the product form

### Requirement: Budget tiers and daily capacity
The owner SHALL be able to set the budget bouquet tiers (price and short description), whether a free amount is allowed and its minimum, the number of orders she accepts per day, the order cut-off time, and closed days.

#### Scenario: Full day
- **WHEN** the orders for a date reach the daily capacity she set
- **THEN** the storefront no longer offers that date

#### Scenario: Closed day
- **WHEN** the owner marks a date as closed
- **THEN** customers cannot choose that date for delivery or pickup

### Requirement: Sales overview
The back office SHALL show what has sold: the number of orders and revenue incl. moms for today, this week and this month, and the most-sold products or tiers. It is an overview only. Accounting stays in her bookkeeping system.

#### Scenario: Weekly look
- **WHEN** the owner opens the sales overview
- **THEN** she sees this week's order count and revenue next to last week's
