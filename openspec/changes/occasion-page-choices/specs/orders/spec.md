## ADDED Requirements

### Requirement: Wishes reach the owner
Each bouquet on an order SHALL keep its wish, if any, of at most 200 characters. The buyer's confirmation (email and page) and the owner's printed slip SHALL show each wish with its bouquet, so the owner never has to call back to learn it.

#### Scenario: Wish on the slip
- **WHEN** an order with the wish "Ingen liljer" on one bouquet is paid
- **THEN** the owner's slip shows "Ingen liljer" with that bouquet, and the buyer's confirmation shows it too

#### Scenario: Too long a wish
- **WHEN** checkout receives a wish of more than 200 characters
- **THEN** the order is refused with a problem on that bouquet, and nothing is stored

### Requirement: A card is priced per bouquet
The server SHALL add the card price (20 kr., a shop setting) to each bouquet line that has a card message, multiplied by the line's quantity, and SHALL ignore any card price sent by the browser. The slip SHALL print each card text in a box marked for cutting out.

#### Scenario: Card charged once per bouquet
- **WHEN** an order has one bouquet with a card and one without
- **THEN** the order total includes one card price of 20 kr., and the payment page shows it

#### Scenario: Card text to cut out
- **WHEN** the owner prints the slip of an order with a card
- **THEN** the card text stands in its own box with a cutting line, apart from the rest of the slip
