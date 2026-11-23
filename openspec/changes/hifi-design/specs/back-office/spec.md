## ADDED Requirements

### Requirement: Orders arrive on paper
Every new order SHALL produce a printed order slip for the owner's pinboard, laid out for an 80 mm receipt printer: delivery or pickup, the date in large type, the latest time or pickup slot, the bouquet and size, the card message in a frame, the recipient and address, what to do if nobody is home, and the buyer's name and phone (DD-16). Until a receipt printer is installed, the order email to the owner SHALL carry the same slip so she can print it.

#### Scenario: New order without a receipt printer
- **WHEN** a customer pays for an order and no receipt printer is set up
- **THEN** the owner receives an email that prints as the order slip, without opening the back office

### Requirement: Morning sheet
At 7:00 on each delivery day the owner SHALL receive an A4 morning sheet listing the day's deliveries by postcode and pickups by time slot, with a box to tick for each (DD-16).

#### Scenario: Day with orders
- **WHEN** it is 7:00 on a day with three deliveries and two pickups
- **THEN** the morning sheet lists the three deliveries by postcode and the two pickups by slot

### Requirement: Monthly sales email
The owner SHALL receive the sales overview as an email on the first day of each month: the number of orders and revenue incl. moms for the month next to the month before, deliveries against pickups, and the most-sold occasions. It is an overview only; accounting stays in her bookkeeping system. The back office SHALL NOT need a sales screen (DD-16).

#### Scenario: New month
- **WHEN** a new month starts
- **THEN** the owner receives last month's orders and revenue next to the month before, without opening the back office

## MODIFIED Requirements

### Requirement: Protected sign-in
The back office SHALL only be reachable after the owner signs in with two factors. The main way SHALL be a passkey (Face ID or fingerprint on her phone), which counts as both factors (DD-20). Password plus a one-time code SHALL remain for a new phone and as the fallback. No customer-facing page SHALL link to the back office.

#### Scenario: Not signed in
- **WHEN** someone opens a back-office address without a valid session
- **THEN** they see the sign-in screen and no shop data

#### Scenario: Second factor required
- **WHEN** the owner enters a correct password
- **THEN** she is asked for a one-time code before any back-office screen opens

#### Scenario: Passkey
- **WHEN** the owner taps "Log ind med Face ID" on a phone where her passkey is set up
- **THEN** the "I dag" screen opens after one touch, with no password or code


### Requirement: Order handling from one screen
An order's detail SHALL show everything needed to make and deliver it: the bouquet or budget and wishes, the card message, the recipient and address, and the buyer's contact. It SHALL let her print the slip again. It SHALL NOT ask her to change a status: the slip on the pinboard is the status (DD-17).

#### Scenario: Making the bouquet
- **WHEN** the owner opens an order
- **THEN** she sees the card message in full, and there is no status to change

#### Scenario: Printing a slip
- **WHEN** the owner taps "Print sedlen igen"
- **THEN** she gets the order slip again, with recipient, address, date, latest time or pickup slot, and card message

## REMOVED Requirements

### Requirement: Sales overview
**Reason**: The owner prefers paper and as little screen time as possible (DD-16); a weekly screen would not be opened.
**Migration**: Replaced by "Monthly sales email", which brings the same figures to her inbox on the first of each month.
