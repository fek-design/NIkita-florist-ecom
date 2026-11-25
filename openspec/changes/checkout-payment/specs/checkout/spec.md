## Purpose

The customer's way from the cart to a paid order: the checkout form, its checks, the move to the payment provider and back, and the confirmation.

## ADDED Requirements

### Requirement: Guest checkout with only what fulfilment needs
The checkout SHALL ask for no account or login (P4). It SHALL collect the buyer's name, email and phone, and for delivery the recipient's name, address and an optional phone, plus what to do if nobody is home (by the door, with a neighbour, or call the buyer). The postcode and the delivery or pickup choice SHALL come from the cart and be shown, not asked again.

#### Scenario: Delivery checkout
- **WHEN** a customer with a delivery to 4300 opens the checkout
- **THEN** the form shows 4300 Holbæk as chosen and asks for buyer, recipient and what to do if nobody is home, without asking them to log in

#### Scenario: Pickup checkout
- **WHEN** a customer with a pickup opens the checkout
- **THEN** the form asks only for the buyer's details and shows the chosen pickup day and slot

### Requirement: Latest time for Bisættelse
For a Bisættelse delivery the checkout SHALL ask by what time the flowers must arrive (DD-19). The time SHALL appear on the order.

#### Scenario: Funeral time given
- **WHEN** a customer orders Bisættelse for delivery and enters 12:30
- **THEN** the order records that it must arrive by 12:30

### Requirement: Email checked before payment
The checkout SHALL suggest a correction when the email domain looks like a typo of a common domain, SHALL require the email a second time and refuse to continue while the two differ, and SHALL show the email in the summary before payment (DD-25).

#### Scenario: Likely typo
- **WHEN** a customer types `mette@gmial.com`
- **THEN** the form asks "Mente du mette@gmail.com?" and lets them accept or keep it

#### Scenario: Repeat does not match
- **WHEN** the repeated email differs from the first
- **THEN** the customer cannot continue and the message under the field says the two must match

### Requirement: Summary and legal note before paying
Before payment the checkout SHALL show the bouquets, the delivery or pickup with date, slot or latest time, the delivery fee, and the total including moms, as calculated by the server. It SHALL state in plain words that fresh flowers are exempt from the right of withdrawal and link the terms (P12).

#### Scenario: Total matches the charge
- **WHEN** the customer presses "Betal 480 kr."
- **THEN** the amount charged by the payment provider is 480 kr.

### Requirement: Payment on the provider's page
Pressing "Betal" SHALL send the customer to the payment provider's hosted page offering MobilePay and cards, and bring them back to the shop afterwards. No card details SHALL pass through the shop's servers.

#### Scenario: Paying with MobilePay
- **WHEN** the customer chooses MobilePay on the payment page and approves in the app
- **THEN** they return to the shop's confirmation page

#### Scenario: Customer cancels
- **WHEN** the customer leaves the payment page without paying
- **THEN** they can return to the checkout with their details kept, and no paid order exists

### Requirement: Confirmation page shows the paid order
After payment the confirmation page (S8) SHALL show the order number, what was ordered, the delivery or pickup with date and address or slot, the email the confirmation was sent to, and how to reach the shop. It SHALL show the order as paid only once the payment is confirmed by the provider, and a waiting message until then.

#### Scenario: Back before the confirmation arrives
- **WHEN** the customer returns from the payment page before the provider has confirmed the payment
- **THEN** the page says the payment is being confirmed and updates when it is

#### Scenario: Another order's page
- **WHEN** someone opens a confirmation link with a changed order reference
- **THEN** they see no order details
