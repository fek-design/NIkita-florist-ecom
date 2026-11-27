## ADDED Requirements

### Requirement: Wishes reach the owner
Each bouquet on an order SHALL keep its wish, if any, of at most 200 characters. The buyer's confirmation (email and page) and the owner's printed slip SHALL show each wish with its bouquet, so the owner never has to call back to learn it.

#### Scenario: Wish on the slip
- **WHEN** an order with the wish "Ingen liljer" on one bouquet is paid
- **THEN** the owner's slip shows "Ingen liljer" with that bouquet, and the buyer's confirmation shows it too

#### Scenario: Too long a wish
- **WHEN** checkout receives a wish of more than 200 characters
- **THEN** the order is refused with a problem on that bouquet, and nothing is stored
